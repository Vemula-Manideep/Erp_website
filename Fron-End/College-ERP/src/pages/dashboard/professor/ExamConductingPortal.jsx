import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Typography,
  Chip,
  Input,
  Alert,
  Progress,
} from "@material-tailwind/react";
import {
  PlayIcon,
  StopIcon,
  EyeIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/solid";

import {
  getTeacherExams,
  getExamAttempts,
} from "@/API/ExamApi";

export default function ExamConductingPortal() {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examAttempts, setExamAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attemptsLoading, setAttemptsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const refreshTimer = useRef(null);
  const professorId = localStorage.getItem("professorId");

  // ===== TOAST =====
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3500);
  };

  // ===== FETCH PROFESSOR'S EXAMS =====
  useEffect(() => {
    loadProfessorExams();
  }, []);

  const loadProfessorExams = async () => {
    try {
      setLoading(true);
      if (!professorId) {
        showToast("⚠️ No professor ID found. Please log in again.", "warning");
        setExams([]);
        return;
      }
      const response = await getTeacherExams(professorId);
      setExams(response || []);
    } catch (error) {
      showToast("❌ Error loading exams: " + (error?.message || error || "Unknown error"), "error");
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  // ===== FETCH EXAM ATTEMPTS =====
  const loadExamAttempts = async (examId, silent = false) => {
    try {
      if (!silent) setAttemptsLoading(true);
      const response = await getExamAttempts(examId);
      setExamAttempts(response || []);
    } catch (error) {
      if (!silent) showToast("❌ Error loading attempts: " + (error?.message || error || "Unknown error"), "error");
    } finally {
      if (!silent) setAttemptsLoading(false);
    }
  };

  // ===== AUTO-REFRESH =====
  useEffect(() => {
    if (refreshTimer.current) clearInterval(refreshTimer.current);
    if (autoRefresh && selectedExam) {
      refreshTimer.current = setInterval(
        () => loadExamAttempts(selectedExam.id, true),
        5000
      );
    }
    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
    };
  }, [autoRefresh, selectedExam]);

  // ===== HANDLE EXAM SELECTION =====
  const handleExamSelect = async (exam) => {
    setSelectedExam(exam);
    setExamAttempts([]);
    setFilterStatus("ALL");
    setSearchTerm("");
    await loadExamAttempts(exam.id);
  };

  const handleBack = () => {
    setSelectedExam(null);
    setExamAttempts([]);
    if (refreshTimer.current) clearInterval(refreshTimer.current);
  };

  // ===== FILTER ATTEMPTS =====
  const getFilteredAttempts = () => {
    let list = examAttempts;
    if (filterStatus === "ACTIVE") list = list.filter((a) => a.status === "IN_PROGRESS");
    else if (filterStatus === "SUBMITTED") list = list.filter((a) => a.status === "SUBMITTED");
    if (searchTerm) {
      list = list.filter(
        (a) =>
          a.studentId?.toString().includes(searchTerm) ||
          a.id?.toString().includes(searchTerm)
      );
    }
    return list;
  };

  // ===== STATISTICS =====
  const getStats = () => {
    const total = examAttempts.length;
    const active = examAttempts.filter((a) => a.status === "IN_PROGRESS").length;
    const submitted = examAttempts.filter((a) => a.status === "SUBMITTED").length;
    const avgScore =
      submitted > 0
        ? (
            examAttempts
              .filter((a) => a.status === "SUBMITTED")
              .reduce((sum, a) => sum + (a.totalScore || 0), 0) / submitted
          ).toFixed(1)
        : "—";
    return { total, active, submitted, avgScore };
  };

  // ===== TIME REMAINING =====
  const calcTimeRemaining = (attempt, exam) => {
    if (attempt.status !== "IN_PROGRESS") return "—";
    const start = new Date(attempt.startedAt).getTime();
    const end = start + (exam.duration || 0) * 60 * 1000;
    const remaining = end - Date.now();
    if (remaining <= 0) return "Expired";
    const m = Math.floor(remaining / 60000);
    const s = Math.floor((remaining % 60000) / 1000);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const statusColors = {
    IN_PROGRESS: { chip: "blue",   dot: "bg-blue-500",   label: "In Progress" },
    SUBMITTED:   { chip: "green",  dot: "bg-green-500",  label: "Submitted"   },
    AUTO_SUBMITTED: { chip: "amber", dot: "bg-amber-500", label: "Auto-Submitted" },
    ABANDONED:   { chip: "red",    dot: "bg-red-400",    label: "Abandoned"   },
  };

  const getStatusCfg = (status) =>
    statusColors[status] || { chip: "gray", dot: "bg-gray-400", label: status };

  // ===== LOADING =====
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-gray-200" />
          <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  // ===== EXAM LIST VIEW =====
  const renderExamsList = () => {
    const filtered = exams.filter(
      (e) =>
        e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.subject?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <Card className="shadow-md overflow-hidden">
        <CardHeader color="blue" className="p-4 m-0 rounded-none">
          <Typography variant="h6" color="white">
            📊 My Exams — Conducting Monitor
          </Typography>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-blue-gray-50 border-b border-blue-gray-100">
                <tr>
                  {["Exam Title", "Subject", "Duration", "Status", "Total Marks", "Action"].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold text-blue-gray-600 text-xs uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">
                      {exams.length === 0
                        ? "No exams found. Create an exam first from Exam Management."
                        : `No exams match "${searchTerm}"`}
                    </td>
                  </tr>
                ) : (
                  filtered.map((exam, idx) => (
                    <tr
                      key={exam.id}
                      className={`border-b border-blue-gray-50 hover:bg-blue-50/40 transition-colors ${
                        idx % 2 === 0 ? "bg-white" : "bg-blue-gray-50/30"
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-800">{exam.title}</td>
                      <td className="px-4 py-3 text-gray-600">{exam.subject || "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{exam.duration} min</td>
                      <td className="px-4 py-3">
                        <Chip
                          value={exam.status || "DRAFT"}
                          color={exam.status === "PUBLISHED" ? "green" : "gray"}
                          size="sm"
                          variant="filled"
                          className="text-xs"
                        />
                      </td>
                      <td className="px-4 py-3 text-gray-600">{exam.totalMarks}</td>
                      <td className="px-4 py-3">
                        <Button
                          size="sm"
                          color="blue"
                          variant="outlined"
                          onClick={() => handleExamSelect(exam)}
                          className="flex items-center gap-1.5 normal-case text-xs"
                        >
                          <EyeIcon className="w-3.5 h-3.5" />
                          Monitor
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    );
  };

  // ===== ATTEMPTS DETAIL VIEW =====
  const renderAttemptsDetail = () => {
    const stats = getStats();
    const filtered = getFilteredAttempts();

    return (
      <div className="space-y-5">
        {/* Back button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Exam List
        </button>

        {/* Exam title */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl p-5 shadow-md">
          <Typography variant="h5" className="font-bold">
            📋 {selectedExam.title}
          </Typography>
          <Typography variant="small" className="opacity-80 mt-0.5">
            {selectedExam.subject} · {selectedExam.duration} min · {selectedExam.totalMarks} marks
          </Typography>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Attempts", value: stats.total,     color: "text-blue-600",   bg: "bg-blue-50" },
            { label: "Active Now",     value: stats.active,    color: "text-green-600",  bg: "bg-green-50" },
            { label: "Submitted",      value: stats.submitted, color: "text-purple-600", bg: "bg-purple-50" },
            { label: "Avg Score",      value: stats.avgScore,  color: "text-orange-600", bg: "bg-orange-50" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-xl p-4 border border-white shadow-sm`}>
              <p className="text-xs text-gray-500 font-medium mb-0.5">{label}</p>
              <p className={`text-2xl font-black ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap items-center">
          <Input
            label="Search by Student ID or Attempt ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="min-w-56"
          />
          <div className="flex gap-2">
            {["ALL", "ACTIVE", "SUBMITTED"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                  filterStatus === s
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <Button
            size="sm"
            color="blue"
            variant="outlined"
            onClick={() => loadExamAttempts(selectedExam.id)}
            className="flex items-center gap-1.5 normal-case text-xs"
          >
            <ArrowPathIcon className="w-3.5 h-3.5" />
            Refresh
          </Button>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            Auto-refresh (5s)
          </label>
          {autoRefresh && (
            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
              Live
            </span>
          )}
        </div>

        {/* Attempts Table */}
        <Card className="shadow-md overflow-hidden">
          <CardHeader color="blue" className="p-4 m-0 rounded-none">
            <Typography variant="h6" color="white">
              Student Attempts ({filtered.length})
            </Typography>
          </CardHeader>
          <CardBody className="p-0">
            {attemptsLoading ? (
              <div className="flex justify-center py-12">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full border-t-4 border-b-4 border-gray-200" />
                  <div className="absolute top-0 left-0 h-10 w-10 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin" />
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-blue-gray-50 border-b border-blue-gray-100">
                    <tr>
                      {["#", "Student ID", "Status", "Time Left", "Score", "Correct", "Progress", "Started At"].map((h) => (
                        <th key={h} className="px-4 py-3 font-semibold text-blue-gray-600 text-xs uppercase tracking-wide">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-12 text-gray-400">
                          {examAttempts.length === 0
                            ? "No students have started this exam yet"
                            : `No attempts match the current filters`}
                        </td>
                      </tr>
                    ) : (
                      filtered.map((attempt, idx) => {
                        const cfg = getStatusCfg(attempt.status);
                        const timeLeft = calcTimeRemaining(attempt, selectedExam);
                        const answered =
                          (attempt.correctAnswers || 0) +
                          (attempt.wrongAnswers || 0) +
                          (attempt.unansweredQuestions || 0);
                        const total = selectedExam.questionCount || 1;
                        const pct = Math.min(Math.round((answered / total) * 100), 100);

                        return (
                          <tr
                            key={attempt.id}
                            className={`border-b border-blue-gray-50 hover:bg-blue-50/30 transition-colors ${
                              idx % 2 === 0 ? "bg-white" : "bg-blue-gray-50/20"
                            }`}
                          >
                            <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                              #{attempt.id}
                            </td>
                            <td className="px-4 py-3 font-medium text-gray-700">
                              {attempt.studentId}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                                ${cfg.chip === "blue"  ? "bg-blue-100 text-blue-700"   : ""}
                                ${cfg.chip === "green" ? "bg-green-100 text-green-700" : ""}
                                ${cfg.chip === "amber" ? "bg-amber-100 text-amber-700" : ""}
                                ${cfg.chip === "red"   ? "bg-red-100 text-red-700"     : ""}
                                ${cfg.chip === "gray"  ? "bg-gray-100 text-gray-600"   : ""}
                              `}>
                                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                {cfg.label}
                              </span>
                            </td>
                            <td className={`px-4 py-3 font-mono text-xs font-bold ${
                              attempt.status === "IN_PROGRESS" ? "text-blue-600" : "text-gray-400"
                            }`}>
                              {timeLeft}
                            </td>
                            <td className="px-4 py-3 font-bold text-green-700">
                              {attempt.totalScore ?? "—"}/{selectedExam.totalMarks}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {attempt.correctAnswers ?? "—"}
                            </td>
                            <td className="px-4 py-3">
                              <div className="w-20">
                                <Progress value={pct} size="sm" color="blue" />
                                <span className="text-[10px] text-gray-400 mt-0.5 block">{pct}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500">
                              {attempt.startedAt
                                ? new Date(attempt.startedAt).toLocaleTimeString()
                                : "—"}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold text-white animate-fade-in
          ${toast.type === "error"   ? "bg-red-500"    : ""}
          ${toast.type === "success" ? "bg-green-600"  : ""}
          ${toast.type === "warning" ? "bg-amber-500"  : ""}
          ${toast.type === "info"    ? "bg-blue-600"   : ""}
        `}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      {!selectedExam && (
        <div className="mb-2">
          <Typography variant="h4" className="font-bold text-gray-800">
            🎓 Exam Conducting Portal
          </Typography>
          <Typography variant="small" className="text-gray-500 mt-1">
            Monitor ongoing exams, track student progress, and manage attempts in real-time
          </Typography>
        </div>
      )}

      {/* Search + Refresh (exam list view only) */}
      {!selectedExam && (
        <div className="flex gap-3 flex-wrap">
          <Input
            label="Search exams by title or subject"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-52"
          />
          <Button
            color="blue"
            onClick={loadProfessorExams}
            className="flex items-center gap-2 normal-case"
          >
            <ArrowPathIcon className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      )}

      {/* Main Content */}
      {selectedExam ? renderAttemptsDetail() : renderExamsList()}
    </div>
  );
}
