import { useState, useEffect } from "react";
import axios from "axios";

/* ─── Data ──────────────────────────────────────────────────────────────── */
const lecturers = [
  "Mr. M. Amarnath", "G.Mamatha", "G.Jayarao",
  "N.Sujatha Guptha", "Ch Navitha", "S.Tulasiram",
];

const subjects = [
  "M F D S", "P A I", "Theory of Computation", "BES", "EEA",
];

import { useAuth } from "../../../../context/AuthContext";
import { getStudentsList } from "../../../../API/erpApi";
import { toast as hotToast, Toaster } from "react-hot-toast";

/* ─── Status config (same cycle logic) ──────────────────────────────────── */
/* ─── Status config (same cycle logic) ──────────────────────────────────── */
const CYCLE = { A: "P", P: "L", L: "A" };

const STATUS_CFG = {
  P: {
    row:   "bg-emerald-50 border-emerald-200 hover:border-emerald-400",
    badge: "bg-emerald-500 text-white",
    dot:   "bg-emerald-400",
    label: "Present",
  },
  A: {
    row:   "bg-white border-zinc-200 hover:border-zinc-400",
    badge: "bg-zinc-300 text-zinc-700",
    dot:   "bg-zinc-300",
    label: "Absent",
  },
  L: {
    row:   "bg-amber-50 border-amber-300 hover:border-amber-500",
    badge: "bg-amber-400 text-white",
    dot:   "bg-amber-400",
    label: "Late",
  },
};

/* ─── Main ───────────────────────────────────────────────────────────────── */
export default function AttendanceForm() {
  const { user } = useAuth();
  
  const [lecturer, setLecturer]               = useState(user?.name || "");
  const [subject, setSubject]                 = useState("");
  const [time, setTime]                       = useState("");
  const [attendanceDate, setAttendanceDate]   = useState("");
  const [attendanceList, setAttendanceList]   = useState([]);
  const [rawStudents, setRawStudents]         = useState([]);
  const [search, setSearch]                   = useState("");
  const [submitting, setSubmitting]           = useState(false);
  const [toastMsg, setToastMsg]               = useState("");
  const [loadingStudents, setLoadingStudents] = useState(true);

    useEffect(() => {
      const fetchStudents = async () => {
        try {
          const data = await getStudentsList();
          setRawStudents(data);
          
          const initList = data.map((s) => ({
            studentId: s.id,
            studentName: `${s.studRollNo} - ${s.studName}`,
            status: "A",
            checkInTime: ""
          }));
          
          setAttendanceList(initList);
        } catch (error) {
          console.error("Failed to load students", error);
        } finally {
          setLoadingStudents(false);
        }
      };
      
      fetchStudents();
    }, []);

  /* counts */
  const counts = attendanceList.reduce(
    (acc, s) => { acc[s.status]++; return acc; },
    { P: 0, A: 0, L: 0 }
  );
  const marked       = counts.P + counts.L;
  const completionPct = attendanceList.length > 0 ? Math.round((marked / attendanceList.length) * 100) : 0;

  /* handlers — identical logic to original */
  const cycleStatus = (idx) =>
    setAttendanceList((prev) =>
      prev.map((s, i) =>
        i === idx
          ? { ...s, status: CYCLE[s.status], checkInTime: CYCLE[s.status] !== "L" ? "" : s.checkInTime }
          : s
      )
    );

  const setCheckIn = (idx, val) =>
    setAttendanceList((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, checkInTime: val } : s))
    );

  const markAll = (status) =>
    setAttendanceList((prev) => prev.map((s) => ({ ...s, status, checkInTime: "" })));

  const filtered = attendanceList
    .map((s, i) => ({ ...s, _idx: i }))
    .filter((s) => s.studentName.toLowerCase().includes(search.toLowerCase()));

  const toast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      lecturer,
      subject,
      time: time + ":00",
      attendanceDate,
      attendanceList: attendanceList.map((s) => ({
        studentId: s.studentId,
        studentName: s.studentName,
        status: s.status === "L" && s.checkInTime ? `L:${s.checkInTime}` : s.status,
        checkInTime: s.checkInTime
      })),
    };
    try {
      await axiosInstance.post("/api/attendance/mark", payload);
      hotToast.success("Attendance submitted successfully!");
      setSubject(""); setTime(""); setAttendanceDate("");
      
      // Reset list to absent
      setAttendanceList((prev) => prev.map((s) => ({ ...s, status: "A", checkInTime: "" })));
    } catch (err) {
      console.error(err);
      hotToast.error("Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── Tiny reusable pieces ───────────────────────────────────────────────── */
  const Label = ({ children }) => (
    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
      {children}
    </label>
  );

  const inputCls =
    "w-full border border-zinc-200 bg-zinc-50 rounded-lg px-3 py-2.5 text-sm text-zinc-800 " +
    "focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition placeholder-zinc-300";

  return (
    <>
      <Toaster position="top-center" />
      {/* ── Styles ──────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Outfit', sans-serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          0%   { opacity: 0; transform: scale(0.88); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes progressShine {
          0%   { background-position: -300px 0; }
          100% { background-position: 300px 0; }
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .page-enter { animation: fadeUp 0.45s ease both; }
        .row-enter  { animation: fadeUp 0.3s ease both; }
        .popin      { animation: popIn 0.2s cubic-bezier(.34,1.56,.64,1) both; }
        .toast-show { animation: toastIn 0.3s ease both; }

        .shine-bar {
          background: linear-gradient(90deg, #6366f1 0%, #818cf8 50%, #6366f1 100%);
          background-size: 300px 100%;
          animation: progressShine 1.8s linear infinite;
        }

        .student-row {
          transition: box-shadow 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
        }
        .student-row:active { transform: scale(0.987); }
      `}</style>

      <div className="min-h-screen bg-[#f4f5f7] py-8 px-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
        <div className="max-w-6xl mx-auto space-y-4 page-enter">

          {/* ── Toast ─────────────────────────────────────────────── */}
          {toastMsg && (
            <div className={`toast-show fixed top-5 left-1/2 -translate-x-1/2 z-50
              px-6 py-3 rounded-xl shadow-xl text-sm font-semibold text-white
              ${toastMsg.includes("failed") ? "bg-red-500" : "bg-emerald-600"}`}>
              {toastMsg.includes("failed") ? "✕ " : "✓ "}{toastMsg}
            </div>
          )}

          {/* ── Header ────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3
            bg-white rounded-2xl border border-zinc-200 shadow-sm px-6 py-4">
            <div>
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-0.5">
                College ERP · Attendance
              </p>
              <h1 className="text-2xl font-extrabold text-zinc-900 leading-none tracking-tight">
                Attendance Register
              </h1>
              <p className="text-xs text-zinc-400 mt-1">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long", day: "numeric", month: "long", year: "numeric",
                })}
              </p>
            </div>

            {/* Stat counters */}
            <div className="flex gap-2 shrink-0">
              {[
                { key: "P", label: "Present", ring: "ring-emerald-200", bg: "bg-emerald-50",  text: "text-emerald-700" },
                { key: "L", label: "Late",    ring: "ring-amber-200",   bg: "bg-amber-50",    text: "text-amber-700"   },
                { key: "A", label: "Absent",  ring: "ring-zinc-200",    bg: "bg-zinc-100",    text: "text-zinc-600"    },
              ].map(({ key, label, ring, bg, text }) => (
                <div key={key} className={`flex flex-col items-center px-4 py-2 rounded-xl ring-1 ${ring} ${bg}`}>
                  <span className={`text-2xl font-black leading-none ${text}`}>{counts[key]}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wide ${text} opacity-70`}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Progress bar ──────────────────────────────────────── */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm px-5 py-3 flex items-center gap-4">
            <span className="text-xs font-bold text-zinc-400 shrink-0 w-24">
              {marked} marked
            </span>
            <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full shine-bar transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <span className="text-xs font-extrabold text-indigo-600 shrink-0 w-10 text-right">
              {completionPct}%
            </span>
          </div>

          {/* ── Main Panel ────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden
            flex flex-col lg:flex-row">

            {/* ── LEFT: Session form ──────────────────────────────── */}
            <div className="w-full lg:w-72 xl:w-80 shrink-0 bg-zinc-50/80 border-b lg:border-b-0
              lg:border-r border-zinc-100 p-6 space-y-5">

              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Session Details
              </p>

              <div className="space-y-4">
                <div>
                  <Label>Lecturer</Label>
                  <input type="text" value={lecturer} readOnly
                    className={inputCls + " bg-zinc-200 text-zinc-600 cursor-not-allowed"} required />
                </div>

                <div>
                  <Label>Subject</Label>
                  <select value={subject} onChange={(e) => setSubject(e.target.value)}
                    className={inputCls} required>
                    <option value="">Select subject</option>
                    {subjects.map((s, i) => <option key={i}>{s}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Start Time</Label>
                    <input type="time" value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className={inputCls} required />
                  </div>
                  <div>
                    <Label>Date</Label>
                    <input type="date" value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      className={inputCls} required />
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-200 pt-4">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">
                  Quick Mark
                </p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => markAll("P")}
                    className="flex-1 py-2 text-xs font-bold rounded-lg bg-emerald-500 text-white
                               hover:bg-emerald-600 active:scale-95 transition shadow-sm">
                    All Present
                  </button>
                  <button type="button" onClick={() => markAll("A")}
                    className="flex-1 py-2 text-xs font-bold rounded-lg bg-zinc-200 text-zinc-600
                               hover:bg-zinc-300 active:scale-95 transition">
                    All Absent
                  </button>
                </div>
              </div>

              <button
               onClick={handleSubmit}
                 disabled={submitting}
                className="w-full py-3 rounded-xl text-white text-sm font-bold tracking-wide
                           bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50
                           shadow-md shadow-indigo-200/60 transition"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10"
                        stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Submitting…
                  </span>
                ) : "Submit Attendance"}
              </button>

              {/* Legend */}
              <div className="text-[10px] text-zinc-400 leading-6 border-t border-zinc-100 pt-3 space-y-0.5">
                <p><span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-2" />1 click → Present</p>
                <p><span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-2" />2 clicks → Late (+ check-in time)</p>
                <p><span className="inline-block w-2 h-2 rounded-full bg-zinc-300 mr-2" />3 clicks → Absent</p>
              </div>
            </div>

            {/* ── RIGHT: Student list ──────────────────────────────── */}
            <div className="flex-1 flex flex-col p-5">

              {/* Search bar */}
              <div className="relative mb-3">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name or roll number…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border border-zinc-200 bg-zinc-50 rounded-xl pl-10 pr-4 py-2.5
                             text-sm text-zinc-700 placeholder-zinc-300
                             focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
                />
              </div>

              {/* Column header */}
              <div className="flex items-center px-4 mb-1.5 text-[10px] font-bold
                text-zinc-400 uppercase tracking-widest">
                <span className="w-20 shrink-0">Roll No.</span>
                <span className="flex-1">Student Name</span>
                <span>Status</span>
              </div>

              {/* Rows */}
              <div className="overflow-y-auto flex-1 max-h-[500px] space-y-1 pr-0.5">
                {filtered.length === 0 && (
                  <div className="text-center py-16 text-zinc-300 text-sm">
                    No students match "{search}"
                  </div>
                )}

                {filtered.map((student, loopIdx) => {
                  const cfg = STATUS_CFG[student.status];
                  const dashIdx = student.studentName.indexOf(" - ");
                  const rollNo  = student.studentName.slice(0, dashIdx);
                  const name    = student.studentName.slice(dashIdx + 3);

                  return (
                    <div
                      key={student._idx}
                      onClick={() => cycleStatus(student._idx)}
                      style={{ animationDelay: `${Math.min(loopIdx * 6, 200)}ms` }}
                      className={`student-row row-enter flex items-center justify-between
                        px-4 py-2.5 rounded-xl border cursor-pointer select-none
                        ${cfg.row} hover:shadow-sm`}
                    >
                      {/* Left */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                        <span className="text-[11px] font-bold text-zinc-400 w-20 shrink-0 tabular-nums">
                          {rollNo}
                        </span>
                        <span className="text-sm font-semibold text-zinc-800 truncate">
                          {name}
                        </span>
                      </div>

                      {/* Right */}
                      <div className="flex items-center gap-2 shrink-0">
                        {student.status === "L" && (
                          <input
                            type="time"
                            value={student.checkInTime}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => setCheckIn(student._idx, e.target.value)}
                            title="Actual check-in time"
                            className="popin text-xs border border-amber-300 rounded-lg px-2 py-1
                                       bg-white text-amber-800 focus:outline-none focus:ring-1 focus:ring-amber-400"
                          />
                        )}
                        <span className={`text-[11px] font-bold px-3 py-1 rounded-lg ${cfg.badge}`}>
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-right text-[11px] text-zinc-400 mt-2 font-medium">
                Showing {filtered.length} of {attendanceList.length} students
              </p>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}