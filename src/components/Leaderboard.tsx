import React from "react";
import { Citizen, Badge } from "../types";
import { ALL_BADGES } from "../data/mockIssues";
import { 
  Award, 
  Trophy, 
  ShieldCheck, 
  Camera, 
  HelpCircle,
  AlertTriangle,
  Eye,
  CheckCircle,
  Star,
  Zap,
  Sparkles,
  ChevronRight
} from "lucide-react";

interface LeaderboardProps {
  citizens: Citizen[];
  currentUser: Citizen;
}

export default function Leaderboard({ citizens, currentUser }: LeaderboardProps) {
  // Sort citizens by XP descending
  const sortedCitizens = [...citizens].sort((a, b) => b.xp - a.xp);

  // Helper to get Level from XP (e.g. every 500 XP is a level)
  const getLevel = (xp: number) => {
    return Math.floor(xp / 500) + 1;
  };

  const getXpProgress = (xp: number) => {
    const level = getLevel(xp);
    const prevLevelXp = (level - 1) * 500;
    const nextLevelXp = level * 500;
    const levelProgress = xp - prevLevelXp;
    const levelRange = nextLevelXp - prevLevelXp;
    return {
      percent: Math.round((levelProgress / levelRange) * 100),
      current: levelProgress,
      needed: levelRange
    };
  };

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 0: return <span className="text-xl" title="First Place Gold Medal">🥇</span>;
      case 1: return <span className="text-xl" title="Second Place Silver Medal">🥈</span>;
      case 2: return <span className="text-xl" title="Third Place Bronze Medal">🥉</span>;
      default: return <span className="text-xs font-bold text-slate-400 font-mono">#{rank + 1}</span>;
    }
  };

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case "AlertTriangle": return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "Eye": return <Eye className="w-4 h-4 text-blue-500" />;
      case "Award": return <Award className="w-4 h-4 text-purple-500" />;
      case "CheckCircle": return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      default: return <Star className="w-4 h-4 text-slate-500" />;
    }
  };

  const progress = getXpProgress(currentUser.xp);

  return (
    <div id="gamified-citizen-leaderboard" className="grid grid-cols-1 md:grid-cols-3 gap-4">
      
      {/* COLUMN 1 & 2: LEADERBOARD LIST & ACHIEVEMENTS */}
      <div className="md:col-span-2 flex flex-col gap-4">
        {/* LEADERBOARD LIST */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm flex flex-col gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Trophy className="w-5 h-5 text-indigo-600" />
              Neighborhood Hero Leaderboard
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Top performing citizens logging and auditing municipal issues in the district.</p>
          </div>

          <div className="flex flex-col gap-2.5">
            {sortedCitizens.map((citizen, index) => {
              const isCurrentUser = citizen.id === currentUser.id;
              
              return (
                <div 
                  key={citizen.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isCurrentUser 
                      ? "border-indigo-200 bg-indigo-50/30 ring-2 ring-indigo-50" 
                      : "border-slate-100 bg-white hover:bg-slate-50/50"
                  }`}
                  id={`leaderboard-row-${citizen.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center shrink-0">
                      {getMedalIcon(index)}
                    </div>

                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        {citizen.name}
                        {isCurrentUser && (
                          <span className="px-1.5 py-0.2 bg-indigo-600 text-white rounded text-[9px] font-black uppercase font-mono tracking-wider">You</span>
                        )}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5 font-medium">
                        <span className="flex items-center gap-0.5 text-slate-600 font-bold"><Camera className="w-3.5 h-3.5 text-slate-400" /> {citizen.reportedCount} reported</span>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-0.5 text-slate-600 font-bold"><ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> {citizen.verifiedCount} verified</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Badges preview */}
                    <div className="hidden sm:flex gap-1">
                      {citizen.badges.map((b) => (
                        <div 
                          key={b.id} 
                          className="p-1 rounded bg-slate-50 border border-slate-100" 
                          title={`${b.name}: ${b.description}`}
                        >
                          {getBadgeIcon(b.icon)}
                        </div>
                      ))}
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-indigo-700 block">{citizen.xp} XP</span>
                      <span className="text-[10px] text-slate-400 font-semibold font-mono">Level {getLevel(citizen.xp)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AVAILABLE BADGES LIST */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-800 tracking-tight uppercase tracking-wider font-mono flex items-center gap-1.5 mb-3.5">
            <Award className="w-4 h-4 text-indigo-500 animate-bounce" />
            Achievements Showcase
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ALL_BADGES.map((badge) => {
              const hasBadge = currentUser.badges.some(b => b.id === badge.id);

              return (
                <div 
                  key={badge.id}
                  className={`p-3 rounded-xl border flex gap-3 items-start transition-all ${
                    hasBadge 
                      ? "border-emerald-200 bg-emerald-50/10 shadow-sm" 
                      : "border-slate-100 bg-slate-50/50 opacity-60"
                  }`}
                  id={`badge-showcase-${badge.id}`}
                >
                  <div className={`p-2 rounded-lg border shrink-0 mt-0.5 ${
                    hasBadge 
                      ? "bg-emerald-50 border-emerald-100 text-emerald-600" 
                      : "bg-slate-100 border-slate-200 text-slate-400"
                  }`}>
                    {getBadgeIcon(badge.icon)}
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      {badge.name}
                      {hasBadge && (
                        <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded text-[9px] font-bold font-mono">Unlocked</span>
                      )}
                    </span>
                    <p className="text-[11px] text-slate-500 font-light mt-1 leading-relaxed break-words">{badge.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* COLUMN 3: CURRENT USER LEVEL STATUS HUD */}
      <div className="flex flex-col gap-4">
        {/* CURRENT CITIZEN CARD */}
        {currentUser.id !== 'guest' ? (
          <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm flex flex-col gap-4">
            <div>
              <h3 className="text-xs font-bold text-slate-800 tracking-tight uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                Your Citizen Status
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Your civic impact and progress metrics.</p>
            </div>

            <div className="flex items-center gap-4 bg-indigo-50/30 p-3 rounded-xl border border-indigo-100/50">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-extrabold flex items-center justify-center text-lg shadow-md shrink-0 font-mono">
                Lvl {getLevel(currentUser.xp)}
              </div>

              <div className="flex-grow">
                <span className="text-xs font-extrabold text-slate-800">{currentUser.name}</span>
                <p className="text-[10px] text-indigo-600 font-semibold font-mono mt-0.5">{currentUser.xp} Total XP Points</p>
              </div>
            </div>

            {/* LEVEL PROGRESS METER */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase font-mono">
                <span>Next Level Progress</span>
                <span>{progress.percent}%</span>
              </div>
              
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                <div 
                  className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>{currentUser.xp} XP</span>
                <span>{(getLevel(currentUser.xp)) * 500} XP (Need {500 - progress.current} more)</span>
              </div>
            </div>

            <div className="h-[1px] bg-slate-100" />

            {/* GAMIFICATION STATS COUNTERS */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Reports Filed</span>
                <span className="text-lg font-black text-slate-700 block mt-0.5">{currentUser.reportedCount}</span>
                <span className="text-[9px] text-indigo-600 font-semibold uppercase mt-0.5 block font-mono">+100 XP Each</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Verified Audits</span>
                <span className="text-lg font-black text-slate-700 block mt-0.5">{currentUser.verifiedCount}</span>
                <span className="text-[9px] text-amber-600 font-semibold uppercase mt-0.5 block font-mono">+50 XP Each</span>
              </div>
            </div>

            {/* TIP HUD */}
            <div className="bg-indigo-50/50 rounded-lg p-3 text-[10.5px] text-indigo-700 flex gap-2 items-start leading-relaxed font-light mt-1">
              <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <p className="font-semibold text-indigo-900">How to earn XP?</p>
                <ul className="list-disc pl-3 mt-1 flex flex-col gap-1">
                  <li>Submit a new verified issue: <b>+100 XP</b></li>
                  <li>Conduct a Verification/Dispute Audit: <b>+50 XP</b></li>
                  <li>Earn upvotes from other citizens: <b>+10 XP</b> each</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm flex flex-col gap-4 text-center items-center">
            <Trophy className="w-12 h-12 text-slate-300" />
            <h3 className="font-bold text-slate-700">Join the Leaderboard</h3>
            <p className="text-xs text-slate-500">Sign in to earn XP points for reporting and verifying issues in your community.</p>
          </div>
        )}
      </div>
    </div>
  );
}
