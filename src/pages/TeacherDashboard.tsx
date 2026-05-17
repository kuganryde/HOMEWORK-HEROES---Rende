import React, { useState, useMemo } from "react";
import {
  User,
  Student,
  Homework,
  HomeworkPriority,
  HomeworkStatus,
  HomeworkRecord,
} from "@/types";
import { SCHOOL_INFO, RANKS } from "@/constants";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  Plus,
  Users,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Search,
  TrendingUp,
  BarChart3,
  Activity,
  Info,
  Check,
  X,
  ShieldAlert,
  ArrowRight,
  Star,
  ChevronLeft,
  ChevronRight,
  Trophy,
  PieChart,
  ThumbsDown,
  BrainCircuit,
} from "lucide-react";
import Pagination from "@/components/Pagination";
import { ShieldPencil } from "@/components/HeroMascot";
import confetti from "canvas-confetti";

interface TeacherDashboardProps {
  user: User;
  homeworks: Homework[];
  records: HomeworkRecord[];
  students: Student[];
  onAddHomework: (h: Omit<Homework, "id">) => void;
  onApproveStudent: (sid: string, approved: boolean) => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  user,
  homeworks,
  records,
  students,
  onAddHomework,
  onApproveStudent,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedStudentHistory, setSelectedStudentHistory] = useState<
    string | null
  >(null);
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    description: "",
    priority: HomeworkPriority.MEDIUM,
    dueDate: "",
    targetStudentIds: [] as string[],
    snapshot: "",
  });

  const handleSnapshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, snapshot: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  // Pagination states
  const ITEMS_PER_PAGE = 8;
  const [homeworkPage, setHomeworkPage] = useState(1);
  const [studentPage, setStudentPage] = useState(1);
  const [pendingPage, setPendingPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);

  const [activeTab, setActiveTab] = useState<"tasks" | "students" | "pending" | "analytics">(
    "tasks",
  );

  const filteredStudents = students.filter(
    (s) =>
      (s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.class.toLowerCase().includes(search.toLowerCase()))
  );

  // Class Analytics Calculations
  const classAnalytics = useMemo(() => {
    if (students.length === 0 || homeworks.length === 0) return null;

    // 1. Completion Rate per Subject
    const subjects: { [key: string]: { total: number; done: number } } = {};
    homeworks.forEach((h) => {
      if (!subjects[h.subject]) subjects[h.subject] = { total: 0, done: 0 };
      const taskRecords = records.filter((r) => r.homeworkId === h.id);
      subjects[h.subject].total += h.targetStudentIds.length;
      subjects[h.subject].done += taskRecords.filter(
        (r) => r.status === HomeworkStatus.COMPLETED,
      ).length;
    });

    const subjectStats = Object.entries(subjects).map(([name, stats]) => ({
      name,
      rate: Math.round((stats.done / stats.total) * 100),
    }));

    // 2. Identify Struggling Students
    const studentPerformance = students.map((s) => {
      const studentTasks = homeworks.filter((h) => h.targetStudentIds.includes(s.id));
      const studentRecords = records.filter((r) => r.studentId === s.id);
      const completed = studentRecords.filter(
        (r) => r.status === HomeworkStatus.COMPLETED,
      ).length;
      const total = studentTasks.length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 100;
      return { ...s, rate, totalTasks: total };
    });

    const strugglingStudents = studentPerformance
      .filter((s) => s.rate < 60 && s.totalTasks > 0)
      .sort((a, b) => a.rate - b.rate);

    // 3. Overall Completion Trend
    // Group tasks by date and calculate average completion
    const dateGroups: { [key: string]: { total: number; done: number } } = {};
    homeworks.forEach((h) => {
      const date = h.dueDate;
      if (!dateGroups[date]) dateGroups[date] = { total: 0, done: 0 };
      const taskRecords = records.filter((r) => r.homeworkId === h.id);
      dateGroups[date].total += h.targetStudentIds.length;
      dateGroups[date].done += taskRecords.filter(
        (r) => r.status === HomeworkStatus.COMPLETED,
      ).length;
    });

    const trendData = Object.entries(dateGroups)
      .map(([date, stats]) => ({
        date,
        rate: Math.round((stats.done / stats.total) * 100),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return { subjectStats, strugglingStudents, trendData };
  }, [students, homeworks, records]);

  const pendingApprovals = students.filter((s) => s.pendingUpdate);

  const studentPerformanceHistory = useMemo(() => {
    if (!selectedStudentHistory) return [];

    return homeworks
      .filter((h) => h.targetStudentIds.includes(selectedStudentHistory))
      .map((h) => {
        const record = records.find(
          (r) =>
            r.homeworkId === h.id && r.studentId === selectedStudentHistory,
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
  }, [selectedStudentHistory, homeworks, records]);

  // Paginated data
  const paginatedHomeworks = homeworks.slice(
    (homeworkPage - 1) * ITEMS_PER_PAGE,
    homeworkPage * ITEMS_PER_PAGE,
  );
  const paginatedStudents = filteredStudents.slice(
    (studentPage - 1) * ITEMS_PER_PAGE,
    studentPage * ITEMS_PER_PAGE,
  );
  const paginatedPending = pendingApprovals.slice(
    (pendingPage - 1) * ITEMS_PER_PAGE,
    pendingPage * ITEMS_PER_PAGE,
  );
  const paginatedHistory = studentPerformanceHistory.slice(
    (historyPage - 1) * ITEMS_PER_PAGE,
    historyPage * ITEMS_PER_PAGE,
  );

  const toggleStudent = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      targetStudentIds: prev.targetStudentIds.includes(id)
        ? prev.targetStudentIds.filter((i) => i !== id)
        : [...prev.targetStudentIds, id],
    }));
  };

  const selectAllStudents = () => {
    const allFilteredIds = filteredStudents.map((s) => s.id);
    const allSelected =
      allFilteredIds.length > 0 &&
      allFilteredIds.every((id) => formData.targetStudentIds.includes(id));

    if (allSelected) {
      // Unselect all filtered students
      setFormData((prev) => ({
        ...prev,
        targetStudentIds: prev.targetStudentIds.filter(
          (id) => !allFilteredIds.includes(id),
        ),
      }));
    } else {
      // Select all filtered students (without duplicates)
      setFormData((prev) => ({
        ...prev,
        targetStudentIds: [
          ...new Set([...prev.targetStudentIds, ...allFilteredIds]),
        ],
      }));
    }
  };

  const highPriorityConflicts = useMemo(() => {
    if (!formData.dueDate || formData.priority !== HomeworkPriority.HIGH)
      return [];

    const conflicts: string[] = [];
    formData.targetStudentIds.forEach((sid) => {
      const existingHighTasks = homeworks.filter(
        (h) =>
          h.dueDate === formData.dueDate &&
          h.priority === HomeworkPriority.HIGH &&
          h.targetStudentIds.includes(sid),
      );
      if (existingHighTasks.length >= 3) {
        conflicts.push(students.find((s) => s.id === sid)?.name || sid);
      }
    });
    return conflicts;
  }, [
    formData.dueDate,
    formData.priority,
    formData.targetStudentIds,
    homeworks,
    students,
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddHomework({ ...formData, teacherId: user.id });
    setShowForm(false);
    setFormData({
      title: "",
      subject: "",
      description: "",
      priority: HomeworkPriority.MEDIUM,
      dueDate: "",
      targetStudentIds: [],
      snapshot: "",
    });

    // Confetti on task creation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#e11d48", "#facc15", "#3b82f6"],
    });
  };

  const handleApproveStudent = (sid: string, approved: boolean) => {
    onApproveStudent(sid, approved);
    if (approved) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#10b981", "#3b82f6"], // Green and blue for approval
      });
    }
  };

  const getCompletionStats = (hid: string) => {
    const taskRecords = records.filter((r) => r.homeworkId === hid);
    const homework = homeworks.find((h) => h.id === hid);
    const total = homework?.targetStudentIds.length || 0;
    const acknowledged = taskRecords.filter((r) => r.acknowledged).length;
    const completed = taskRecords.filter(
      (r) => r.status === HomeworkStatus.COMPLETED,
    ).length;
    return { acknowledged, completed, total };
  };

  const performanceMetrics = useMemo(() => {
    if (!studentPerformanceHistory.length) return null;

    const sortedHistory = [...studentPerformanceHistory].sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    );

    let completedCount = 0;
    const timeline = sortedHistory.map((h, index) => {
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

    return { timeline };
  }, [studentPerformanceHistory]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Section: Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative group w-fit">
          <button
            onClick={() => setShowForm(true)}
            className="w-full bg-white/70 backdrop-blur-md p-6 rounded-2xl border-2 border-dashed border-bmc-red text-bmc-red hover:bmc-red hover:text-white transition-all group flex flex-col items-center justify-center gap-3 shadow-sm"
          >
            <div className="p-3 bg-red-50 rounded-full group-hover:bg-white/20">
              <Plus size={32} />
            </div>
            <span className="font-bold">Assign New Task</span>
          </button>
          <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-white text-[11px] font-black px-4 py-2 rounded-xl shadow-2xl z-50 whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-100">
            Create tasks for individuals or the whole class
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-slate-900 rotate-45" />
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/40">
          <div className="flex items-center gap-3 mb-4">
            <Users className="text-bmc-blue" />
            <h3 className="font-bold">Class Size</h3>
          </div>
          <p className="text-4xl font-black text-slate-800">
            {students.length}
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Enrolled at {SCHOOL_INFO.shortName}
          </p>
        </div>

        <div
          className={`p-6 rounded-2xl shadow-sm border transition-all backdrop-blur-md ${pendingApprovals.length > 0 ? "bg-amber-50/70 border-amber-200/40" : "bg-white/70 border-white/40"}`}
        >
          <div className="flex items-center gap-3 mb-4">
            <ShieldAlert
              className={
                pendingApprovals.length > 0
                  ? "text-amber-600"
                  : "text-slate-400"
              }
            />
            <h3 className="font-bold text-slate-800">Pending Actions</h3>
          </div>
          <p
            className={`text-4xl font-black ${pendingApprovals.length > 0 ? "text-amber-600" : "text-slate-800"}`}
          >
            {pendingApprovals.length}
          </p>
          <p className="text-sm text-slate-500 mt-2">Profile update requests</p>
        </div>
      </div>

      {/* Tab Selection Buttons */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-200/50 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("tasks")}
          className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${
            activeTab === "tasks"
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <BarChart3 size={16} /> Class Tasks
        </button>
        <button
          onClick={() => setActiveTab("students")}
          className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${
            activeTab === "students"
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Users size={16} /> Students
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${
            activeTab === "analytics"
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <PieChart size={16} /> Analytics
        </button>
        {pendingApprovals.length > 0 && (
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${
              activeTab === "pending"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <ShieldAlert
              size={16}
              className={activeTab === "pending" ? "text-amber-500" : ""}
            />
            Pending Actions
            <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] ml-1">
              {pendingApprovals.length}
            </span>
          </button>
        )}
      </div>

      {/* Main Content Areas */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === "pending" && pendingApprovals.length > 0 && (
          <section className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/40 shadow-sm overflow-hidden mb-8">
            <div className="p-6 bg-slate-50/50 border-b border-white/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100/70 text-amber-700 rounded-lg">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">
                    Student Profile Verifications
                  </h3>
                  <p className="text-xs text-slate-500">
                    Verify information changes requested by parents
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-amber-100/70 text-amber-700 text-[10px] font-black rounded-full uppercase tracking-widest">
                Action Required
              </span>
            </div>

            <div className="divide-y divide-slate-100/50">
              {paginatedPending.map((s) => (
                <div
                  key={s.id}
                  className="p-6 hover:bg-slate-50/30 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Left: Current Info */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bmc-yellow flex items-center justify-center text-xl font-black text-slate-800">
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                            Current Profile
                          </p>
                          <h4 className="font-bold text-slate-800">{s.name}</h4>
                          <p className="text-xs text-slate-500">{s.class}</p>
                        </div>
                      </div>
                    </div>

                    {/* Middle: Visual Comparison */}
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 py-4 px-8 bg-slate-100/30 rounded-2xl border border-white/40">
                      <div className="flex items-center gap-6 w-full">
                        <div className="flex-1 text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                            From
                          </p>
                          <p className="text-sm font-bold text-slate-500 line-through decoration-slate-300">
                            {s.name}
                          </p>
                          <p className="text-xs text-slate-400">{s.class}</p>
                        </div>
                        <div className="p-2 bg-white/70 rounded-full shadow-sm text-slate-400">
                          <ArrowRight size={16} />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-[10px] font-black text-amber-600 uppercase mb-1">
                            To
                          </p>
                          <p className="text-sm font-bold text-amber-700">
                            {s.pendingUpdate?.name}
                          </p>
                          <p className="text-xs text-amber-600 font-medium">
                            {s.pendingUpdate?.class}
                          </p>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Calendar size={12} /> Requested on{" "}
                        {new Date(
                          s.pendingUpdate!.requestDate,
                        ).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3 shrink-0 pt-2 lg:pt-0">
                      <div className="relative group w-fit">
                        <button
                          onClick={() => handleApproveStudent(s.id, false)}
                          className="px-6 py-3 rounded-xl border-2 border-white/40 text-sm font-black text-slate-600 hover:bg-red-50/70 hover:text-red-600 hover:border-red-200/40 transition-all flex items-center gap-2"
                        >
                          <X size={18} /> Reject
                        </button>
                        <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-white text-[11px] font-black px-4 py-2 rounded-xl shadow-2xl z-50 whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-100">
                          Discard these changes
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-slate-900 rotate-45" />
                        </div>
                      </div>

                      <div className="relative group w-fit">
                        <button
                          onClick={() => handleApproveStudent(s.id, true)}
                          className="px-8 py-3 bmc-blue text-white rounded-xl text-sm font-black shadow-xl shadow-blue-200 hover:bg-blue-800 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border-2 border-transparent"
                        >
                          <Check size={18} /> Approve Changes
                        </button>
                        <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-white text-[11px] font-black px-4 py-2 rounded-xl shadow-2xl z-50 whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-100">
                          Update student records officially
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-slate-900 rotate-45" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Pagination
              currentPage={pendingPage}
              totalPages={Math.ceil(pendingApprovals.length / ITEMS_PER_PAGE)}
              onPageChange={setPendingPage}
            />
          </section>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Tab Content */}
          <div className="lg:col-span-2 space-y-8">
            {activeTab === "tasks" && (
              <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-sm border border-white/40 overflow-hidden">
                <div className="p-6 border-b border-white/40 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-bold text-lg text-slate-800">
                    Class Task Progress
                  </h3>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Live Updates
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50/50 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <th className="px-6 py-4">Subject & Title</th>
                        <th className="px-6 py-4">Priority</th>
                        <th className="px-6 py-4">Due Date</th>
                        <th className="px-6 py-4">Progress</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/50">
                      {paginatedHomeworks.map((h) => {
                        const stats = getCompletionStats(h.id);
                        return (
                          <tr
                            key={h.id}
                            className="hover:bg-slate-50/30 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <p className="font-bold text-slate-800">
                                {h.subject}
                              </p>
                              <p className="text-sm text-slate-500">
                                {h.title}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="relative group w-fit">
                                <span
                                  className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                                    h.priority === HomeworkPriority.HIGH
                                      ? "bg-red-100/70 text-red-700"
                                      : h.priority === HomeworkPriority.MEDIUM
                                        ? "bg-amber-100/70 text-amber-700"
                                        : "bg-emerald-100/70 text-emerald-700"
                                  }`}
                                >
                                  {h.priority}
                                </span>
                                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-800 text-white text-[9px] px-2 py-1 rounded shadow-xl z-50 whitespace-nowrap pointer-events-none animate-in fade-in duration-100">
                                  Task urgency level
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                              {h.dueDate}
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-2 group relative w-fit">
                                <div className="flex justify-between text-[10px] font-bold">
                                  <span className="text-blue-600">
                                    Ack: {stats.acknowledged}/{stats.total}
                                  </span>
                                  <span className="text-emerald-600">
                                    Done: {stats.completed}/{stats.total}
                                  </span>
                                </div>
                                <div className="w-full h-2 bg-slate-100/50 rounded-full overflow-hidden flex">
                                  <div
                                    className="h-full bg-blue-500 transition-all duration-500"
                                    style={{
                                      width: `${stats.total > 0 ? (stats.acknowledged / stats.total) * 100 : 0}%`,
                                    }}
                                  ></div>
                                  <div
                                    className="h-full bg-emerald-500 transition-all duration-500"
                                    style={{
                                      width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%`,
                                    }}
                                  ></div>
                                </div>
                                {/* Progress Tooltip */}
                                <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-white text-[11px] font-black px-4 py-2 rounded-xl shadow-2xl z-50 whitespace-nowrap text-center pointer-events-none animate-in fade-in zoom-in-95 duration-100">
                                  Blue: Parents seen tasks
                                  <br />
                                  Green: Students finished
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-slate-900 rotate-45" />
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <Pagination
                    currentPage={homeworkPage}
                    totalPages={Math.ceil(homeworks.length / ITEMS_PER_PAGE)}
                    onPageChange={setHomeworkPage}
                  />
                  {homeworks.length === 0 && (
                    <div className="p-16 text-center">
                      <div className="w-24 h-24 mx-auto mb-4">
                        <ShieldPencil />
                      </div>
                      <p className="text-slate-400 font-bold">
                        No active tasks assigned yet.
                      </p>
                      <button
                        onClick={() => setShowForm(true)}
                        className="mt-4 text-bmc-red font-bold text-sm hover:underline"
                      >
                        Start by creating a new homework
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Student Roster & Progress Section */}
            {activeTab === "students" && (
              <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-sm border border-white/40 overflow-hidden">
                <div className="p-6 border-b border-white/40 flex justify-between items-center bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100/70 text-bmc-blue rounded-lg">
                      <Users size={20} />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800">
                      Student Roster & Overall Progress
                    </h3>
                  </div>
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={14}
                    />
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-white/50 border border-white/40 rounded-full text-xs font-bold outline-none focus:ring-2 focus:ring-bmc-blue/20 transition-all"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50/50 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <th className="px-6 py-4">Student Name</th>
                        <th className="px-6 py-4">Class</th>
                        <th className="px-6 py-4">Birthday</th>
                        <th className="px-6 py-4">Rank & XP</th>
                        <th className="px-6 py-4">Overall Completion</th>
                        <th className="px-6 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/50">
                      {paginatedStudents.map((s) => {
                        const studentTasks = homeworks.filter((h) =>
                          h.targetStudentIds.includes(s.id),
                        );
                        const studentRecords = records.filter(
                          (r) => r.studentId === s.id,
                        );
                        const completed = studentRecords.filter(
                          (r) => r.status === HomeworkStatus.COMPLETED,
                        ).length;
                        const total = studentTasks.length;
                        const rate =
                          total > 0 ? Math.round((completed / total) * 100) : 0;
                        const currentRank =
                          RANKS.find((r) => r.level === s.rank) || RANKS[0];

                        return (
                          <tr
                            key={s.id}
                            className="hover:bg-slate-50/30 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bmc-yellow flex items-center justify-center text-xs font-black text-slate-800 relative">
                                  {s.name.charAt(0)}
                                  {s.rank === 10 && (
                                    <div className="absolute -top-1 -right-1 text-[10px] animate-bounce">
                                      ✨
                                    </div>
                                  )}
                                </div>
                                <span className="font-bold text-slate-800">
                                  {s.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                              {s.class}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                              {s.birthday
                                ? new Date(s.birthday).toLocaleDateString(
                                    "en-MY",
                                    { day: "numeric", month: "short" },
                                  )
                                : "-"}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-lg">
                                    {currentRank.icon}
                                  </span>
                                  <span
                                    className={`text-xs font-black ${s.rank === 10 ? "text-bmc-red animate-pulse" : "text-slate-700"}`}
                                  >
                                    {currentRank.name}
                                  </span>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400">
                                  {s.xp} XP
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex-1 h-2 bg-slate-100/50 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full transition-all duration-1000 ${rate > 80 ? "bg-emerald-500" : rate > 40 ? "bg-amber-500" : "bg-red-500"}`}
                                    style={{ width: `${rate}%` }}
                                  />
                                </div>
                                <span className="text-xs font-black text-slate-700 min-w-[32px]">
                                  {rate}%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => setSelectedStudentHistory(s.id)}
                                className="text-xs font-black text-bmc-blue hover:underline flex items-center gap-1"
                              >
                                <TrendingUp size={14} /> View Journey
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <Pagination
                    currentPage={studentPage}
                    totalPages={Math.ceil(
                      filteredStudents.length / ITEMS_PER_PAGE,
                    )}
                    onPageChange={setStudentPage}
                  />
                  {filteredStudents.length === 0 && (
                    <div className="p-10 text-center text-slate-400 font-bold">
                      No students found matching your search.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Analytics Dashboard Section */}
            {activeTab === "analytics" && classAnalytics && (
              <div className="space-y-8">
                {/* Top Row: Summaries */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Subject Mastery Bar Chart */}
                  <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-white/40 shadow-sm">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-slate-800">
                      <BarChart3 className="text-bmc-blue" />
                      Subject Mastery
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={classAnalytics.subjectStats}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                          />
                          <YAxis 
                            hide 
                            domain={[0, 100]} 
                          />
                          <RechartsTooltip 
                            cursor={{ fill: '#f8fafc' }}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-slate-900 text-white p-3 rounded-xl shadow-2xl border border-white/10">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">
                                      {payload[0].payload.name}
                                    </p>
                                    <p className="text-sm font-black">
                                      {payload[0].value}% Completion
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar 
                            dataKey="rate" 
                            radius={[8, 8, 0, 0]}
                            animationDuration={1000}
                          >
                            {classAnalytics.subjectStats.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.rate > 80 ? '#10b981' : entry.rate > 50 ? '#3b82f6' : '#ef4444'} 
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Academic Trend Line Chart */}
                  <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-white/40 shadow-sm">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-slate-800">
                      <TrendingUp className="text-bmc-red" />
                      Academic Trend
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={classAnalytics.trendData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="date" 
                            hide
                          />
                          <YAxis hide domain={[0, 100]} />
                          <RechartsTooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-slate-900 text-white p-3 rounded-xl shadow-2xl border border-white/10">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">
                                      {new Date(payload[0].payload.date).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm font-black">
                                      {payload[0].value}% Avg Completion
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="rate" 
                            stroke="#e11d48" 
                            strokeWidth={4} 
                            dot={{ r: 4, fill: '#e11d48', strokeWidth: 0 }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                            animationDuration={1500}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Bottom Section: Support Required */}
                <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/40 shadow-sm overflow-hidden">
                  <div className="p-6 bg-red-50/50 border-b border-red-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 text-bmc-red rounded-lg">
                        <ShieldAlert size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">Support Required</h3>
                        <p className="text-xs text-slate-500">
                          Students identified as potentially struggling based on task completion
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-red-100/70 text-bmc-red text-[10px] font-black rounded-full uppercase tracking-widest">
                      Intervention Suggested
                    </span>
                  </div>
                  
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classAnalytics.strugglingStudents.length > 0 ? (
                      classAnalytics.strugglingStudents.map((s) => (
                        <div 
                          key={s.id} 
                          className="p-4 bg-white/80 rounded-2xl border border-red-100 shadow-sm flex items-center gap-4 group hover:scale-[1.02] transition-all cursor-pointer"
                          onClick={() => setSelectedStudentHistory(s.id)}
                        >
                          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-bmc-red text-sm font-black">
                            {s.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-800 text-sm group-hover:text-bmc-red transition-colors">
                              {s.name}
                            </h4>
                            <p className="text-[10px] font-black text-slate-400 uppercase">
                              {s.class} • {s.rate}% Success
                            </p>
                          </div>
                          <div className="text-bmc-red opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight size={16} />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-12 text-center text-slate-400 font-bold space-y-3">
                        <div className="w-16 h-16 mx-auto bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
                          <CheckCircle2 size={32} />
                        </div>
                        <p>No students identified as struggling. Keep up the great work!</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* AI-Powered Insight Card */}
                <div className="bg-slate-900 rounded-3xl p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <BrainCircuit size={120} className="text-white" />
                  </div>
                  <div className="relative z-10 max-w-xl">
                    <div className="flex items-center gap-2 text-bmc-yellow mb-4">
                      <Star size={20} fill="currentColor" />
                      <span className="text-xs font-black uppercase tracking-[0.2em]">Automated Insight</span>
                    </div>
                    <h3 className="text-2xl font-black text-white mb-4 leading-tight">
                      {classAnalytics.strugglingStudents.length > 0 
                        ? `Targeted intervention recommended for ${classAnalytics.strugglingStudents.length} students.`
                        : "Overall class momentum is exceptionally strong this period."
                      }
                    </h3>
                    <p className="text-slate-400 text-sm mb-8 leading-relaxed font-medium">
                      Our system detects that homework completion is highest on Tuesdays and Wednesdays. 
                      Consider scheduling complex tasks mid-week to leverage peak parent-student engagement cycles.
                    </p>
                    <button 
                      onClick={() => setActiveTab("tasks")}
                      className="bg-white text-slate-900 px-6 py-3 rounded-xl text-xs font-black hover:bg-bmc-yellow transition-all flex items-center gap-2 active:scale-95 shadow-xl shadow-white/5"
                    >
                      Optimize Schedule <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Individual Student Journey Sidebar */}
          <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-sm border border-white/40 overflow-hidden flex flex-col min-w-0">
            <div className="p-6 border-b border-white/40 bg-slate-50/50">
              <h3 className="font-bold text-lg flex items-center gap-2 text-slate-800">
                <Activity size={20} className="text-bmc-red" />
                Student Performance
              </h3>
            </div>

            <div className="p-4 border-b border-white/40">
              <select
                className="w-full p-3 bg-white/50 border border-white/40 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-bmc-red/20 transition-all"
                value={selectedStudentHistory || ""}
                onChange={(e) =>
                  setSelectedStudentHistory(e.target.value || null)
                }
              >
                <option value="">Select a student...</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.class})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-6 bg-slate-50/30 border-b border-white/40">
              {performanceMetrics ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        Learning Momentum
                      </h4>
                      <p className="text-[10px] text-slate-500 font-bold">
                        Completion rate over time
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-emerald-600">
                        {performanceMetrics.timeline[
                          performanceMetrics.timeline.length - 1
                        ]?.rate || 0}
                        %
                      </span>
                      <div className="flex items-center gap-1 text-[9px] font-black text-emerald-500 uppercase">
                        <TrendingUp size={10} /> Improving
                      </div>
                    </div>
                  </div>

                  <div className="h-48 w-full min-h-[192px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={performanceMetrics.timeline}>
                        <defs>
                          <linearGradient
                            id="colorRate"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#10b981"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#10b981"
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
                                  <p className="text-[9px] font-bold text-emerald-400 mt-1 flex items-center gap-1">
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
                          stroke="#10b981"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorRate)"
                          animationDuration={1500}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center border-2 border-dashed border-white/40 rounded-3xl bg-white/30 space-y-2">
                  <BarChart3 size={32} className="text-slate-200" />
                  <p className="text-[10px] text-slate-400 font-black uppercase text-center px-6 leading-relaxed">
                    Select a student above to see their detailed learning
                    journey
                  </p>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[350px]">
              {paginatedHistory.map((h) => (
                <div
                  key={h.id}
                  className={`p-4 rounded-2xl border transition-all duration-300 ${
                    h.status === HomeworkStatus.COMPLETED
                      ? "bg-emerald-50/50 border-emerald-100 shadow-sm shadow-emerald-500/5 hover:bg-emerald-50"
                      : "bg-white/50 border-white/40 hover:bg-white/80"
                  } space-y-2 relative overflow-hidden`}
                >
                  {h.status === HomeworkStatus.COMPLETED && (
                    <div className="absolute -right-1 -top-1 opacity-10">
                      <Trophy size={48} className="text-emerald-500" />
                    </div>
                  )}
                  <div className="flex justify-between items-start relative z-10">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          {h.subject}
                        </p>
                        {h.status === HomeworkStatus.COMPLETED && (
                          <div className="bg-emerald-500 rounded-full p-0.5" title="Achievement Unlocked!">
                            <Trophy size={8} className="text-white" />
                          </div>
                        )}
                      </div>
                      <h4 className={`font-bold text-sm ${h.status === HomeworkStatus.COMPLETED ? "text-emerald-900" : "text-slate-800"}`}>
                        {h.title}
                      </h4>
                    </div>
                    <span
                      className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                        h.status === HomeworkStatus.COMPLETED
                          ? "bg-emerald-500 text-white shadow-sm"
                          : "bg-slate-200/70 text-slate-500"
                      }`}
                    >
                      {h.status}
                    </span>
                  </div>
                </div>
              ))}
              <Pagination
                currentPage={historyPage}
                totalPages={Math.ceil(
                  studentPerformanceHistory.length / ITEMS_PER_PAGE,
                )}
                onPageChange={setHistoryPage}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Homework Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in duration-300">
            <div className="p-8 bmc-red text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black">
                  Assign New Bulk Homework
                </h3>
                <p className="text-white/70 text-sm mt-1">
                  Multi-student assignment flow
                </p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="bg-white/20 hover:bg-white/30 p-3 rounded-2xl transition-all"
              >
                <Plus className="rotate-45" size={24} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-10"
            >
              <div className="space-y-6">
                <h4 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                  <Info size={18} className="text-bmc-red" />
                  Task Information
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">
                      Subject
                    </label>
                    <input
                      required
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all font-bold"
                      placeholder="e.g. Mathematics"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">
                      Task Title
                    </label>
                    <input
                      required
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all font-bold"
                      placeholder="e.g. Fractions Exercise"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all font-bold"
                      value={formData.dueDate}
                      onChange={(e) =>
                        setFormData({ ...formData, dueDate: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">
                      Optional Snapshot
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all font-bold"
                      onChange={handleSnapshotUpload}
                    />
                    {formData.snapshot && (
                      <img
                        src={formData.snapshot}
                        alt="Snapshot"
                        className="mt-2 w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">
                      Instructions
                    </label>
                    <textarea
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl h-32 outline-none focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all font-medium"
                      placeholder="Detailed steps for students..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-slate-800 flex items-center gap-2">
                    <Users size={18} className="text-bmc-blue" />
                    Target Students ({formData.targetStudentIds.length})
                  </h4>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={selectAllStudents}
                      className="text-[10px] font-black text-bmc-blue hover:bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 transition-all uppercase tracking-widest"
                    >
                      {filteredStudents.length > 0 &&
                      filteredStudents.every((student) =>
                        formData.targetStudentIds.includes(student.id),
                      )
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                    <div className="relative">
                      <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={14}
                      />
                      <input
                        className="pl-9 pr-4 py-1.5 border border-slate-200 rounded-full text-[10px] font-bold outline-none focus:ring-2 focus:ring-red-500/20"
                        placeholder="Search Class..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto border border-slate-100 rounded-[32px] bg-slate-50/50 p-3 space-y-1">
                  {filteredStudents.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleStudent(s.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                        formData.targetStudentIds.includes(s.id)
                          ? "bg-red-50 border border-red-200 shadow-sm"
                          : "hover:bg-white border border-transparent"
                      }`}
                    >
                      <div className="text-left">
                        <p className="text-sm font-bold text-slate-800">
                          {s.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          {s.class}
                        </p>
                      </div>
                      {formData.targetStudentIds.includes(s.id) ? (
                        <CheckCircle2 size={18} className="text-bmc-red" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-200" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="col-span-full pt-8 border-t mt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-8 py-4 bg-slate-100 rounded-2xl font-black text-slate-500 hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formData.targetStudentIds.length === 0}
                  className="flex-1 px-8 py-4 bmc-red text-white rounded-2xl font-black shadow-xl shadow-red-200 hover:bg-red-800 disabled:opacity-50 active:scale-95 transition-all"
                >
                  Create Task for {formData.targetStudentIds.length} Students
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
