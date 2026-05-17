import React, { useState } from 'react';
import { User, Student, UserRole } from '@/types';
import { User as UserIcon, Plus, Save, ShieldCheck, History, Edit3, Trash2, ShieldAlert, Mail, Briefcase, School, Heart, Settings as SettingsIcon } from 'lucide-react';
import BMCHeritage from './BMCHeritage';
import { motion, AnimatePresence } from 'motion/react';
import { SCHOOL_INFO } from '@/constants';

interface SettingsProps {
  user: User;
  students: Student[];
  onProposeUpdate: (sid: string, updates: { name: string, class: string }) => void;
  onCreateRequest: (student: Omit<Student, 'id' | 'pendingUpdate'>) => void;
  onDeleteStudent: (sid: string) => void;
  onUpdateProfile: (updates: Partial<User>) => void;
}

const Settings: React.FC<SettingsProps> = ({ user, students, onProposeUpdate, onCreateRequest, onDeleteStudent, onUpdateProfile }) => {
  const isTeacher = user.role === UserRole.TEACHER;
  const [activeSubTab, setActiveSubTab] = useState<'account' | 'heritage'>('account');
  const myStudents = students.filter(s => s.parentId === user.id);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', class: '', birthday: '' });
  
  // Teacher profile state
  const [profileData, setProfileData] = useState({ 
    name: user.name, 
    email: user.email,
    subjects: user.subjects?.join(', ') || '',
    classes: user.classes?.join(', ') || ''
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // School Information state
  const [isEditingSchool, setIsEditingSchool] = useState(false);
  const [schoolData, setSchoolData] = useState({
    name: SCHOOL_INFO.name,
    code: SCHOOL_INFO.code,
    location: SCHOOL_INFO.location,
    category: SCHOOL_INFO.category
  });

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const startEdit = (s: Student) => {
    setEditingStudentId(s.id);
    setFormData({ name: s.name, class: s.class, birthday: s.birthday || '' });
    setShowAddForm(false);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudentId) {
      onProposeUpdate(editingStudentId, formData);
      setSuccessMsg("Profile update sent for teacher approval!");
    } else {
      onCreateRequest({ ...formData, parentId: user.id, xp: 0, rank: 1, aiLogs: [] });
      setSuccessMsg("New student registration sent for teacher approval!");
    }
    setEditingStudentId(null);
    setShowAddForm(false);
    setFormData({ name: '', class: '', birthday: '' });
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updates: Partial<User> = {
      name: profileData.name,
      email: profileData.email,
      subjects: profileData.subjects.split(',').map(s => s.trim()).filter(s => s),
      classes: profileData.classes.split(',').map(c => c.trim()).filter(c => c)
    };
    onUpdateProfile(updates);
    setIsEditingProfile(false);
    setSuccessMsg("Your profile has been updated successfully!");
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  const handleSaveSchoolInfo = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedInfo = { ...SCHOOL_INFO, ...schoolData };
    localStorage.setItem('school_info', JSON.stringify(updatedInfo));
    setIsEditingSchool(false);
    setSuccessMsg("School information has been updated successfully!");
    setTimeout(() => {
      setSuccessMsg(null);
      window.location.reload();
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Sub-navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-200/50 rounded-2xl w-fit mx-auto md:mx-0">
        <button
          onClick={() => setActiveSubTab('account')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${
            activeSubTab === 'account' 
              ? 'bg-white text-slate-900 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <SettingsIcon size={18} />
          {isTeacher ? 'Account' : 'Students'}
        </button>
        <button
          onClick={() => setActiveSubTab('heritage')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${
            activeSubTab === 'heritage' 
              ? 'bg-white text-slate-900 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Heart size={18} />
          Heritage
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.3 }}
        >
          {activeSubTab === 'account' ? (
            <div className="space-y-8">
              {/* Settings Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-6 gap-4">
                <div>
                  <h1 className="text-3xl font-black text-slate-800">
                    {isTeacher ? 'Account Settings' : 'Student Management'}
                  </h1>
                  <p className="text-slate-500 font-medium">
                    {isTeacher ? 'Manage your teacher profile and preferences' : 'Register and manage your student\'s profiles at SJK.BMC'}
                  </p>
                </div>
                <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                  <div className={`w-10 h-10 ${isTeacher ? 'bmc-red' : 'bmc-blue'} rounded-full flex items-center justify-center text-white`}>
                    <UserIcon size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase leading-none">Logged in {isTeacher ? 'Teacher' : 'Parent'}</p>
                    <p className="font-bold text-slate-800">{user.name}</p>
                  </div>
                </div>
              </div>

              {successMsg && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3"
                >
                  <div className="bg-emerald-500 p-1 rounded-full">
                    <ShieldCheck size={16} className="text-white" />
                  </div>
                  <p className="text-emerald-800 font-bold text-sm">{successMsg}</p>
                </motion.div>
              )}

              {isTeacher ? (
                <div className="grid grid-cols-1 gap-8">
                  {/* Teacher Profile Card */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/70 backdrop-blur-md rounded-[40px] shadow-sm border border-white/40 overflow-hidden"
                  >
                    <div className="bmc-red p-8 text-white flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                          <Briefcase size={32} />
                        </div>
                        <div>
                          <h2 className="text-2xl font-black">Teacher Profile</h2>
                          <p className="text-white/70 font-medium">SJK (T) Ladang Bukit Mertajam</p>
                        </div>
                      </div>
                      {!isEditingProfile && (
                        <button 
                          onClick={() => setIsEditingProfile(true)}
                          className="px-6 py-2 bg-white text-bmc-red rounded-xl font-black text-sm hover:bg-slate-50 transition-colors"
                        >
                          Edit Profile
                        </button>
                      )}
                    </div>

                    <div className="p-8">
                      {isEditingProfile ? (
                        <form onSubmit={handleSaveProfile} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                              <div className="relative">
                                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                  type="text"
                                  value={profileData.name}
                                  onChange={e => setProfileData({...profileData, name: e.target.value})}
                                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-bmc-red/30 focus:bg-white transition-all font-bold text-slate-800"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                              <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                  type="email"
                                  value={profileData.email}
                                  onChange={e => setProfileData({...profileData, email: e.target.value})}
                                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-bmc-red/30 focus:bg-white transition-all font-bold text-slate-800"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Subjects Taught (comma separated)</label>
                              <div className="relative">
                                <Heart className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                  type="text"
                                  value={profileData.subjects}
                                  onChange={e => setProfileData({...profileData, subjects: e.target.value})}
                                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-bmc-red/30 focus:bg-white transition-all font-bold text-slate-800"
                                  placeholder="e.g. Mathematics, Science"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Classes Commanded (comma separated)</label>
                              <div className="relative">
                                <School className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                  type="text"
                                  value={profileData.classes}
                                  onChange={e => setProfileData({...profileData, classes: e.target.value})}
                                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-bmc-red/30 focus:bg-white transition-all font-bold text-slate-800"
                                  placeholder="e.g. 1 Valluvar, 2 Valluvar"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-3 pt-4">
                            <button 
                              type="submit"
                              className="px-8 py-3 bmc-red text-white rounded-xl font-black shadow-lg shadow-red-100 hover:bg-red-800 transition-all active:scale-95 flex items-center gap-2"
                            >
                              <Save size={18} /> Save Changes
                            </button>
                            <button 
                              type="button"
                              onClick={() => {
                                setIsEditingProfile(false);
                                setProfileData({ name: user.name, email: user.email, subjects: user.subjects?.join(', ') || '', classes: user.classes?.join(', ') || '' });
                              }}
                              className="px-8 py-3 bg-slate-100 text-slate-600 rounded-xl font-black hover:bg-slate-200 transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</p>
                            <p className="text-lg font-bold text-slate-800">{user.name}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                            <p className="text-lg font-bold text-slate-800">{user.email}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee ID</p>
                            <p className="text-lg font-bold text-slate-800">BMC-T-{user.id.split('-')[1] || '001'}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subjects</p>
                            <p className="text-lg font-bold text-slate-800">{user.subjects?.length ? user.subjects.join(', ') : 'Not set'}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Classes</p>
                            <p className="text-lg font-bold text-slate-800">{user.classes?.length ? user.classes.join(', ') : 'Not set'}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* School Info Card */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/70 backdrop-blur-md rounded-[40px] shadow-sm border border-white/40 p-8 flex flex-col md:flex-row items-start md:items-center gap-8 relative"
                  >
                    {!isEditingSchool && (
                      <button 
                        onClick={() => setIsEditingSchool(true)}
                        className="absolute top-8 right-8 p-3 bg-white text-slate-400 hover:text-bmc-red shadow-sm border border-slate-100 rounded-2xl transition-all"
                      >
                        <Edit3 size={18} />
                      </button>
                    )}

                    <div className="w-20 h-20 bmc-yellow rounded-3xl flex items-center justify-center text-slate-800 shrink-0">
                      <School size={40} />
                    </div>
                    
                    <div className="flex-1 w-full">
                      {isEditingSchool ? (
                        <form onSubmit={handleSaveSchoolInfo} className="space-y-4">
                          <h3 className="text-xl font-black text-slate-800 mb-4">Edit School Information</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">School Name</label>
                              <input 
                                required
                                type="text"
                                className="w-full bg-white border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-bmc-red focus:bg-red-50 text-slate-800 font-bold transition-all text-sm"
                                value={schoolData.name}
                                onChange={e => setSchoolData({...schoolData, name: e.target.value})}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">School Code</label>
                              <input 
                                required
                                type="text"
                                className="w-full bg-white border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-bmc-red focus:bg-red-50 text-slate-800 font-bold transition-all text-sm"
                                value={schoolData.code}
                                onChange={e => setSchoolData({...schoolData, code: e.target.value})}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Location</label>
                              <input 
                                required
                                type="text"
                                className="w-full bg-white border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-bmc-red focus:bg-red-50 text-slate-800 font-bold transition-all text-sm"
                                value={schoolData.location}
                                onChange={e => setSchoolData({...schoolData, location: e.target.value})}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Category</label>
                              <input 
                                required
                                type="text"
                                className="w-full bg-white border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-bmc-red focus:bg-red-50 text-slate-800 font-bold transition-all text-sm"
                                value={schoolData.category}
                                onChange={e => setSchoolData({...schoolData, category: e.target.value})}
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-3 pt-2">
                            <button 
                              type="button"
                              onClick={() => {
                                setIsEditingSchool(false);
                                setSchoolData({
                                  name: SCHOOL_INFO.name,
                                  code: SCHOOL_INFO.code,
                                  location: SCHOOL_INFO.location,
                                  category: SCHOOL_INFO.category
                                });
                              }}
                              className="px-6 py-3 rounded-2xl font-bold bg-white text-slate-600 hover:bg-slate-50 transition-all border border-slate-200"
                            >
                              Cancel
                            </button>
                            <button 
                              type="submit"
                              className="px-6 py-3 rounded-2xl font-bold bmc-red text-white hover:opacity-90 transition-all flex items-center gap-2"
                            >
                              <Save size={18} /> Save Settings
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div>
                          <h3 className="text-xl font-black text-slate-800 mb-1">{SCHOOL_INFO.name}</h3>
                          <p className="text-slate-500 font-medium">{SCHOOL_INFO.location}</p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                              Code: {SCHOOL_INFO.code}
                            </span>
                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                              {SCHOOL_INFO.category}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              ) : (
                /* Profile List for Parents */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {myStudents.map((student, idx) => (
                    <motion.div 
                      key={student.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white/70 backdrop-blur-md rounded-[32px] p-6 shadow-sm border border-white/40 flex flex-col justify-between group hover:shadow-lg transition-all"
                    >
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="w-14 h-14 bmc-yellow rounded-2xl flex items-center justify-center text-2xl font-black text-slate-800">
                            {student.name.charAt(0)}
                          </div>
                          {student.pendingUpdate ? (
                            <div className="relative group/tag w-fit">
                              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100">
                                <ShieldAlert size={12} /> Awaiting Approval
                              </div>
                              <div className="absolute bottom-full mb-2 right-0 hidden group-hover/tag:block bg-slate-900 text-white text-[9px] px-2 py-1 rounded shadow-xl whitespace-nowrap pointer-events-none animate-in fade-in duration-100">
                                Teacher has not confirmed yet
                                <div className="absolute top-full right-4 -mt-1 w-2 h-2 bg-slate-900 rotate-45" />
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                              <ShieldCheck size={12} /> Registered
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-slate-800">{student.name}</h3>
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{student.class}</p>
                        </div>

                        {student.pendingUpdate && (
                          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Requested Changes:</p>
                            <p className="text-xs font-bold text-slate-600">Name: <span className="text-slate-800">{student.pendingUpdate.name}</span></p>
                            <p className="text-xs font-bold text-slate-600">Class: <span className="text-slate-800">{student.pendingUpdate.class}</span></p>
                          </div>
                        )}
                      </div>

                      <div className="mt-8 flex gap-3">
                        <div className="flex-1 relative group/btn">
                          <button 
                            onClick={() => startEdit(student)}
                            disabled={!!student.pendingUpdate}
                            className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-100 text-slate-700 rounded-2xl font-black text-sm hover:bg-slate-200 disabled:opacity-50 transition-all active:scale-95 border-2 border-transparent"
                          >
                            <Edit3 size={18} /> Edit Profile
                          </button>
                          <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 hidden group-hover/btn:block bg-slate-900 text-white text-[11px] font-black px-4 py-2 rounded-xl shadow-2xl whitespace-nowrap z-50 animate-in fade-in zoom-in-95 duration-100">
                            Modify name or class
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-slate-900 rotate-45" />
                          </div>
                        </div>
                        <div className="relative group/del">
                          <button 
                            onClick={() => onDeleteStudent(student.id)}
                            className="p-3.5 bg-slate-100 text-slate-500 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all active:scale-95 border-2 border-transparent"
                          >
                            <Trash2 size={18} />
                          </button>
                          <div className="absolute bottom-full mb-3 right-0 hidden group-hover/del:block bg-slate-900 text-white text-[11px] font-black px-4 py-2 rounded-xl shadow-2xl whitespace-nowrap z-50 animate-in fade-in zoom-in-95 duration-100">
                            Unlink student
                            <div className="absolute top-full right-4 -mt-1 w-2 h-2 bg-slate-900 rotate-45" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Add Student Card */}
                  <motion.button 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: myStudents.length * 0.1 }}
                    onClick={() => { setShowAddForm(true); setEditingStudentId(null); setFormData({name: '', class: '', birthday: ''}); }}
                    className="bg-white/70 backdrop-blur-md rounded-[32px] p-6 shadow-sm border-2 border-dashed border-white/40 flex flex-col items-center justify-center gap-4 text-slate-400 hover:border-bmc-blue hover:text-bmc-blue transition-all group min-h-[250px]"
                  >
                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                      <Plus size={32} />
                    </div>
                    <span className="font-black text-lg">Register New Student</span>
                  </motion.button>
                </div>
              )}

              {/* Help Section */}
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="bg-white/50 backdrop-blur-md p-8 rounded-[40px] border border-white/40 flex flex-col md:flex-row items-center gap-8"
              >
                <div className={`w-20 h-20 ${isTeacher ? 'bmc-red' : 'bmc-blue'} rounded-3xl flex items-center justify-center text-white shrink-0`}>
                  <ShieldAlert size={32} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-800 mb-2">Integrity First</h4>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    {isTeacher 
                      ? 'As a teacher, your profile information is used for official school communications and homework assignments. Please ensure your details are accurate to maintain the "Single Point of Truth" policy.'
                      : 'To ensure the "Single Point of Truth" data policy at SJK.BMC, all student profile modifications must be cross-verified by class teachers. This prevents unauthorized information changes and maintains accurate school records.'}
                  </p>
                </div>
              </motion.div>
            </div>
          ) : (
            <BMCHeritage />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Forms Overlay for Parents */}
      <AnimatePresence>
        {(showAddForm || editingStudentId) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="bmc-blue p-8 text-white relative">
                <div className="absolute top-4 right-4 p-2 bg-white/20 rounded-full cursor-pointer" onClick={() => { setShowAddForm(false); setEditingStudentId(null); }}>
                  <Plus size={20} className="rotate-45" />
                </div>
                <h2 className="text-2xl font-black">{editingStudentId ? 'Update Profile' : 'Student Registration'}</h2>
                <p className="text-white/70 text-sm font-medium mt-1">Changes require Teacher approval</p>
              </div>
              
              <form onSubmit={handleSaveStudent} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                    <input 
                      required 
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-bmc-blue/30 focus:bg-white transition-all text-slate-800 font-bold"
                      placeholder="Enter student name"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Class / Year</label>
                    <select 
                      required 
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-bmc-blue/30 focus:bg-white transition-all text-slate-800 font-bold"
                      value={formData.class}
                      onChange={e => setFormData({...formData, class: e.target.value})}
                    >
                      <option value="">Select Class</option>
                      <option value="1 Valluvar">1 Valluvar</option>
                      <option value="2 Valluvar">2 Valluvar</option>
                      <option value="3 Valluvar">3 Valluvar</option>
                      <option value="4 Valluvar">4 Valluvar</option>
                      <option value="5 Valluvar">5 Valluvar</option>
                      <option value="6 Valluvar">6 Valluvar</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Birthday</label>
                    <input 
                      type="date"
                      required 
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-bmc-blue/30 focus:bg-white transition-all text-slate-800 font-bold"
                      value={formData.birthday}
                      onChange={e => setFormData({...formData, birthday: e.target.value})}
                    />
                  </div>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                   <button 
                    type="submit" 
                    className="w-full py-4 bmc-blue text-white rounded-2xl font-black shadow-lg shadow-blue-200 hover:bg-blue-800 active:scale-95 transition-all flex items-center justify-center gap-2"
                   >
                     <Save size={18} /> {editingStudentId ? 'Request Update' : 'Submit Registration'}
                   </button>
                   <div className="flex items-center justify-center gap-2 text-slate-400">
                      <History size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Teacher will verify this request</span>
                   </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;
