import React, { useState, useMemo } from "react";
import {
  User,
  Student,
  Homework,
  HomeworkStatus,
  HomeworkRecord,
  HomeworkPriority,
} from "@/types";
import { SCHOOL_INFO, RANKS } from "@/constants";
import {
  generateHomeworkHints,
  analyzeHomeworkImage,
  generateParentTip,
  generateProgressSummary,
} from "@/services/geminiService";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from "recharts";
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  BrainCircuit,
  Camera,
  Bell,
  Users,
  Sparkles,
  MessageSquare,
  CheckSquare,
  Check,
  Activity,
  TrendingUp,
  Star,
  ChevronLeft,
  ChevronRight,
  Gift,
  Award,
  Trophy,
} from "lucide-react";
import Pagination from "@/components/Pagination";
import confetti from "canvas-confetti";

interface ParentDashboardProps {
  user: User;
  homeworks: Homework[];
  records: HomeworkRecord[];
  students: Student[];
  onUpdateStatus: (
    rid: string,
    sid: string,
    status: HomeworkStatus,
    ack: boolean,
  ) => void;
  onNavigateToMessages: () => void;
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({
  user,
  homeworks,
  records,
  students,
  onUpdateStatus,
  onNavigateToMessages,
}) => {
  const myStudents = students.filter((s) => s.parentId === user.id);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(
    myStudents[0] || null,
  );
  const [analyzing, setAnalyzing] = useState(false);
  const [aiHints, setAiHints] = useState<{ [key: string]: string }>({});
  const [ackToast, setAckToast] = useState<string | null>(null);
  const [parentTip, setParentTip] = useState<string | null>(null);
  const [loadingTip, setLoadingTip] = useState(false);

  const [progressSummary, setProgressSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<"homework" | "stats" | "rewards" | "logs">(
    "homework",
  );

  // Pagination state
  const ITEMS_PER_PAGE = 8;
  const [currentPage, setCurrentPage] = useState(1);

  const studentHomeworks = selectedStudent
    ? homeworks.filter((h) => h.targetStudentIds.includes(selectedStudent.id))
    : [];

  const paginatedHomeworks = studentHomeworks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const getStatus = (hid: string) => {
    return (
      records.find(
        (r) => r.homeworkId === hid && r.studentId === selectedStudent?.id,
      ) || {
        status: HomeworkStatus.PENDING,
        acknowledged: false,
      }
    );
  };

  const unacknowledgedHomeworks = studentHomeworks.filter(
    (h) => !getStatus(h.id).acknowledged,
  );
  const unacknowledgedCount = unacknowledgedHomeworks.length;

  const handleAcknowledge = (
    hid: string,
    sid: string,
    status: HomeworkStatus,
  ) => {
    onUpdateStatus(hid, sid, status, true);
    setAckToast("Acknowledgement sent! Teacher has been notified. 👍");
    setTimeout(() => setAckToast(null), 4000);
  };

  const handleStatusChange = (
    hid: string,
    sid: string,
    status: HomeworkStatus,
    ack: boolean,
  ) => {
    onUpdateStatus(hid, sid, status, ack);
    if (status === HomeworkStatus.COMPLETED) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10B981", "#3B82F6", "#FBBF24", "#EF4444"],
      });
    }
  };

  const handleGetHints = async (h: Homework) => {
    if (aiHints[h.id]) return;
    const hints = await generateHomeworkHints(h.title, h.description);
    setAiHints((prev) => ({ ...prev, [h.id]: hints }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAnalyzing(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(",")[1];
      const analysis = await analyzeHomeworkImage(base64String);
      console.log(`${SCHOOL_INFO.shortName} AI Analysis:\n\n${analysis}`);
      setAnalyzing(false);
    };
    reader.readAsDataURL(file);
  };

  const subjectData = useMemo(() => {
    if (!selectedStudent) return [];
    const subjects: { [key: string]: number } = {};
    studentHomeworks.forEach((h) => {
      subjects[h.subject] = (subjects[h.subject] || 0) + 1;
    });
    return Object.entries(subjects).map(([name, count]) => ({ name, count }));
  }, [studentHomeworks, selectedStudent]);

  const fetchParentTip = async () => {
    if (!selectedStudent || studentHomeworks.length === 0) return;
    setLoadingTip(true);
    const topSubject = subjectData[0]?.name || "General learning";
    const tip = await generateParentTip(topSubject, "regular practice");
    setParentTip(tip);
    setLoadingTip(false);
  };

  const fetchProgressSummary = async () => {
    if (!selectedStudent) return;
    setLoadingSummary(true);
    const subjectStatsStr = subjectData.map(s => `${s.name}: ${s.count}`).join(', ');
    const summary = await generateProgressSummary(selectedStudent.name, selectedStudent.xp, stats.completed, subjectStatsStr || 'General subjects');
    setProgressSummary(summary);
    setLoadingSummary(false);
  };

  const stats = useMemo(() => {
    if (!selectedStudent) return { total: 0, pending: 0, completed: 0 };
    const relevantRecords = records.filter(
      (r) => r.studentId === selectedStudent.id,
    );
    return {
      total: studentHomeworks.length,
      pending: relevantRecords.filter((r) => r.status === HomeworkStatus.PENDING)
        .length,
      completed: relevantRecords.filter(
        (r) => r.status === HomeworkStatus.COMPLETED,
      ).length,
    };
  }, [selectedStudent, studentHomeworks, records]);

  const performanceMetrics = useMemo(() => {
    if (!selectedStudent) return null;

    const currentRank =
      RANKS.find((r) => r.level === selectedStudent.rank) || RANKS[0];
    const nextRank = RANKS.find((r) => r.level === selectedStudent.rank + 1);
    const xpToNext = nextRank ? nextRank.minXp - selectedStudent.xp : 0;
    const progressToNext = nextRank
      ? Math.round(
          ((selectedStudent.xp - currentRank.minXp) /
            (nextRank.minXp - currentRank.minXp)) *
            100,
        )
      : 100;

    const history = homeworks
      .filter((h) => h.targetStudentIds.includes(selectedStudent.id))
      .map((h) => {
        const record = records.find(
          (r) => r.homeworkId === h.id && r.studentId === selectedStudent.id,
        );
        return {
          ...h,
          status: record?.status || HomeworkStatus.PENDING,
          lastUpdated: record?.lastUpdated || "N/A",
        };
      })
      .sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
      );

    if (!history.length) return null;

    let completedCount = 0;
    const timeline = history.map((h, index) => {
      if (h.status === HomeworkStatus.COMPLETED) completedCount++;
      const totalToDate = index + 1;
      const rate = Math.round((completedCount / totalToDate) * 100);
      return {
        label: h.subject.substring(0, 3),
        rate,
        status: h.status,
        date: h.dueDate,
      };
    });

    return { timeline, currentRank, nextRank, xpToNext, progressToNext };
  }, [selectedStudent, homeworks, records]);

  return (
    <div className="space-y-6 relative">
      {/* Acknowledgement Toast */}
      {ackToast && (
        <div className="fixed bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10">
            <div className="bg-emerald-500 p-1 rounded-full">
              <Check size={14} className="text-white" />
            </div>
            <p className="text-sm font-bold">{ackToast}</p>
          </div>
        </div>
      )}

      {/* Student Selector & Notifications */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch">
        <div className="flex-1 bg-white/70 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/40 flex items-center gap-4">
          <div className="p-3 bg-blue-50/70 text-bmc-blue rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">
              Linked Students
            </p>
            <div className="flex gap-2 mt-1">
              {myStudents.map((s) => (
                <div key={s.id} className="relative group">
                  <button
                    onClick={() => setSelectedStudent(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      selectedStudent?.id === s.id
                        ? "bmc-blue text-white shadow-md"
                        : "bg-white/50 text-slate-600 hover:bg-white/80 border border-white/40"
                    }`}
                  >
                    {s.name}
                  </button>
                  <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-white text-[11px] font-black px-4 py-2 rounded-xl shadow-2xl z-50 whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-100">
                    Switch to {s.name}'s tasks
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-slate-900 rotate-45" />
                  </div>
                </div>
              ))}
              {myStudents.length === 0 && (
                <p className="text-xs text-slate-400 italic">
                  No students linked yet. Go to Settings.
                </p>
              )}
            </div>
          </div>
        </div>

        {unacknowledgedCount > 0 && (
          <div className="bg-emerald-50/70 backdrop-blur-md p-4 rounded-2xl border border-emerald-200/40 flex items-center gap-4 text-emerald-800 shadow-sm">
            <Bell className="animate-bounce" size={24} />
            <div>
              <p className="font-bold text-sm">New Assignment Alert</p>
              <p className="text-xs">
                Mdm. Kavitha added {unacknowledgedCount} new task
                {unacknowledgedCount > 1 ? "s" : ""}.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/70 backdrop-blur-md p-4 rounded-2xl border border-white/40 shadow-sm">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Total Tasks</p>
          <p className="text-2xl font-black text-slate-800">{stats.total}</p>
        </div>
        <div className="bg-white/70 backdrop-blur-md p-4 rounded-2xl border border-white/40 shadow-sm">
          <p className="text-[10px] font-black uppercase text-amber-500 mb-1">To Do</p>
          <p className="text-2xl font-black text-amber-600">{stats.pending}</p>
        </div>
        <div className="bg-white/70 backdrop-blur-md p-4 rounded-2xl border border-white/40 shadow-sm">
          <p className="text-[10px] font-black uppercase text-emerald-500 mb-1">Completed</p>
          <p className="text-2xl font-black text-emerald-600">{stats.completed}</p>
        </div>
        <div className="bg-white/70 backdrop-blur-md p-4 rounded-2xl border border-white/40 shadow-sm">
          <p className="text-[10px] font-black uppercase text-bmc-blue mb-1">Success Rate</p>
          <p className="text-2xl font-black text-bmc-blue">
            {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Tab Selection Buttons */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-200/50 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("homework")}
          className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${
            activeTab === "homework"
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <CalendarIcon size={16} /> Homework Feed
          {unacknowledgedCount > 0 && (
            <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full text-[9px] ml-1">
              {unacknowledgedCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${
            activeTab === "stats"
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <TrendingUp size={16} /> Journey & Stats
        </button>
        <button
          onClick={() => setActiveTab("rewards")}
          className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${
            activeTab === "rewards"
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Gift size={16} /> Rewards
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${
            activeTab === "logs"
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Sparkles size={16} /> AI Activity Logs
        </button>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
        {/* Active Tab Content */}
        {activeTab === "homework" && (
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">
                Homework Feed
              </h3>
            </div>

            <div className="space-y-4">
              {paginatedHomeworks.length > 0 ? (
                paginatedHomeworks.map((h) => {
                  const record = getStatus(h.id);
                  const hints = aiHints[h.id];
                  return (
                    <div
                      key={h.id}
                      className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/40 shadow-sm overflow-hidden group"
                    >
                      <div
                        className={`h-1.5 w-full ${
                          h.priority === HomeworkPriority.HIGH
                            ? "bg-red-500"
                            : h.priority === HomeworkPriority.MEDIUM
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                        }`}
                      />

                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="text-[10px] font-black uppercase text-slate-400">
                              {h.subject}
                            </span>
                            <h4 className="text-lg font-bold text-slate-800">
                              {h.title}
                            </h4>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-slate-500 flex items-center gap-1 justify-end">
                              <CalendarIcon size={12} /> Due: {h.dueDate}
                            </p>
                            {record.acknowledged ? (
                              <div className="relative group w-fit ml-auto">
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full mt-1 shadow-sm">
                                  <CheckSquare size={12} /> Received by Parent
                                </span>
                                <div className="absolute bottom-full mb-3 right-0 hidden group-hover:block bg-slate-900 text-white text-[11px] font-black px-4 py-2 rounded-xl shadow-2xl z-50 whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-100">
                                  Teacher has been notified
                                  <div className="absolute top-full right-6 -mt-1 w-2 h-2 bg-slate-900 rotate-45" />
                                </div>
                              </div>
                            ) : (
                              <div className="relative group w-fit ml-auto">
                                <button
                                  onClick={() =>
                                    handleAcknowledge(
                                      h.id,
                                      selectedStudent!.id,
                                      record.status,
                                    )
                                  }
                                  className="text-[11px] font-black text-white bmc-red px-4 py-1.5 rounded-full mt-1 hover:bg-red-800 transition-all flex items-center gap-1.5 shadow-md active:scale-95"
                                >
                                  <Bell size={12} /> Acknowledge Receipt
                                </button>
                                <div className="absolute bottom-full mb-3 right-0 hidden group-hover:block bg-slate-900 text-white text-[11px] font-black px-4 py-2 rounded-xl shadow-2xl z-50 whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-100">
                                  Tap to confirm you've seen this
                                  <div className="absolute top-full right-6 -mt-1 w-2 h-2 bg-slate-900 rotate-45" />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <p className="text-sm text-slate-600 mb-6">
                          {h.description}
                        </p>
                        {h.snapshot && (
                          <div className="mb-6">
                            <img
                              src={h.snapshot}
                              alt="Homework Snapshot"
                              className="max-w-full rounded-xl shadow-sm"
                            />
                          </div>
                        )}

                        <div className="flex flex-wrap gap-4 items-center justify-between border-t pt-4">
                          <div className="flex gap-2">
                            <div className="relative group w-fit">
                              <button
                                onClick={() =>
                                  handleStatusChange(
                                    h.id,
                                    selectedStudent!.id,
                                    HomeworkStatus.PENDING,
                                    record.acknowledged,
                                  )
                                }
                                className={`px-5 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 transition-all shadow-sm ${
                                  record.status === HomeworkStatus.PENDING
                                    ? "bg-slate-900 text-white scale-105"
                                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                }`}
                              >
                                <Clock size={16} /> Pending
                              </button>
                              <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-white text-[11px] font-black px-4 py-2 rounded-xl shadow-2xl z-50 whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-100">
                                Not started yet
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-slate-900 rotate-45" />
                              </div>
                            </div>

                            <div className="relative group w-fit">
                              <button
                                onClick={() =>
                                  handleStatusChange(
                                    h.id,
                                    selectedStudent!.id,
                                    HomeworkStatus.ONGOING,
                                    record.acknowledged,
                                  )
                                }
                                className={`px-5 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 transition-all shadow-sm ${
                                  record.status === HomeworkStatus.ONGOING
                                    ? "bmc-blue text-white scale-105"
                                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                }`}
                              >
                                <Clock size={16} /> Ongoing
                              </button>
                              <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-white text-[11px] font-black px-4 py-2 rounded-xl shadow-2xl z-50 whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-100">
                                Student is working on it
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-slate-900 rotate-45" />
                              </div>
                            </div>

                            <div className="relative group w-fit">
                              <button
                                onClick={() =>
                                  handleStatusChange(
                                    h.id,
                                    selectedStudent!.id,
                                    HomeworkStatus.COMPLETED,
                                    record.acknowledged,
                                  )
                                }
                                className={`px-5 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 transition-all shadow-sm ${
                                  record.status === HomeworkStatus.COMPLETED
                                    ? "bg-emerald-600 text-white scale-105"
                                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                }`}
                              >
                                <CheckCircle size={16} /> Done
                              </button>
                              <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-white text-[11px] font-black px-4 py-2 rounded-xl shadow-2xl z-50 whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-100">
                                Mark as finished
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-slate-900 rotate-45" />
                              </div>
                            </div>
                          </div>

                          <div className="relative group w-fit">
                            <button
                              onClick={() => handleGetHints(h)}
                              className="flex items-center gap-2 text-bmc-red font-black text-sm hover:underline"
                            >
                              <BrainCircuit size={18} /> Get AI Hints
                            </button>
                            <div className="absolute bottom-full mb-3 right-0 hidden group-hover:block bg-slate-900 text-white text-[11px] font-black px-4 py-2 rounded-xl shadow-2xl z-50 whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-100">
                              Get clues to help your child (not answers)
                              <div className="absolute top-full right-6 -mt-1 w-2 h-2 bg-slate-900 rotate-45" />
                            </div>
                          </div>
                        </div>

                        {hints && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm text-slate-700">
                            <h5 className="font-bold text-bmc-blue mb-1 flex items-center gap-1">
                              <Sparkles size={14} /> AI Hint:
                            </h5>
                            <div className="whitespace-pre-wrap">{hints}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-white p-10 rounded-2xl border-2 border-dashed border-slate-200 text-center text-slate-400">
                  {selectedStudent
                    ? "No homework assigned for this student."
                    : "Please select or register a student in Settings."}
                </div>
              )}
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(studentHomeworks.length / ITEMS_PER_PAGE)}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        )}

        {/* Tools Sidebar for Homework Tab */}
        {activeTab === "homework" && (
          <div className="space-y-6">
            <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/40">
              <h3 className="font-bold mb-2 flex items-center gap-2 text-slate-800">
                <Sparkles size={20} className="text-bmc-yellow" />
                Parent Support AI
              </h3>
              <p className="text-[11px] text-slate-500 mb-4 font-medium leading-relaxed">
                Get quick advice on how to best help {selectedStudent?.name} with their current subjects.
              </p>
              
              {parentTip ? (
                <div className="p-3 bg-bmc-yellow/10 rounded-xl border border-bmc-yellow/20 text-xs text-slate-700 animate-in fade-in slide-in-from-top-2">
                  <p className="font-bold text-slate-900 mb-1">Tip for Today:</p>
                  {parentTip}
                </div>
              ) : (
                <button
                  onClick={fetchParentTip}
                  disabled={loadingTip || studentHomeworks.length === 0}
                  className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black shadow-lg shadow-slate-200 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {loadingTip ? "Generating..." : "Get Parenting Tip"}
                </button>
              )}
            </div>

            <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/40">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800">
                <Camera size={20} className="text-bmc-red" />
                Analyze Homework
              </h3>
              <div className="relative group">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <div className="w-full py-4 bg-white/50 rounded-xl border-2 border-dashed border-white/40 flex flex-col items-center justify-center hover:bg-white/80 transition-colors">
                    <Camera className="text-slate-400 mb-2" />
                    <span className="text-xs font-bold text-slate-500">
                      {analyzing ? "Analyzing..." : "Upload Photo"}
                    </span>
                  </div>
                </label>
                <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-white text-[11px] font-black px-4 py-2 rounded-xl shadow-2xl z-50 whitespace-nowrap text-center pointer-events-none animate-in fade-in zoom-in-95 duration-100">
                  Snap a worksheet photo
                  <br />
                  for an instant AI summary
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-slate-900 rotate-45" />
                </div>
              </div>
            </div>

            <button
              onClick={onNavigateToMessages}
              className="w-full p-4 bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-white/40 flex items-center justify-between group relative"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bmc-yellow rounded-lg text-slate-800">
                  <MessageSquare size={18} />
                </div>
                <span className="font-bold text-sm text-slate-800">
                  Chat with Teacher
                </span>
              </div>
              <ChevronRight
                size={18}
                className="text-slate-400 group-hover:translate-x-1 transition-transform"
              />
              <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-white text-[11px] font-black px-4 py-2 rounded-xl shadow-2xl z-50 whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-100">
                Ask Mdm. Kavitha a question
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-slate-900 rotate-45" />
              </div>
            </button>
          </div>
        )}

        {/* Stats Tab Content */}
        {activeTab === "stats" && (
          <div className="lg:col-span-3 space-y-6">
            {/* Learning Journey Chart */}
            <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-sm border border-white/40 overflow-hidden flex flex-col min-w-0">
              <div className="p-6 border-b border-white/40 bg-slate-50/50">
                <h3 className="font-bold text-lg flex items-center gap-2 text-slate-800">
                  <Activity size={20} className="text-bmc-red" />
                  Learning Journey
                </h3>
              </div>

              <div className="p-6">
                {performanceMetrics ? (
                  <div className="space-y-6">
                    {/* XP & Rank Display */}
                    <div className="p-4 bg-slate-900 rounded-2xl text-white relative overflow-hidden group">
                      <div className="absolute -right-4 -top-4 text-white/5 rotate-12 transition-transform group-hover:scale-110">
                        <Star size={80} fill="currentColor" />
                      </div>
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/50">
                              Current Rank
                            </p>
                            <h4 className="text-xl font-black flex items-center gap-2">
                              <span className="text-2xl">
                                {performanceMetrics.currentRank.icon}
                              </span>
                              {performanceMetrics.currentRank.name}
                            </h4>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/50">
                              Total XP
                            </p>
                            <p className="text-xl font-black text-bmc-yellow">
                              {selectedStudent?.xp} XP
                            </p>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                            <span className="text-white/70">
                              Level {selectedStudent?.rank}
                            </span>
                            {performanceMetrics.nextRank ? (
                              <span className="text-bmc-yellow">
                                {performanceMetrics.xpToNext} XP to{" "}
                                {performanceMetrics.nextRank.name}
                              </span>
                            ) : (
                              <span className="text-emerald-400">
                                MAX RANK REACHED!
                              </span>
                            )}
                          </div>
                          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-bmc-yellow transition-all duration-1000"
                              style={{
                                width: `${performanceMetrics.progressToNext}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                          Momentum
                        </h4>
                        <p className="text-[10px] text-slate-500 font-bold">
                          Progress tracker
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-emerald-600">
                          {performanceMetrics.timeline[
                            performanceMetrics.timeline.length - 1
                          ]?.rate || 0}
                          %
                        </span>
                      </div>
                    </div>

                    <div className="h-40 w-full min-h-[160px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={performanceMetrics.timeline}>
                          <defs>
                            <linearGradient
                              id="colorRateParent"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#ef4444"
                                stopOpacity={0.3}
                              />
                              <stop
                                offset="95%"
                                stopColor="#ef4444"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#f1f5f9"
                          />
                          <XAxis dataKey="label" hide />
                          <YAxis hide domain={[0, 100]} />
                          <RechartsTooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-slate-900 text-white p-3 rounded-xl shadow-2xl border border-white/10">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">
                                      {payload[0].payload.date}
                                    </p>
                                    <p className="text-sm font-black">
                                      {payload[0].value}% Completion
                                    </p>
                                    <p className="text-[9px] font-bold text-red-400 mt-1 flex items-center gap-1">
                                      <Star size={8} fill="currentColor" />{" "}
                                      {payload[0].payload.status}
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="rate"
                            stroke="#ef4444"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorRateParent)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Subject Breakdown */}
                    <div className="pt-6 border-t border-white/40">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                        Subject Focus
                      </h4>
                      <div className="space-y-3">
                        {subjectData.map((s, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-[11px] font-bold text-slate-600">
                              <span>{s.name}</span>
                              <span>{s.count} Tasks</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-bmc-blue rounded-full"
                                style={{
                                  width: `${(s.count / stats.total) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                        {subjectData.length === 0 && (
                          <p className="text-xs text-slate-400 italic">No task data available.</p>
                        )}
                      </div>
                    </div>

                    {/* AI Progress Summary */}
                    <div className="pt-6 border-t border-white/40">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Sparkles size={14} className="text-bmc-yellow" />
                        AI Progress Summary
                      </h4>
                      {progressSummary ? (
                        <div className="p-4 bg-blue-50 text-blue-900 rounded-2xl border border-blue-100 text-sm leading-relaxed">
                          {progressSummary}
                        </div>
                      ) : (
                         <button
                           onClick={fetchProgressSummary}
                           disabled={loadingSummary}
                           className="w-full py-3 bg-white border-2 border-slate-200 text-slate-600 rounded-xl text-xs font-black shadow-sm active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-bmc-blue"
                         >
                           {loadingSummary ? "Generating Summary..." : "Generate AI Summary Report"}
                         </button>
                      )}
                    </div>

                    <div className="pt-4 border-t border-white/40">
                      <div className="flex items-center gap-2 text-emerald-600">
                        <TrendingUp size={16} />
                        <span className="text-xs font-black uppercase tracking-widest">
                          On Track for Success
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium mt-1">
                        Based on recent homework completion rates.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-white/40 rounded-2xl bg-white/30 space-y-2">
                    <Activity size={24} className="text-slate-200" />
                    <p className="text-[10px] text-slate-400 font-black uppercase text-center px-4">
                      No data yet
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Rewards Tab Content */}
        {activeTab === "rewards" && (
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-sm border border-white/40 overflow-hidden">
               <div className="p-6 border-b border-white/40 bg-amber-50/50">
                <h3 className="font-bold text-lg flex items-center gap-2 text-amber-600">
                  <Trophy size={20} />
                  Rewards & Achievements
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Keep encouraging {selectedStudent?.name} to unlock more badges!
                </p>
               </div>
               
               <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2 border-2 transition-all ${stats.completed >= 1 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200 opacity-50 grayscale'}`}>
                    <div className="p-3 bg-amber-100 text-amber-500 rounded-full">
                      <Star size={32} fill="currentColor" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-800">First Steps</h4>
                    <p className="text-[10px] text-slate-500 uppercase font-black">Complete 1 Task</p>
                  </div>

                  <div className={`p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2 border-2 transition-all ${(selectedStudent?.xp || 0) >= 50 ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200 opacity-50 grayscale'}`}>
                    <div className="p-3 bg-emerald-100 text-emerald-500 rounded-full">
                      <Award size={32} />
                    </div>
                    <h4 className="font-bold text-sm text-slate-800">Rising Star</h4>
                    <p className="text-[10px] text-slate-500 uppercase font-black">Reach 50 XP</p>
                  </div>

                  <div className={`p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2 border-2 transition-all ${(stats.completed) >= 5 ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200 opacity-50 grayscale'}`}>
                    <div className="p-3 bg-blue-100 text-blue-500 rounded-full">
                      <CheckCircle size={32} fill="currentColor" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-800">Consistent</h4>
                    <p className="text-[10px] text-slate-500 uppercase font-black">Complete 5 Tasks</p>
                  </div>

                  <div className={`p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2 border-2 transition-all ${(selectedStudent?.xp || 0) >= 200 ? 'bg-purple-50 border-purple-200' : 'bg-slate-50 border-slate-200 opacity-50 grayscale'}`}>
                    <div className="p-3 bg-purple-100 text-purple-500 rounded-full">
                      <Gift size={32} />
                    </div>
                    <h4 className="font-bold text-sm text-slate-800">Overachiever</h4>
                    <p className="text-[10px] text-slate-500 uppercase font-black">Reach 200 XP</p>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* AI Logs Tab Content */}
        {activeTab === "logs" && (
          <div className="lg:col-span-3 space-y-6">
            {selectedStudent?.aiLogs && selectedStudent.aiLogs.length > 0 ? (
              <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/40">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800">
                  <Sparkles size={20} className="text-bmc-yellow" />
                  AI Activity Logs
                </h3>
                <div className="space-y-3">
                  {selectedStudent.aiLogs.map((log, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl text-xs ${log.isSmartAttempt ? "bg-red-50 border border-red-100 text-red-800" : "bg-slate-50 text-slate-600"}`}
                    >
                      <p className="font-bold">
                        {new Date(log.date).toLocaleString()}
                      </p>
                      <p>{log.message}</p>
                      {log.isSmartAttempt && (
                        <p className="font-black mt-1 text-[10px] uppercase">
                          Smart Attempt Detected
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white/70 backdrop-blur-md p-10 rounded-3xl shadow-sm border border-white/40 text-center text-slate-400 font-bold">
                No AI Activity recorded yet for this student.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;
