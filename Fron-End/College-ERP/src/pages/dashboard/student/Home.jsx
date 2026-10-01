import React, { useState, useEffect } from "react";
import {
  Typography,
  Card,
  Progress,
  Chip,
  Tooltip,
} from "@material-tailwind/react";
import { 
  AcademicCapIcon,
  CheckBadgeIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  FireIcon
} from "@heroicons/react/24/solid";
import { useAuth } from "../../../context/AuthContext";
import { getAttendanceSummary } from "../../../API/erpApi";

export default function AnalyticsOnlyDashboard() {
  const { user } = useAuth();
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      if (user?.id) {
        try {
          const data = await getAttendanceSummary(user.id);
          setAttendanceData(data);
        } catch (error) {
          console.error("Failed to fetch attendance summary", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchSummary();
  }, [user]);

  // Stats Calculation
  const totalClasses = attendanceData.reduce((acc, s) => acc + s.total, 0) || 1; // Prevent div by 0
  const totalPresent = attendanceData.reduce((acc, s) => acc + s.present, 0);
  const overall = totalClasses > 1 ? Math.round((totalPresent / totalClasses) * 100) : 0;

  // Semester Progress (Day 65 of 90)
  const semProgress = 72; 

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-800 p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-100 transition-transform hover:rotate-3">
              <AcademicCapIcon className="h-10 w-10 text-white" />
            </div>
            <div>
              <Typography variant="h3" className="text-slate-900 font-black tracking-tight">
                Academic Performance
              </Typography>
              <div className="flex items-center gap-2 mt-1">
                <Chip variant="ghost" size="sm" value="Semester IV" className="rounded-full bg-indigo-50 text-indigo-700" />
                <Typography className="text-slate-400 text-xs font-bold uppercase tracking-widest ml-2">
                  Last Updated: Today, 6:15 PM
                </Typography>
              </div>
            </div>
          </div>

          <div className="flex gap-8 items-center bg-white px-8 py-4 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="text-center">
              <Typography className="text-[10px] font-black text-slate-400 uppercase mb-1">Attendance</Typography>
              <Typography variant="h4" className={`font-black ${overall >= 75 ? 'text-indigo-600' : 'text-orange-600'}`}>
                {overall}%
              </Typography>
            </div>
            <div className="h-8 w-[1px] bg-slate-100"></div>
            <div className="text-center">
              <Typography className="text-[10px] font-black text-slate-400 uppercase mb-1">Standing</Typography>
              <Typography variant="h4" className="text-slate-900 font-black">Elite</Typography>
            </div>
          </div>
        </div>

        {/* --- TOP ROW: PROGRESS CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Semester Progress Circular */}
          <Card className="p-8 rounded-[3rem] shadow-sm border border-slate-50 flex flex-col items-center justify-center">
            <div className="relative h-32 w-32 flex items-center justify-center mb-4">
              <svg className="absolute h-full w-full -rotate-90">
                <circle cx="64" cy="64" r="58" fill="transparent" stroke="#F1F5F9" strokeWidth="10" />
                <circle cx="64" cy="64" r="58" fill="transparent" stroke="#4F46E5" strokeWidth="10" 
                        strokeDasharray="364.4" strokeDashoffset={364.4 - (364.4 * semProgress) / 100} 
                        strokeLinecap="round" className="transition-all duration-1000" />
              </svg>
              <Typography variant="h3" className="font-black text-indigo-600">{semProgress}%</Typography>
            </div>
            <Typography className="text-sm font-bold text-slate-700">Semester Progress</Typography>
            <Typography className="text-xs text-slate-400 mt-1">25 Days remaining until Finals</Typography>
          </Card>

          {/* Quick Metrics */}
          <Card className="p-8 rounded-[3rem] shadow-sm border border-slate-50 md:col-span-2 flex flex-col justify-center">
            <div className="grid grid-cols-2 gap-8">
               <div className="flex gap-4">
                  <div className="p-3 bg-orange-50 rounded-2xl"><FireIcon className="h-6 w-6 text-orange-500" /></div>
                  <div>
                    <Typography className="text-[10px] font-black text-slate-400 uppercase">Daily Streak</Typography>
                    <Typography variant="h5" className="text-slate-900 font-black">12 Days</Typography>
                  </div>
               </div>
               <div className="flex gap-4">
                  <div className="p-3 bg-blue-50 rounded-2xl"><CheckBadgeIcon className="h-6 w-6 text-blue-500" /></div>
                  <div>
                    <Typography className="text-[10px] font-black text-slate-400 uppercase">Classes Met</Typography>
                    <Typography variant="h5" className="text-slate-900 font-black">{totalPresent} / {totalClasses}</Typography>
                  </div>
               </div>
               <div className="flex gap-4">
                  <div className="p-3 bg-emerald-50 rounded-2xl"><CalendarIcon className="h-6 w-6 text-emerald-500" /></div>
                  <div>
                    <Typography className="text-[10px] font-black text-slate-400 uppercase">Internals</Typography>
                    <Typography variant="h5" className="text-slate-900 font-black">Starts Apr 12</Typography>
                  </div>
               </div>
               <div className="flex gap-4">
                  <div className="p-3 bg-indigo-50 rounded-2xl"><ClockIcon className="h-6 w-6 text-indigo-500" /></div>
                  <div>
                    <Typography className="text-[10px] font-black text-slate-400 uppercase">Avg Presence</Typography>
                    <Typography variant="h5" className="text-slate-900 font-black">6.2 Hrs/Day</Typography>
                  </div>
               </div>
            </div>
          </Card>
        </div>

        {/* --- MAIN ANALYTICS CHART --- */}
        <Card className="p-10 rounded-[3.5rem] shadow-sm border border-slate-50 bg-white">
          <div className="flex justify-between items-center mb-12">
            <div>
              <Typography variant="h5" className="text-slate-900 font-bold flex items-center gap-2">
                <ArrowTrendingUpIcon className="h-6 w-6 text-indigo-600" />
                Subject-wise Breakdown
              </Typography>
              <Typography className="text-slate-400 text-sm mt-1">Real-time attendance percentage per module</Typography>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase"><span className="w-3 h-3 bg-indigo-500 rounded-full"></span> Healthy</div>
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase"><span className="w-3 h-3 bg-orange-500 rounded-full"></span> Critical</div>
            </div>
          </div>

          <div className="relative flex items-end justify-between gap-6 h-80 border-b border-slate-50 pb-8">
            {attendanceData.map((s) => {
              const per = Math.round((s.present / s.total) * 100);
              const isLow = per < 75;
              return (
                <div key={s.name} className="flex flex-col items-center flex-1 group">
                  <div className="absolute -top-4 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-slate-900 text-white px-3 py-1 rounded-lg text-[10px] font-bold">
                    {s.present} Classes
                  </div>
                  
                  <div 
                    className={`w-full max-w-[60px] rounded-3xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 cursor-pointer shadow-sm
                      ${isLow ? 'bg-orange-500 shadow-orange-100' : 'bg-indigo-600 shadow-indigo-100'}
                    `}
                    style={{ height: `${per * 2.5}px` }}
                  >
                    <div className="h-full w-full bg-white/10 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Typography className="text-xs font-black text-white">{per}%</Typography>
                    </div>
                  </div>

                  <Typography className="text-xs mt-6 font-black uppercase text-slate-500 tracking-tighter text-center">
                    {s.name}
                  </Typography>
                </div>
              );
            })}
          </div>

          {/* Alert Box */}
          {attendanceData.some(s => (s.present / s.total) < 0.75) && (
            <div className="mt-12 p-6 bg-orange-50/50 rounded-[2rem] border border-orange-100 flex items-center gap-6">
              <div className="h-12 w-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
                <FireIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <Typography className="text-orange-800 font-bold">Shortage Warning</Typography>
                <Typography className="text-orange-600 text-sm">Modules like <b>EEA</b> and <b>TOC</b> are currently below the 75% threshold. Prioritize these sessions this week.</Typography>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}