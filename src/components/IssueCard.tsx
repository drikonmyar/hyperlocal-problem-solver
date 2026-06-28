import React, { useState } from "react";
import { Issue, Comment, IssueVerification, IssueCategory } from "../types";
import {
  ThumbsUp,
  CheckCircle,
  Clock,
  MessageSquare,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  User,
  ArrowRight,
  Sparkles,
  Bookmark,
  Calendar,
  XOctagon,
  CornerDownRight,
  Send,
  Droplet,
  Lightbulb,
  Trash2,
  Building,
  HelpCircle,
  Route,
} from "lucide-react";

interface IssueCardProps {
  issue: Issue;
  currentUser: { id: string; name: string; role?: string };
  onUpvote: (issueId: string) => void;
  onVerify: (issueId: string, approved: boolean, auditComment: string) => void;
  onAddComment: (issueId: string, commentText: string) => void;
  onResolveIssue?: (issueId: string, resolutionNotes: string) => void; // Admin or solver mock role
  onInProgressIssue?: (issueId: string, workId: string, eta: string) => void;
  onRequireLogin?: () => void;
  onShowRoute?: (issueId: string) => void;
}

export default function IssueCard({
  issue,
  currentUser,
  onUpvote,
  onVerify,
  onAddComment,
  onResolveIssue,
  onInProgressIssue,
  onRequireLogin,
  onShowRoute,
}: IssueCardProps) {
  const [commentText, setCommentText] = useState("");
  const [verificationComment, setVerificationComment] = useState("");
  const [showVerifyPanel, setShowVerifyPanel] = useState(false);
  const [showResolvePanel, setShowResolvePanel] = useState(false);
  const [showInProgressPanel, setShowInProgressPanel] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [workId, setWorkId] = useState("");
  const [eta, setEta] = useState("");

  const hasUpvoted = issue.upvotedBy.includes(currentUser.id);
  const alreadyVerified = issue.verifications.some(
    (v) => v.userId === currentUser.id,
  );

  const getPriorityStyles = (p: string) => {
    switch (p) {
      case "Critical":
        return "bg-red-50 text-red-700 border-red-200 text-xs font-bold ring-red-100";
      case "High":
        return "bg-amber-50 text-amber-700 border-amber-200 text-xs font-semibold ring-amber-100";
      case "Medium":
        return "bg-blue-50 text-blue-700 border-blue-200 text-xs font-medium ring-blue-100";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200 text-xs font-medium ring-slate-100";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Reported":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-100">
            <AlertTriangle className="w-3 h-3 text-red-500" />
            Reported
          </span>
        );
      case "Verified":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
            <ShieldCheck className="w-3 h-3 text-amber-500" />
            Verified
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            <XOctagon className="w-3 h-3 text-gray-500" />
            Rejected
          </span>
        );
      case "Unsure":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
            <HelpCircle className="w-3 h-3 text-orange-500" />
            Unsure
          </span>
        );
      case "In Progress":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
            <Clock className="w-3 h-3 text-blue-500 animate-pulse" />
            In Progress
          </span>
        );
      case "Resolved":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <CheckCircle className="w-3 h-3 text-emerald-500" />
            Resolved
          </span>
        );
      default:
        return null;
    }
  };

  const getCategoryIcon = (category: IssueCategory) => {
    switch (category) {
      case "Pothole":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "Water Leakage":
        return <Droplet className="w-4 h-4 text-blue-500" />;
      case "Damaged Streetlight":
        return <Lightbulb className="w-4 h-4 text-yellow-500" />;
      case "Waste Management":
        return <Trash2 className="w-4 h-4 text-emerald-500" />;
      case "Public Infrastructure":
        return <Building className="w-4 h-4 text-purple-500" />;
      default:
        return <HelpCircle className="w-4 h-4 text-slate-500" />;
    }
  };

  const handleVerifySubmit = (approved: boolean) => {
    onVerify(
      issue.id,
      approved,
      verificationComment.trim() ||
        (approved
          ? "Verified authenticity of this report."
          : "Disputed this report structure."),
    );
    setVerificationComment("");
    setShowVerifyPanel(false);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(issue.id, commentText.trim());
    setCommentText("");
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionNotes.trim()) return;
    if (onResolveIssue) {
      onResolveIssue(issue.id, resolutionNotes.trim());
    }
    setResolutionNotes("");
    setShowResolvePanel(false);
  };

  const handleInProgressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workId.trim() || !eta.trim()) return;
    if (onInProgressIssue) {
      onInProgressIssue(issue.id, workId.trim(), eta.trim());
    }
    setWorkId("");
    setEta("");
    setShowInProgressPanel(false);
  };

  // Counting verifications
  const verifiedCount = issue.verifications.filter((v) => v.approved).length;
  const disputedCount = issue.verifications.filter((v) => !v.approved).length;

  return (
    <div
      id={`issue-card-${issue.id}`}
      className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col overflow-hidden"
    >
      {/* CARD IMAGE OR CATEGORY STRIP */}
      {issue.imageUrl ? (
        <div className="relative h-48 w-full bg-slate-100 overflow-hidden shrink-0">
          <img
            src={issue.imageUrl}
            alt={issue.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-3 right-3 flex gap-1.5">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border ${getPriorityStyles(issue.priority)}`}
            >
              {issue.priority} Priority
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950/70 to-transparent p-3 pt-10">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/10 backdrop-blur-md text-[11px] font-semibold text-white">
              {getCategoryIcon(issue.category)}
              {issue.category}
            </span>
          </div>
        </div>
      ) : (
        <div className="h-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 shrink-0" />
      )}

      {/* CARD BODY */}
      <div className="p-4 flex-grow flex flex-col gap-3">
        {/* ROW 1: STATUS, CATEGORY, PRIORITY (if no image) */}
        {!issue.imageUrl && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-slate-50 border border-slate-100 text-[11px] font-semibold text-slate-700">
              {getCategoryIcon(issue.category)}
              {issue.category}
            </span>
            <div className="flex gap-1.5 items-center">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getPriorityStyles(issue.priority)}`}
              >
                {issue.priority} Priority
              </span>
            </div>
          </div>
        )}

        {/* TITLE & ADDRESS */}
        <div>
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-bold text-slate-800 tracking-tight leading-snug hover:text-indigo-600 transition-colors">
              {issue.title}
            </h3>
            {getStatusBadge(issue.status)}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1.5 font-medium">
            <span className="min-w-0 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{issue.location.address}</span>
            </span>
            {onShowRoute && (
              <button
                type="button"
                onClick={() => onShowRoute(issue.id)}
                className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 transition-colors hover:text-indigo-900 hover:underline"
                title="Show route"
              >
                <Route className="w-3.5 h-3.5" />
                <span>Show route</span>
              </button>
            )}
          </div>
        </div>

        {/* DESCRIPTION */}
        <p className="text-xs text-slate-600 leading-relaxed font-light break-words">
          {issue.description}
        </p>

        {/* AI PUBLIC SAFETY ADVICE ALERT */}
        {issue.safetyAdvice && (
          <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-lg p-3 flex gap-2 items-start mt-1">
            <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <div className="text-[11px]">
              <span className="font-semibold text-indigo-800">
                AI Safety Advisory:{" "}
              </span>
              <span className="text-indigo-700 font-normal leading-relaxed">
                {issue.safetyAdvice}
              </span>
            </div>
          </div>
        )}

        {/* AI AUTO-GENERATED TAGS */}
        {issue.aiTags && issue.aiTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {issue.aiTags.map((tag, i) => (
              <span
                key={i}
                className="px-1.5 py-0.5 rounded text-[10px] bg-slate-50 text-slate-500 font-mono border border-slate-100"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* MUNICIPALITY IN-PROGRESS BLOCK */}
        {issue.status === "In Progress" && issue.inProgressDetails && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-2.5 items-start mt-1">
            <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-[11px]">
              <span className="font-semibold text-blue-800">
                In Progress (by {issue.inProgressDetails.officialName}):{" "}
              </span>
              <p className="text-blue-700 mt-0.5 font-light leading-relaxed">
                Work ID: {issue.inProgressDetails.workId} | ETA:{" "}
                {issue.inProgressDetails.eta}
              </p>
            </div>
          </div>
        )}

        {/* MUNICIPALITY RESOLUTION BLOCK */}
        {issue.status === "Resolved" && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 flex gap-2.5 items-start mt-1">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-[11px]">
              <span className="font-semibold text-emerald-800">
                Resolution Update{" "}
                {issue.resolvedBy
                  ? `(by ${issue.resolvedBy.officialName})`
                  : ""}
                :
              </span>
              <p className="text-emerald-700 mt-0.5 font-light leading-relaxed">
                {issue.resolutionNotes}
              </p>
              {issue.inProgressDetails?.workId && (
                <p className="text-emerald-600 mt-1 font-mono text-[10px]">
                  Work ID: {issue.inProgressDetails.workId}
                </p>
              )}
            </div>
          </div>
        )}

        {/* SEPARATOR */}
        <div className="h-[1px] bg-slate-100 my-1" />

        {/* VERIFICATION SUMMARY HUD */}
        <div className="flex items-center justify-between text-xs text-slate-500 mt-auto font-medium">
          <div className="flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>
              By{" "}
              <b className="text-slate-700 font-medium">{issue.reporterName}</b>
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {new Date(issue.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>

        {/* VOTING & VERIFICATION COUNTS ROW */}
        <div className="flex items-center justify-between gap-2 text-xs bg-slate-50/50 p-2 rounded-lg border border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-500">
            <ThumbsUp className="w-3.5 h-3.5 text-slate-400" />
            <span>
              <b>{issue.upvotes}</b> upvotes
            </span>
          </div>

          <div className="flex gap-2 text-[11px]">
            <span className="text-emerald-600 font-semibold">
              {verifiedCount} Verifications
            </span>
            {disputedCount > 0 && (
              <span className="text-red-500 font-semibold">
                {disputedCount} Disputes
              </span>
            )}
          </div>
        </div>

        {/* CORE INTERACTION ACTIONS ROW */}
        <div className="flex gap-2">
          {/* UPVOTE BUTTON */}
          {issue.reporterId !== currentUser.id &&
            currentUser.role !== "official" && (
              <button
                onClick={() => onUpvote(issue.id)}
                disabled={currentUser.id === "guest"}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                  currentUser.id === "guest"
                    ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
                    : hasUpvoted
                      ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
                title={currentUser.id === "guest" ? "Login to upvote" : ""}
                id={`btn-upvote-${issue.id}`}
              >
                <ThumbsUp
                  className={`w-3.5 h-3.5 ${hasUpvoted ? "fill-indigo-600" : ""}`}
                />
                <span>{hasUpvoted ? "Upvoted" : "Upvote"}</span>
              </button>
            )}

          {/* VERIFY BUTTON */}
          {issue.reporterId !== currentUser.id &&
            currentUser.role !== "official" && (
              <button
                onClick={() => setShowVerifyPanel(!showVerifyPanel)}
                disabled={alreadyVerified || currentUser.id === "guest"}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                  currentUser.id === "guest"
                    ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
                    : alreadyVerified
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700 cursor-not-allowed"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-emerald-300 hover:text-emerald-600"
                }`}
                title={currentUser.id === "guest" ? "Login to verify" : ""}
                id={`btn-verify-${issue.id}`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{alreadyVerified ? "Audited ✓" : "Verify Audit"}</span>
              </button>
            )}

          {/* IN PROGRESS BUTTON (Mock role action for demo simulation) */}
          {issue.status !== "In Progress" &&
            issue.status !== "Resolved" &&
            onInProgressIssue &&
            currentUser.role === "official" && (
              <button
                onClick={() => {
                  setShowInProgressPanel(!showInProgressPanel);
                  setShowResolvePanel(false);
                }}
                className={`px-3 py-1.5 border rounded-lg text-xs font-semibold transition-colors flex flex-1 items-center justify-center gap-1.5 ${
                  showInProgressPanel
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "bg-white border-slate-200 hover:border-blue-300 hover:text-blue-600 text-slate-700"
                }`}
                title="Mark as In Progress (City Staff)"
                id={`btn-inprogress-trigger-${issue.id}`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Start Work</span>
              </button>
            )}

          {/* SOLVE BUTTON (Mock role action for demo simulation) */}
          {issue.status === "In Progress" &&
            onResolveIssue &&
            currentUser.role === "official" && (
              <button
                onClick={() => {
                  setShowResolvePanel(!showResolvePanel);
                  setShowInProgressPanel(false);
                }}
                className={`px-3 py-1.5 border rounded-lg text-xs font-semibold transition-colors flex flex-1 items-center justify-center gap-1.5 ${
                  showResolvePanel
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-white border-slate-200 hover:border-emerald-300 hover:text-emerald-600 text-slate-700"
                }`}
                title="Mark as Resolved (City Staff)"
                id={`btn-resolve-trigger-${issue.id}`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Resolve</span>
              </button>
            )}
        </div>

        {/* VERIFY/DISPUTE EXPANDED PANEL */}
        {showVerifyPanel && currentUser.id !== "guest" && (
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 flex flex-col gap-2 animate-slide-down">
            <h4 className="text-[11px] font-bold text-slate-700">
              Citizen Verification Audit
            </h4>
            <textarea
              value={verificationComment}
              onChange={(e) => setVerificationComment(e.target.value)}
              placeholder="Add your audit note... (e.g. 'Verified this morning. Water is spilling onto Oak Road.')"
              className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-light resize-none h-12"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowVerifyPanel(false)}
                className="px-2 py-1 rounded bg-slate-200 text-slate-700 text-[10px] font-semibold hover:bg-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleVerifySubmit(false)}
                className="px-2 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-[10px] font-semibold flex items-center gap-1"
                id={`btn-verify-dispute-${issue.id}`}
              >
                <XOctagon className="w-3 h-3" /> Dispute Report
              </button>
              <button
                onClick={() => handleVerifySubmit(true)}
                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold flex items-center gap-1"
                id={`btn-verify-confirm-${issue.id}`}
              >
                <CheckCircle className="w-3 h-3" /> Confirm & Verify
              </button>
            </div>
            <p className="text-[9px] text-slate-400 text-right italic font-mono">
              Earns +50 Citizen XP points
            </p>
          </div>
        )}

        {/* IN PROGRESS PANEL */}
        {showInProgressPanel && currentUser.role === "official" && (
          <form
            onSubmit={handleInProgressSubmit}
            className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 flex flex-col gap-2 animate-slide-down"
          >
            <h4 className="text-[11px] font-bold text-blue-800">
              Start Work Order
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={workId}
                onChange={(e) => setWorkId(e.target.value)}
                placeholder="Work ID (e.g. WO-1029)"
                className="w-1/2 p-2 text-xs bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-light"
                required
              />
              <input
                type="text"
                value={eta}
                onChange={(e) => setEta(e.target.value)}
                placeholder="ETA (e.g. 2 Days)"
                className="w-1/2 p-2 text-xs bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-light"
                required
              />
            </div>
            <div className="flex gap-2 justify-end mt-1">
              <button
                type="button"
                onClick={() => setShowInProgressPanel(false)}
                className="px-2 py-1 rounded bg-slate-200 text-slate-700 text-[10px] font-semibold hover:bg-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-semibold"
                id={`btn-inprogress-submit-${issue.id}`}
              >
                Mark In Progress
              </button>
            </div>
          </form>
        )}

        {/* RESOLVE PANEL */}
        {showResolvePanel && currentUser.role === "official" && (
          <form
            onSubmit={handleResolveSubmit}
            className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-3 flex flex-col gap-2 animate-slide-down"
          >
            <h4 className="text-[11px] font-bold text-emerald-800">
              Resolve Hyperlocal Problem
            </h4>
            <textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Add city work resolution notes... (e.g. 'Asphalt crew filled the potholes on Broadway Blvd')"
              className="w-full p-2 text-xs bg-white border border-emerald-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-light resize-none h-12"
              required
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowResolvePanel(false)}
                className="px-2 py-1 rounded bg-slate-200 text-slate-700 text-[10px] font-semibold hover:bg-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold"
                id={`btn-resolve-submit-${issue.id}`}
              >
                Resolve Work Order
              </button>
            </div>
          </form>
        )}

        {/* VERIFICATION FEED AUDITS LIST */}
        {issue.verifications.length > 0 && (
          <div className="mt-1 flex flex-col gap-1 bg-slate-50/30 rounded-lg p-2 max-h-[110px] overflow-y-auto">
            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider font-mono">
              Citizen Verification Notes
            </span>
            {issue.verifications.map((v, idx) => (
              <div
                key={idx}
                className="flex gap-1.5 items-start text-[10px] text-slate-600 leading-tight"
              >
                <CornerDownRight className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                <span className="text-slate-800 font-medium shrink-0">
                  {v.userName}:
                </span>
                <span className="font-light italic break-words flex-grow">
                  "{v.comment}"
                </span>
                <span
                  className={
                    v.approved
                      ? "text-emerald-600 font-bold"
                      : "text-red-500 font-bold"
                  }
                >
                  {v.approved ? "✓" : "✗"}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* NEIGHBOR DISCUSSION BOARD (COMMENTS) */}
        <div className="mt-1 flex flex-col gap-2">
          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider font-mono">
            Discussion ({issue.comments.length})
          </span>

          {/* COMMENT INPUT */}
          {currentUser.id !== "guest" ? (
            <form onSubmit={handleCommentSubmit} className="flex gap-1.5">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add your message to neighbors..."
                className="flex-1 px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
                id={`input-comment-${issue.id}`}
              />
              <button
                type="submit"
                className="p-1.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors flex items-center justify-center shrink-0"
                id={`btn-send-comment-${issue.id}`}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <div className="text-center p-2 bg-slate-50 rounded border border-slate-100 text-xs text-slate-500">
              <button
                type="button"
                onClick={onRequireLogin}
                className="text-indigo-600 font-bold hover:underline cursor-pointer"
              >
                Please login
              </button>{" "}
              to join the discussion.
            </div>
          )}

          {/* COMMENTS RENDER */}
          {issue.comments.length > 0 && (
            <div className="flex flex-col gap-1.5 max-h-[130px] overflow-y-auto mt-0.5">
              {issue.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-slate-50/60 rounded p-2 text-[11px] leading-relaxed border border-slate-100/50"
                >
                  <div className="flex justify-between items-center text-[10px] font-medium text-slate-500 mb-0.5">
                    <span className="text-slate-800">{comment.userName}</span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      {new Date(comment.createdAt).toLocaleDateString(
                        undefined,
                        {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </span>
                  </div>
                  <p className="text-slate-600 font-light break-words">
                    {comment.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
