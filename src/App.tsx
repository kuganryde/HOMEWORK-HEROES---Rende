import React, { useState, useEffect } from 'react';
import { User, UserRole, Homework, HomeworkRecord, HomeworkStatus, Student, HomeworkPriority } from '@/types';
import { MOCK_USERS, SCHOOL_INFO, MOCK_STUDENTS, RANKS } from '@/constants';
import Layout from '@/components/Layout';
import AIAssistant from '@/components/AIAssistant';
import TeacherDashboard from '@/pages/TeacherDashboard';
import ParentDashboard from '@/pages/ParentDashboard';
import Messages from '@/pages/Messages';
import Settings from '@/pages/Settings';
import { LogIn, GraduationCap, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getCurrentFestival } from '@/services/FestivalService';
import FestivalGraphic from '@/components/FestivalGraphic';
import BirthdayCelebration from '@/components/BirthdayCelebration';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [appTheme, setAppTheme] = useState<string>('default');
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [records, setRecords] = useState<HomeworkRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  const festival = getCurrentFestival();

  // Network listener
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Birthday check
  const today = new Date();
  const todayMD = `${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
  const birthdayStudent = students.find(s => s.birthday?.endsWith(todayMD));

  // Simulation: Load data from "Firebase" (LocalStorage)
  useEffect(() => {
    const savedHomework = localStorage.getItem('bmc_homework');
    const savedRecords = localStorage.getItem('bmc_records');
    const savedStudents = localStorage.getItem('bmc_students');
    
    const loadMessages = () => {
      const savedMessages = localStorage.getItem('bmc_messages');
      if (savedMessages) setMessages(JSON.parse(savedMessages));
    };

    if (savedHomework) setHomeworks(JSON.parse(savedHomework));
    if (savedRecords) setRecords(JSON.parse(savedRecords));
    loadMessages();

    if (savedStudents) {
      setStudents(JSON.parse(savedStudents));
    } else {
      setStudents(MOCK_STUDENTS);
      localStorage.setItem('bmc_students', JSON.stringify(MOCK_STUDENTS));
    }

    window.addEventListener('messages_updated', loadMessages);
    return () => window.removeEventListener('messages_updated', loadMessages);
  }, []);

  const addHomework = (h: Omit<Homework, 'id'>) => {
    const newHomework = { ...h, id: `hw-${Date.now()}` };
    const updated = [newHomework, ...homeworks];
    setHomeworks(updated);
    localStorage.setItem('bmc_homework', JSON.stringify(updated));
    
    const newRecords = h.targetStudentIds.map(sid => ({
      homeworkId: newHomework.id,
      studentId: sid,
      status: HomeworkStatus.PENDING,
      acknowledged: false,
      lastUpdated: new Date().toISOString()
    }));
    const updatedRecords = [...newRecords, ...records];
    setRecords(updatedRecords);
    localStorage.setItem('bmc_records', JSON.stringify(updatedRecords));
  };

  const updateHomeworkStatus = (hid: string, sid: string, status: HomeworkStatus, ack: boolean) => {
    const homework = homeworks.find(h => h.id === hid);
    const oldRecord = records.find(r => r.homeworkId === hid && r.studentId === sid);
    
    const updatedRecords = records.map(r => 
      (r.homeworkId === hid && r.studentId === sid) 
        ? { ...r, status, acknowledged: ack, lastUpdated: new Date().toISOString() } 
        : r
    );
    setRecords(updatedRecords);
    localStorage.setItem('bmc_records', JSON.stringify(updatedRecords));

    // Award XP if status changed to COMPLETED
    if (status === HomeworkStatus.COMPLETED && oldRecord?.status !== HomeworkStatus.COMPLETED && homework) {
      const xpGain = homework.priority === HomeworkPriority.HIGH ? 200 : homework.priority === HomeworkPriority.MEDIUM ? 100 : 50;
      
      const updatedStudents = students.map(s => {
        if (s.id === sid) {
          const newXp = s.xp + xpGain;
          let newRank = s.rank;
          // Calculate new rank
          for (let i = RANKS.length - 1; i >= 0; i--) {
            if (newXp >= RANKS[i].minXp) {
              newRank = RANKS[i].level;
              break;
            }
          }
          return { ...s, xp: newXp, rank: newRank };
        }
        return s;
      });
      setStudents(updatedStudents);
      localStorage.setItem('bmc_students', JSON.stringify(updatedStudents));
    }
  };

  const proposeStudentUpdate = (sid: string, updates: { name: string, class: string, birthday?: string }) => {
    const updated = students.map(s => 
      s.id === sid 
        ? { ...s, pendingUpdate: { ...updates, requestDate: new Date().toISOString() } } 
        : s
    );
    setStudents(updated);
    localStorage.setItem('bmc_students', JSON.stringify(updated));
  };

  const createStudentRequest = (newStudent: Omit<Student, 'id' | 'pendingUpdate'>) => {
      const newSid = `s-${Date.now()}`;
      const student: Student = {
          ...newStudent,
          id: newSid,
          name: "Pending Approval",
          class: "Pending Approval",
          xp: 0,
          rank: 1,
          pendingUpdate: {
              name: newStudent.name,
              class: newStudent.class,
              birthday: newStudent.birthday,
              requestDate: new Date().toISOString()
          }
      };
      const updated = [...students, student];
      setStudents(updated);
      localStorage.setItem('bmc_students', JSON.stringify(updated));
  };

  const handleApproveUpdate = (sid: string, approved: boolean) => {
    let updated = students.map(s => {
      if (s.id === sid && s.pendingUpdate) {
        if (approved) {
          return {
            ...s,
            name: s.pendingUpdate.name,
            class: s.pendingUpdate.class,
            birthday: s.pendingUpdate.birthday || s.birthday,
            pendingUpdate: undefined
          };
        } else {
          return { ...s, pendingUpdate: undefined };
        }
      }
      return s;
    });

    // Clean up rejected new students
    if (!approved) {
      updated = updated.filter(s => !(s.id === sid && s.name === "Pending Approval"));
    }

    setStudents(updated);
    localStorage.setItem('bmc_students', JSON.stringify(updated));
  };

  const deleteStudent = (sid: string) => {
    const updated = students.filter(s => s.id !== sid);
    setStudents(updated);
    localStorage.setItem('bmc_students', JSON.stringify(updated));
  };

  const updateUserProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      // In a real app, we'd update the mock users or a database
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 gap-6">
        
        {/* Login Screen Banner */}
        <div className="w-full max-w-lg md:max-w-xl hero-glow-wrapper shadow-xl shadow-red-500/10">
          <div className="hero-glow-content flex items-center justify-center bg-transparent">
            <img src="https://i.ibb.co/9Hx5SWTG/Web-Banner.png" alt="Announcement Banner" className="w-full h-auto object-contain" />
          </div>
        </div>

        <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col items-center">
          <div className="w-full bmc-red p-10 text-center text-white relative">
            <div className="absolute top-4 right-4 text-xs font-bold bmc-yellow text-slate-900 px-3 py-1 rounded-full uppercase">
              BBD4065
            </div>
            <img 
              src={SCHOOL_INFO.logoUrl} 
              alt="Logo" 
              className="w-32 h-32 mx-auto mb-6 drop-shadow-[0_10px_15px_rgba(0,0,0,0.4)] object-contain" 
            />
            <h1 className="text-2xl font-black">{SCHOOL_INFO.name}</h1>
            <p className="text-white/70 text-sm mt-2 font-medium">Homework Hero synchronization Portal</p>
          </div>
          
          <div className="p-10 w-full space-y-8">
            <h2 className="text-2xl font-black text-center text-slate-900">Who are you logging in as?</h2>
            <div className="grid grid-cols-1 gap-5">
              <button 
                onClick={() => setUser(MOCK_USERS[0])}
                className="group flex items-center gap-6 p-7 rounded-[32px] bg-white border-2 border-slate-100 hover:border-bmc-red hover:shadow-xl hover:shadow-red-100 transition-all text-left active:scale-[0.98]"
              >
                <div className="p-5 bg-red-50 text-bmc-red rounded-2xl group-hover:scale-110 transition-transform shadow-sm">
                  <GraduationCap size={40} />
                </div>
                <div>
                  <p className="font-black text-xl text-slate-900">I'm a Teacher</p>
                  <p className="text-sm text-slate-600 font-medium mt-1">Manage homework & track student progress.</p>
                </div>
              </button>

              <button 
                onClick={() => setUser(MOCK_USERS[1])}
                className="group flex items-center gap-6 p-7 rounded-[32px] bg-white border-2 border-slate-100 hover:border-bmc-blue hover:shadow-xl hover:shadow-blue-100 transition-all text-left active:scale-[0.98]"
              >
                <div className="p-5 bg-blue-50 text-bmc-blue rounded-2xl group-hover:scale-110 transition-transform shadow-sm">
                  <LogIn size={40} />
                </div>
                <div>
                  <p className="font-black text-xl text-slate-900">I'm a Parent/Student</p>
                  <p className="text-sm text-slate-600 font-medium mt-1">View tasks, update progress & AI support.</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          {(() => {
            switch (activeTab) {
              case 'dashboard':
                return user.role === UserRole.TEACHER 
                  ? <TeacherDashboard 
                      user={user} 
                      homeworks={homeworks} 
                      records={records} 
                      onAddHomework={addHomework} 
                      students={students}
                      onApproveStudent={handleApproveUpdate}
                    />
                  : <ParentDashboard 
                      user={user} 
                      homeworks={homeworks} 
                      records={records} 
                      onUpdateStatus={updateHomeworkStatus} 
                      students={students}
                      onNavigateToMessages={() => setActiveTab('messages')}
                    />;
              case 'homework':
                return user.role === UserRole.TEACHER 
                  ? <TeacherDashboard 
                      user={user} 
                      homeworks={homeworks} 
                      records={records} 
                      onAddHomework={addHomework} 
                      students={students}
                      onApproveStudent={handleApproveUpdate}
                    />
                  : <ParentDashboard 
                      user={user} 
                      homeworks={homeworks} 
                      records={records} 
                      onUpdateStatus={updateHomeworkStatus} 
                      students={students}
                      onNavigateToMessages={() => setActiveTab('messages')}
                    />;
              case 'assistant':
                return <AIAssistant 
                  context={`The user is a ${user.role} in Homework Hero BMC. There are currently ${homeworks.length} homework tasks.`} 
                  student={user.role === UserRole.PARENT ? students.find(s => s.parentId === user.id) : students.find(s => s.id === user.id)}
                  updateStudent={(updatedStudent) => {
                    const updated = students.map(s => s.id === updatedStudent.id ? updatedStudent : s);
                    setStudents(updated);
                    localStorage.setItem('bmc_students', JSON.stringify(updated));
                  }}
                  userRole={user.role}
                />;
              case 'messages':
                return <Messages user={user} />;
              case 'settings':
                return (
                  <Settings 
                    user={user} 
                    students={students} 
                    onProposeUpdate={proposeStudentUpdate} 
                    onCreateRequest={createStudentRequest}
                    onDeleteStudent={deleteStudent}
                    onUpdateProfile={updateUserProfile}
                  />
                );
              default:
                return <div>Tab under construction</div>;
            }
          })()}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <>
      <Layout 
        user={user} 
        onLogout={() => setUser(null)} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        festivalTheme={festival?.themeColor}
        appTheme={appTheme}
        setAppTheme={setAppTheme}
        hasUnreadMessages={messages.some(m => !m.read && m.receiverId === user.id)}
      >
        {isOffline && (
          <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-800 p-4 mb-6 rounded-r-xl flex items-center shadow-sm">
            <WifiOff className="mr-3 text-amber-500" size={24} />
            <div>
              <p className="font-bold">You are currently offline</p>
              <p className="text-sm">The app is using cached data. Your changes will sync when you regain connection.</p>
            </div>
          </div>
        )}
        {renderContent()}
        <FestivalGraphic />
        {birthdayStudent && <BirthdayCelebration studentName={birthdayStudent.name} />}
      </Layout>
    </>
  );
};

export default App;