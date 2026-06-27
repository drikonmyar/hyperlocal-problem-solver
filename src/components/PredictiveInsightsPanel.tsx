import React, { useState, useEffect } from "react";
import { Issue, PredictiveInsight } from "../types";
import { 
  Sparkles, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  ShieldAlert, 
  MapPin, 
  Zap, 
  Activity,
  Droplet,
  Lightbulb,
  Trash2,
  Building,
  HelpCircle,
  Clock
} from "lucide-react";

interface PredictiveInsightsPanelProps {
  currentIssues: Issue[];
}

export default function PredictiveInsightsPanel({ currentIssues }: PredictiveInsightsPanelProps) {
  const [insights, setInsights] = useState<PredictiveInsight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchAiInsights = async (silent: boolean = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await fetch("/api/predictive-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentIssues })
      });
      if (res.ok) {
        const data = await res.json();
        setInsights(data);
      }
    } catch (e) {
      console.error("Failed to fetch predictive insights:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAiInsights(true);
  }, [currentIssues]);

  const getRiskColor = (score: number) => {
    if (score >= 80) return "text-red-600 bg-red-50 border-red-100";
    if (score >= 60) return "text-amber-600 bg-amber-50 border-amber-100";
    return "text-blue-600 bg-blue-50 border-blue-100";
  };

  const getRiskBarColor = (score: number) => {
    if (score >= 80) return "bg-red-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-blue-500";
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Pothole": return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "Water Leakage": return <Droplet className="w-4 h-4 text-blue-500" />;
      case "Damaged Streetlight": return <Lightbulb className="w-4 h-4 text-yellow-500" />;
      case "Waste Management": return <Trash2 className="w-4 h-4 text-emerald-500" />;
      case "Public Infrastructure": return <Building className="w-4 h-4 text-purple-500" />;
      default: return <HelpCircle className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div id="ai-predictive-intelligence-panel" className="flex flex-col gap-4 bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
      {/* PANEL HEADER WITH ACTIONS */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-600">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
              Civic AI Predictive Intelligence
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Gemini analyzes spatial patterns, weather indicators, and reports to forecast upcoming community issues.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchAiInsights(false)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg border border-indigo-100 transition-colors pointer-events-auto"
          disabled={isLoading}
          id="btn-refresh-ai-insights"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Analyzing..." : "Refresh Forecast"}
        </button>
      </div>

      {/* SKELETON LOADER DURING ANALYSIS */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="border border-slate-100 rounded-xl p-4 flex flex-col gap-3 bg-slate-50/50 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="h-5 w-24 bg-slate-200 rounded"></div>
                <div className="h-6 w-12 bg-slate-200 rounded-full"></div>
              </div>
              <div className="h-4 w-full bg-slate-200 rounded"></div>
              <div className="h-4 w-5/6 bg-slate-200 rounded"></div>
              <div className="h-[1px] bg-slate-200 my-1"></div>
              <div className="h-3 w-1/2 bg-slate-200 rounded"></div>
              <div className="h-7 w-full bg-slate-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((insight) => (
            <div 
              key={insight.id} 
              className="border border-slate-100 hover:border-slate-200 rounded-xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all duration-300 bg-white"
            >
              {/* TOP ROW: CATEGORY AND RISK PILL */}
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 px-2 py-0.5 rounded bg-slate-50 border border-slate-100">
                  {getCategoryIcon(insight.category)}
                  {insight.category}
                </span>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase border ${getRiskColor(insight.riskScore)}`}>
                  Risk: {insight.riskScore}%
                </span>
              </div>

              {/* TITLE & DESCRIPTION */}
              <div>
                <h3 className="text-xs font-bold text-slate-800 leading-tight tracking-tight flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  {insight.title}
                </h3>
                <p className="text-[11px] text-slate-600 mt-1.5 font-light leading-relaxed break-words">{insight.description}</p>
              </div>

              {/* RISK BAR PROGRESS */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase font-mono">
                  <span>Risk Thermometer</span>
                  <span>{insight.riskScore}/100</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${getRiskBarColor(insight.riskScore)}`}
                    style={{ width: `${insight.riskScore}%` }}
                  />
                </div>
              </div>

              {/* DETAILS METRICS */}
              <div className="h-[1px] bg-slate-50 my-1" />

              <div className="flex flex-col gap-1.5 text-[10px] text-slate-500">
                <div className="flex gap-1.5 items-start">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span><b>Predicted Hotspot:</b> <span className="text-slate-700 font-medium">{insight.predictedLocation}</span></span>
                </div>
                <div className="flex gap-1.5 items-start">
                  <Zap className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span><b>Trigger Force:</b> <span className="text-slate-700 font-medium">{insight.triggerFactor}</span></span>
                </div>
                <div className="flex gap-1.5 items-start bg-slate-50 p-2 rounded border border-slate-100 mt-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                  <span><b>Impact:</b> <span className="text-slate-600 font-light leading-relaxed">{insight.potentialImpact}</span></span>
                </div>
              </div>

              {/* RECOMMENDED CITIZEN MUNICIPAL PROTOCOL CTA */}
              <div className="mt-auto pt-2">
                <div className="bg-indigo-50/50 border border-indigo-100/50 p-2.5 rounded-lg text-[10.5px]">
                  <span className="font-bold text-indigo-900 block flex items-center gap-1 mb-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    Recommended Protocol:
                  </span>
                  <span className="text-indigo-800 font-light leading-relaxed">{insight.recommendedAction}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FOOTER INTELLIGENCE BANNER */}
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mt-2">
        <div className="flex gap-2 items-start text-xs text-slate-600">
          <Activity className="w-4.5 h-4.5 text-indigo-600 shrink-0 mt-0.5 animate-pulse" />
          <div>
            <span className="font-bold text-slate-700">Predictive Intelligence Active</span>
            <p className="text-slate-500 font-light mt-0.5">Our server evaluates temporal clusters, public utility age, and upvote velocities to schedule public works maintenance orders.</p>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 border-t sm:border-t-0 pt-2 sm:pt-0 shrink-0">
          <Clock className="w-3.5 h-3.5" />
          <span>Last automated sync: Just Now</span>
        </div>
      </div>
    </div>
  );
}
