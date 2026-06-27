import React from "react";
import { Issue, IssueCategory } from "../types";
import { 
  BarChart3, 
  Activity, 
  CheckCircle, 
  Flame, 
  Users, 
  TrendingUp, 
  Map, 
  Info,
  Droplet,
  Lightbulb,
  Trash2,
  Building,
  AlertTriangle,
  HelpCircle
} from "lucide-react";

interface DashboardStatsProps {
  issues: Issue[];
}

export default function DashboardStats({ issues }: DashboardStatsProps) {
  const totalIssues = issues.length;
  const resolvedIssues = issues.filter(i => i.status === "Resolved").length;
  const resolvedRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0;
  
  const verifiedIssues = issues.filter(i => i.status === "Verified" || i.status === "In Progress" || i.status === "Resolved").length;
  const verificationRate = totalIssues > 0 ? Math.round((verifiedIssues / totalIssues) * 100) : 0;

  const activeReports = issues.filter(i => i.status !== "Resolved").length;

  // Group by category
  const categories: Record<IssueCategory, number> = {
    "Pothole": 0,
    "Water Leakage": 0,
    "Damaged Streetlight": 0,
    "Waste Management": 0,
    "Public Infrastructure": 0,
    "Other": 0
  };

  issues.forEach(i => {
    if (categories[i.category] !== undefined) {
      categories[i.category]++;
    } else {
      categories["Other"]++;
    }
  });

  const categoryColors: Record<IssueCategory, { bg: string, border: string, text: string, color: string }> = {
    "Pothole": { bg: "bg-amber-100", border: "border-amber-200", text: "text-amber-800", color: "#f59e0b" },
    "Water Leakage": { bg: "bg-blue-100", border: "border-blue-200", text: "text-blue-800", color: "#3b82f6" },
    "Damaged Streetlight": { bg: "bg-yellow-100", border: "border-yellow-200", text: "text-yellow-800", color: "#eab308" },
    "Waste Management": { bg: "bg-emerald-100", border: "border-emerald-200", text: "text-emerald-800", color: "#10b981" },
    "Public Infrastructure": { bg: "bg-purple-100", border: "border-purple-200", text: "text-purple-800", color: "#a855f7" },
    "Other": { bg: "bg-slate-100", border: "border-slate-200", text: "text-slate-800", color: "#64748b" }
  };

  // Identify Hotspots (group by street/neighborhood)
  const streetCount: Record<string, number> = {};
  issues.forEach(issue => {
    const address = issue.location.address;
    const street = address.split(",")[1]?.trim() || address.split("(")[0]?.trim() || address;
    streetCount[street] = (streetCount[street] || 0) + 1;
  });

  const sortedHotspots = Object.entries(streetCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // SVG Donut calculation
  const donutData = Object.entries(categories).map(([name, value]) => ({
    name: name as IssueCategory,
    value,
    color: categoryColors[name as IssueCategory].color
  })).filter(item => item.value > 0);

  const totalDonutValue = donutData.reduce((acc, curr) => acc + curr.value, 0);

  // Accumulate stroke dash arrays
  let accumulatedPercent = 0;

  return (
    <div id="dashboard-statistics" className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* COLUMN 1 & 2: STATS SUMMARY & CHARTS */}
      <div className="md:col-span-2 flex flex-col gap-4">
        {/* ROW 1: CORE STATS CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Total Reports</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-extrabold text-slate-800">{totalIssues}</span>
              <span className="text-[10px] text-slate-400 font-medium">Logged</span>
            </div>
            <p className="text-[10px] text-indigo-600 mt-1 font-medium flex items-center gap-0.5">
              <Activity className="w-3 h-3" /> Live Municipal Feed
            </p>
          </div>

          <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Resolution Rate</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-extrabold text-emerald-600">{resolvedRate}%</span>
              <span className="text-[10px] text-slate-400 font-medium">{resolvedIssues} Closed</span>
            </div>
            <p className="text-[10px] text-emerald-600 mt-1 font-medium flex items-center gap-0.5">
              <CheckCircle className="w-3 h-3" /> Quick Turnaround
            </p>
          </div>

          <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Verification Rate</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-extrabold text-amber-600">{verificationRate}%</span>
              <span className="text-[10px] text-slate-400 font-medium">{verifiedIssues} Vetted</span>
            </div>
            <p className="text-[10px] text-amber-600 mt-1 font-medium flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> High Quality Data
            </p>
          </div>

          <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Active Incidents</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-extrabold text-slate-800">{activeReports}</span>
              <span className="text-[10px] text-slate-400 font-medium">In Queue</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">Pending Fixes</p>
          </div>
        </div>

        {/* ROW 2: CATEGORY DONUT CHART & PROGRESS BARS */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row gap-6 items-center">
          {/* Donut Draw */}
          <div className="relative w-40 h-40 shrink-0">
            {totalDonutValue > 0 ? (
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                {donutData.map((slice, idx) => {
                  const percent = (slice.value / totalDonutValue) * 100;
                  const dashArray = `${percent} ${100 - percent}`;
                  const dashOffset = 100 - accumulatedPercent;
                  accumulatedPercent += percent;

                  return (
                    <circle
                      key={idx}
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="none"
                      stroke={slice.color}
                      strokeWidth="3.5"
                      strokeDasharray={dashArray}
                      strokeDashoffset={dashOffset}
                      className="transition-all duration-500 hover:stroke-[4]"
                    />
                  );
                })}
              </svg>
            ) : (
              <div className="w-full h-full rounded-full border-4 border-slate-100 flex items-center justify-center text-xs text-slate-400 font-mono">
                No Data
              </div>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Reports</span>
              <span className="text-xl font-black text-slate-700 leading-none mt-0.5">{totalIssues}</span>
            </div>
          </div>

          {/* Legend and Bar metrics */}
          <div className="flex-grow w-full flex flex-col gap-2.5">
            <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
              <BarChart3 className="w-4 h-4 text-indigo-500" /> Category Distribution Breakdown
            </h3>
            
            <div className="flex flex-col gap-2">
              {Object.entries(categories).map(([name, count]) => {
                const percent = totalIssues > 0 ? Math.round((count / totalIssues) * 100) : 0;
                const colors = categoryColors[name as IssueCategory];

                return (
                  <div key={name} className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[10px] font-semibold text-slate-600">
                      <span className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full`} style={{ backgroundColor: colors.color }}></span>
                        {name}
                      </span>
                      <span>{count} ({percent}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${percent}%`,
                          backgroundColor: colors.color
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* COLUMN 3: DISTRICT HOTSPOTS & WORKFLOW PIPELINE */}
      <div className="flex flex-col gap-4">
        {/* DISTRICT HOTSPOTS PANEL */}
        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex flex-col gap-3 flex-grow">
          <div>
            <h3 className="text-xs font-bold text-slate-800 tracking-tight uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
              Neighborhood Hotspots
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Sectors with repeating, unresolved municipal challenges.</p>
          </div>

          <div className="flex flex-col gap-2">
            {sortedHotspots.length > 0 ? (
              sortedHotspots.map((hotspot, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-red-50 bg-red-50/20">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-red-100 border border-red-200 text-red-700 text-xs font-black flex items-center justify-center">
                      #{i + 1}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-semibold text-slate-800 truncate max-w-[130px]">{hotspot.name}</span>
                      <span className="text-[9px] text-red-500 font-semibold uppercase">Cluster Zone</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-slate-800">{hotspot.count}</span>
                    <span className="text-[10px] text-slate-400 block leading-none">Reports</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-xs text-slate-400 py-6">
                No hotspots identified yet.
              </div>
            )}
          </div>

          <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 text-[10px] text-slate-500 flex items-start gap-1.5 leading-relaxed mt-auto">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>AI alerts are continuously updated based on geographic report density. City public works are advised.</span>
          </div>
        </div>

        {/* INCIDENT TIMELINE STEPPER HUD */}
        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex flex-col gap-2 shrink-0">
          <h3 className="text-xs font-bold text-slate-800 tracking-tight uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-500" />
            Civic Pipeline Status
          </h3>

          <div className="flex flex-col gap-1 font-medium text-[11px] text-slate-600 mt-1">
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Reported Incidents</span>
              <span className="font-bold text-slate-800">{issues.filter(i => i.status === "Reported").length}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Verified Incidents</span>
              <span className="font-bold text-slate-800">{issues.filter(i => i.status === "Verified").length}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> Repairs in Progress</span>
              <span className="font-bold text-slate-800">{issues.filter(i => i.status === "In Progress").length}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Resolved Incidents</span>
              <span className="font-bold text-emerald-600">{issues.filter(i => i.status === "Resolved").length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
