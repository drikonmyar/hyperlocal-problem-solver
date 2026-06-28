import React from "react";
import { Issue, IssueCategory, IssueStatus } from "../types";
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
  selectedIssueId?: string | null;
  onSelectIssue?: (issue: Issue) => void;
  rightSlot?: React.ReactNode;
}

interface NeighborhoodHotspotsProps {
  issues: Issue[];
  selectedIssueId?: string | null;
  onSelectIssue?: (issue: Issue) => void;
}

function getSortedHotspots(issues: Issue[]) {
  const locationGroups: Record<string, { address: string; issues: Issue[] }> = {};
  issues.forEach(issue => {
    const address = issue.location.address;
    if (!locationGroups[address]) {
      locationGroups[address] = { address, issues: [] };
    }
    locationGroups[address].issues.push(issue);
  });

  return Object.values(locationGroups)
    .map((group) => ({
      address: group.address,
      count: group.issues.length,
      representativeIssue: group.issues[0],
      issueIds: group.issues.map((issue) => issue.id)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
}

export function NeighborhoodHotspots({
  issues,
  selectedIssueId,
  onSelectIssue,
}: NeighborhoodHotspotsProps) {
  const sortedHotspots = getSortedHotspots(issues);

  return (
    <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex flex-col gap-3">
      <div>
        <h3 className="text-xs font-bold text-slate-800 tracking-tight uppercase tracking-wider font-mono flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
          Neighborhood Hotspots
        </h3>
        <p className="text-[11px] text-slate-500 mt-0.5">Sectors with repeating, unresolved municipal challenges.</p>
      </div>

      <div className="flex flex-col gap-2">
        {sortedHotspots.length > 0 ? (
          sortedHotspots.map((hotspot, i) => {
            const isSelected = hotspot.issueIds.includes(selectedIssueId || "");

            return (
              <button
                key={hotspot.address}
                type="button"
                onClick={() => onSelectIssue?.(hotspot.representativeIssue)}
                className={`w-full flex items-start justify-between gap-2 p-2.5 rounded-lg border text-left transition-all ${
                  isSelected
                    ? "border-indigo-200 bg-indigo-50/60 ring-2 ring-indigo-50"
                    : "border-red-50 bg-red-50/20 hover:border-indigo-100 hover:bg-indigo-50/30"
                } ${onSelectIssue ? "cursor-pointer" : "cursor-default"}`}
              >
                <div className="flex items-start gap-2 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-red-100 border border-red-200 text-red-700 text-xs font-black flex items-center justify-center shrink-0">
                    #{i + 1}
                  </span>
                  <div className="flex min-w-0 flex-col">
                    <span className="text-[11px] font-semibold text-slate-800 leading-snug break-words">{hotspot.address}</span>
                    <span className="text-[9px] text-red-500 font-semibold uppercase">Cluster Zone</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-extrabold text-slate-800">{hotspot.count}</span>
                  <span className="text-[10px] text-slate-400 block leading-none">Reports</span>
                </div>
              </button>
            );
          })
        ) : (
          <div className="text-center text-xs text-slate-400 py-6">
            No hotspots identified yet.
          </div>
        )}
      </div>

      <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 text-[10px] text-slate-500 flex items-start gap-1.5 leading-relaxed">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <span>AI alerts are continuously updated based on geographic report density. City public works are advised.</span>
      </div>
    </div>
  );
}

export default function DashboardStats({ issues, selectedIssueId, onSelectIssue, rightSlot }: DashboardStatsProps) {
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

  // SVG Donut calculation
  const donutData = Object.entries(categories).map(([name, value]) => ({
    name: name as IssueCategory,
    value,
    color: categoryColors[name as IssueCategory].color
  })).filter(item => item.value > 0);

  const totalDonutValue = donutData.reduce((acc, curr) => acc + curr.value, 0);

  const statusColors: Record<IssueStatus, string> = {
    "Reported": "#ef4444",
    "Verified": "#f59e0b",
    "Rejected": "#6b7280",
    "Unsure": "#f97316",
    "In Progress": "#3b82f6",
    "Resolved": "#10b981"
  };

  const pipelineStatuses: IssueStatus[] = [
    "Reported",
    "Verified",
    "Rejected",
    "Unsure",
    "In Progress",
    "Resolved"
  ];

  const pipelineData = pipelineStatuses.map((status) => ({
    name: status,
    value: issues.filter((issue) => issue.status === status).length,
    color: statusColors[status]
  }));

  const visiblePipelineData = pipelineData.filter((item) => item.value > 0);
  const totalPipelineValue = visiblePipelineData.reduce((acc, curr) => acc + curr.value, 0);

  // Accumulate stroke dash arrays
  let accumulatedPercent = 0;
  let pipelineAccumulatedPercent = 0;

  return (
    <div id="dashboard-statistics" className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
      {/* STATS SUMMARY & CHARTS */}
      <div className="lg:col-span-2 flex flex-col gap-4">
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

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* CATEGORY DONUT CHART & PROGRESS BARS */}
          <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-28 h-28 shrink-0">
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
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Reports</span>
                  <span className="text-lg font-black text-slate-700 leading-none mt-0.5">{totalIssues}</span>
                </div>
              </div>

              <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-indigo-500" /> Category Distribution Breakdown
              </h3>
            </div>

            <div className="flex flex-col gap-1.5">
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

          {/* CIVIC PIPELINE STATUS DONUT */}
          <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-28 h-28 shrink-0">
                {totalPipelineValue > 0 ? (
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                    {visiblePipelineData.map((slice, idx) => {
                      const percent = (slice.value / totalPipelineValue) * 100;
                      const dashArray = `${percent} ${100 - percent}`;
                      const dashOffset = 100 - pipelineAccumulatedPercent;
                      pipelineAccumulatedPercent += percent;

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
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Pipeline</span>
                  <span className="text-lg font-black text-slate-700 leading-none mt-0.5">{totalIssues}</span>
                </div>
              </div>

              <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-500" /> Civic Pipeline Status
              </h3>
            </div>

            <div className="flex flex-col gap-1.5">
              {pipelineData.map((status) => {
                const percent = totalIssues > 0 ? Math.round((status.value / totalIssues) * 100) : 0;

                return (
                  <div key={status.name} className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[10px] font-semibold text-slate-600">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: status.color }}></span>
                        {status.name === "In Progress" ? "Repairs in Progress" : `${status.name} Incidents`}
                      </span>
                      <span>{status.value} ({percent}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: status.color
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

      <div className="flex flex-col gap-4">
        <NeighborhoodHotspots
          issues={issues}
          selectedIssueId={selectedIssueId}
          onSelectIssue={onSelectIssue}
        />
        {rightSlot}
      </div>
    </div>
  );
}
