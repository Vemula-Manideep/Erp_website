import React from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  Progress,
} from "@material-tailwind/react";
import { 
  AcademicCapIcon, 
  BriefcaseIcon, 
  UserGroupIcon, 
  BuildingLibraryIcon,
  ArrowUpIcon,
  GlobeAltIcon
} from "@heroicons/react/24/outline";
import { StatisticsCard } from "@/widgets/cards";
import { StatisticsChart } from "@/widgets/charts";
import { useEffect, useState } from "react";
import { getDashboardStats } from "../../../API/erpApi";

// Data for CBIT Placement Trends
const cbitPlacementsTrend = {
  type: "line",
  height: 220,
  series: [{ name: "Offers", data: [1246, 1736, 1375, 1039, 1123, 756] }],
  options: {
    colors: ["#388e3c"],
    xaxis: { categories: ["2021", "2022", "2023", "2024", "2025", "2026*"] },
  },
};

const salaryTrend = {
  type: "bar",
  height: 220,
  series: [{ name: "Highest (LPA)", data: [43, 69, 37, 59, 51, 54] }],
  options: {
    colors: ["#0288d1"],
    xaxis: { categories: ["'21", "'22", "'23", "'24", "'25", "'26"] },
  },
};

export function Home() {
  const [stats, setStats] = useState({ totalStudents: 0, totalProfessors: 0, activeClassesToday: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="mt-12">
      {/* 1. Statistics Cards - No Notification Icons here */}
      <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
        <StatisticsCard 
          title="Total Students" 
          value={stats.totalStudents} 
          color="blue" 
          icon={<UserGroupIcon className="w-6 h-6 text-white"/>} 
          footer={<Typography className="font-normal text-blue-gray-600">Registered across campus</Typography>} 
        />
        <StatisticsCard 
          title="Total Professors" 
          value={stats.totalProfessors} 
          color="pink" 
          icon={<AcademicCapIcon className="w-6 h-6 text-white"/>} 
          footer={<Typography className="font-normal text-blue-gray-600">Faculty members</Typography>} 
        />
        <StatisticsCard 
          title="Active Classes" 
          value={stats.activeClassesToday} 
          color="green" 
          icon={<BriefcaseIcon className="w-6 h-6 text-white"/>} 
          footer={<Typography className="font-normal text-blue-gray-600">Scheduled today</Typography>} 
        />
        <StatisticsCard 
          title="Campus" 
          value="50.8 Ac" 
          color="orange" 
          icon={<BuildingLibraryIcon className="w-6 h-6 text-white"/>} 
          footer={<Typography className="font-normal text-blue-gray-600">Gandipet, Hyderabad</Typography>} 
        />
      </div>

      {/* 2. Placement Charts */}
      <div className="mb-6 grid grid-cols-1 gap-y-12 gap-x-6 md:grid-cols-2">
        <StatisticsChart
          color="white"
          title="Yearly Placement Volume"
          description="Total number of students placed"
          chart={cbitPlacementsTrend}
          footer={<Typography variant="small" className="flex items-center font-normal text-blue-gray-600"><ArrowUpIcon className="h-4 w-4 text-green-500"/>&nbsp;Steady industry demand</Typography>}
        />
        <StatisticsChart
          color="white"
          title="Highest CTC Trend"
          description="Growth of peak salary offers (LPA)"
          chart={salaryTrend}
          footer={<Typography variant="small" className="flex items-center font-normal text-blue-gray-600">Consistent premium recruiters</Typography>}
        />
      </div>

      {/* 3. Departmental Table - Simplified without Menu Buttons */}
      <Card className="border border-blue-gray-100 shadow-sm">
        <CardHeader floated={false} shadow={false} className="p-6">
          <Typography variant="h6" color="blue-gray">Department Performance (2026 Batch)</Typography>
        </CardHeader>
        <CardBody className="px-0 pt-0 pb-2 overflow-x-scroll">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr className="border-b border-blue-gray-50 text-left">
                {["Branch", "Placement Rate", "Avg Salary", "Status"].map(h => (
                  <th key={h} className="py-3 px-6 text-[11px] font-medium uppercase text-blue-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { name: "CSE", avg: "10.2", p: 75, status: "High Demand" },
                { name: "IT", avg: "9.8", p: 88, status: "Active" },
                { name: "ECE", avg: "8.5", p: 45, status: "Ongoing" },
                { name: "AI & DS", avg: "11.5", p: 82, status: "Premium" }
              ].map((row) => (
                <tr key={row.name} className="border-b border-blue-gray-50 last:border-none">
                  <td className="py-3 px-6 font-bold text-blue-gray-900">{row.name}</td>
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-2">
                      <Typography className="text-xs font-medium">{row.p}%</Typography>
                      <Progress value={row.p} color={row.p > 70 ? "green" : "blue"} className="h-1" />
                    </div>
                  </td>
                  <td className="py-3 px-6 text-xs text-blue-gray-600 font-semibold">₹{row.avg} LPA</td>
                  <td className="py-3 px-6">
                    <Typography variant="small" className="text-[10px] font-bold uppercase text-blue-gray-400 bg-blue-gray-50/50 px-2 py-1 rounded w-fit">
                      {row.status}
                    </Typography>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}

export default Home;