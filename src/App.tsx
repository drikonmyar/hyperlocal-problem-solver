import React, { useState, useEffect, useCallback } from "react";
import "leaflet/dist/leaflet.css";
import {
  Issue,
  Citizen,
  IssueCategory,
  IssueStatus,
  IssuePriority,
  LocationCoordinates,
  Comment,
  Badge,
} from "./types";
import {
  INITIAL_CITIZENS,
  INITIAL_ISSUES,
  MAP_CENTER,
} from "./data/mockIssues";
import IssueMap from "./components/IssueMap";
import IssueCard from "./components/IssueCard";
import IssueForm from "./components/IssueForm";
import DashboardStats from "./components/DashboardStats";
import Leaderboard from "./components/Leaderboard";
import PredictiveInsightsPanel from "./components/PredictiveInsightsPanel";
import { AuthScreen } from "./components/AuthScreen";
import { motion, AnimatePresence } from "motion/react";
import {
  PlusCircle,
  Map,
  Trophy,
  Sparkles,
  Activity,
  X,
  Award,
  CheckCircle,
  MapPin,
  HelpCircle,
  AlertTriangle,
  Flame,
  ShieldCheck,
  TrendingUp,
  ThumbsUp,
  Layers,
  Search,
  BookOpen,
  Users,
} from "lucide-react";

const GUEST_USER: Citizen = {
  id: "guest",
  name: "Guest User",
  email: "",
  role: "citizen",
  xp: 0,
  badges: [],
  verifiedCount: 0,
  reportedCount: 0,
};

export default function App() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [currentUser, setCurrentUser] = useState<Citizen>(GUEST_USER);
  const [showLogin, setShowLogin] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "report" | "leaderboard" | "insights"
  >("dashboard");
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Map pin placement state
  const [mapPinnedCoords, setMapPinnedCoords] =
    useState<LocationCoordinates | null>(null);

  const [mapCenter, setMapCenter] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [currentLocation, setCurrentLocation] =
    useState<LocationCoordinates | null>(null);
  const [hasGeo, setHasGeo] = useState<boolean | null>(null);
  const [routeData, setRouteData] = useState<
    { lat: number; lng: number }[] | null
  >(null);

  const locateCurrentUser = useCallback(
    (shouldSetCenter = true) =>
      new Promise<LocationCoordinates | null>((resolve) => {
        if (!navigator.geolocation) {
          setHasGeo(false);
          resolve(null);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userCoords = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              address: `GPS Location (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`,
            };
            setCurrentLocation(userCoords);
            if (shouldSetCenter) {
              setMapCenter({
                lat: userCoords.lat,
                lng: userCoords.lng,
              });
            }
            setHasGeo(true);
            resolve(userCoords);
          },
          () => {
            setHasGeo(false);
            resolve(null);
          },
        );
      }),
    [],
  );

  useEffect(() => {
    void locateCurrentUser();
  }, [locateCurrentUser]);

  useEffect(() => {
    if (hasGeo === false && issues.length > 0) {
      const counts: Record<
        string,
        { count: number; lat: number; lng: number }
      > = {};
      let maxKey = "";
      let maxCount = 0;
      issues.forEach((issue) => {
        const key = `${issue.location.lat},${issue.location.lng}`;
        if (!counts[key]) {
          counts[key] = {
            count: 0,
            lat: issue.location.lat,
            lng: issue.location.lng,
          };
        }
        counts[key].count += 1;
        if (counts[key].count > maxCount) {
          maxCount = counts[key].count;
          maxKey = key;
        }
      });
      if (maxKey) {
        setMapCenter({ lat: counts[maxKey].lat, lng: counts[maxKey].lng });
      }
    }
  }, [hasGeo, issues]);

  // Level Up Toast
  const [levelUpAlert, setLevelUpAlert] = useState<{
    oldLevel: number;
    newLevel: number;
    badgeName?: string;
  } | null>(null);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedIssues = localStorage.getItem("community_hero_issues");
    const savedCitizens = localStorage.getItem("community_hero_citizens");
    const savedUser = localStorage.getItem("community_hero_current_user");

    if (savedIssues) {
      setIssues(JSON.parse(savedIssues));
    } else {
      setIssues(INITIAL_ISSUES);
      localStorage.setItem(
        "community_hero_issues",
        JSON.stringify(INITIAL_ISSUES),
      );
    }

    if (savedCitizens) {
      const parsedCitizens = JSON.parse(savedCitizens);
      setCitizens(parsedCitizens);
      // Retrieve current user if previously logged in
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
    } else {
      setCitizens(INITIAL_CITIZENS);
      localStorage.setItem(
        "community_hero_citizens",
        JSON.stringify(INITIAL_CITIZENS),
      );
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
    }
  }, []);

  // Save changes helper
  const saveState = (
    updatedIssues: Issue[],
    updatedCitizens: Citizen[],
    updatedCurrentUser: Citizen,
  ) => {
    setIssues(updatedIssues);
    setCitizens(updatedCitizens);
    setCurrentUser(updatedCurrentUser);

    localStorage.setItem(
      "community_hero_issues",
      JSON.stringify(updatedIssues),
    );
    localStorage.setItem(
      "community_hero_citizens",
      JSON.stringify(updatedCitizens),
    );
    if (updatedCurrentUser && updatedCurrentUser.id !== "guest") {
      localStorage.setItem(
        "community_hero_current_user",
        JSON.stringify(updatedCurrentUser),
      );
    } else {
      localStorage.removeItem("community_hero_current_user");
    }
  };

  // Helper to add XP and check level ups
  const getUpdatedCitizensWithXp = (
    currentCitizens: Citizen[],
    amount: number,
    citizenId: string,
    actionDescription: string,
  ): Citizen[] => {
    return currentCitizens.map((c) => {
      if (c.id === citizenId) {
        const oldXp = c.xp;
        const newXp = oldXp + amount;

        const oldLevel = Math.floor(oldXp / 500) + 1;
        const newLevel = Math.floor(newXp / 500) + 1;

        // Clone badges
        let badges = [...c.badges];

        // Check level thresholds for badges
        let unlockedBadge: Badge | undefined;
        if (oldLevel < 2 && newLevel >= 2) {
          const newBadge: Badge = {
            id: "badge-2",
            name: "Hawk Eye",
            description: "Verified 10 other citizen reports correctly.",
            icon: "Eye",
            unlockedAt: new Date().toISOString(),
          };
          if (!badges.some((b) => b.id === newBadge.id)) {
            badges.push(newBadge);
            unlockedBadge = newBadge;
          }
        }
        if (oldLevel < 3 && newLevel >= 3) {
          const newBadge: Badge = {
            id: "badge-3",
            name: "Civic Pillar",
            description: "Achieved over 1,000 community impact points.",
            icon: "Award",
            unlockedAt: new Date().toISOString(),
          };
          if (!badges.some((b) => b.id === newBadge.id)) {
            badges.push(newBadge);
            unlockedBadge = newBadge;
          }
        }

        // Trigger local alert toast if it's the current user
        if (newLevel > oldLevel && c.id === currentUser?.id) {
          setLevelUpAlert({
            oldLevel,
            newLevel,
            badgeName: unlockedBadge?.name,
          });
        }

        return {
          ...c,
          xp: newXp,
          badges,
          verifiedCount:
            actionDescription === "verify"
              ? c.verifiedCount + 1
              : c.verifiedCount,
          reportedCount:
            actionDescription === "report"
              ? c.reportedCount + 1
              : c.reportedCount,
        };
      }
      return c;
    });
  };

  // Upvote
  const handleUpvote = (issueId: string) => {
    if (!currentUser) return;

    let updatedCitizens = citizens;
    const updatedIssues = issues.map((issue) => {
      if (issue.id === issueId) {
        const isUpvoted = issue.upvotedBy.includes(currentUser.id);
        const upvotedBy = isUpvoted
          ? issue.upvotedBy.filter((uid) => uid !== currentUser.id)
          : [...issue.upvotedBy, currentUser.id];

        const upvotes = isUpvoted ? issue.upvotes - 1 : issue.upvotes + 1;

        // Reward the original reporter with +10 XP if upvoted
        if (!isUpvoted && issue.reporterId !== currentUser.id) {
          updatedCitizens = getUpdatedCitizensWithXp(
            updatedCitizens,
            10,
            issue.reporterId,
            "upvote_earned",
          );
        }

        return {
          ...issue,
          upvotes,
          upvotedBy,
          updatedAt: new Date().toISOString(),
        };
      }
      return issue;
    });

    const updatedUser =
      currentUser && currentUser.id !== "guest"
        ? updatedCitizens.find((c) => c.id === currentUser.id) || currentUser
        : currentUser;

    saveState(updatedIssues, updatedCitizens, updatedUser);
  };

  // Verify Audit
  const handleVerify = (
    issueId: string,
    approved: boolean,
    auditComment: string,
  ) => {
    if (!currentUser) return;

    const updatedIssues = issues.map((issue) => {
      if (issue.id === issueId) {
        // Prevent duplicate verifications from same user
        if (issue.verifications.some((v) => v.userId === currentUser.id))
          return issue;

        const newVerification = {
          userId: currentUser.id,
          userName: currentUser.name,
          approved,
          comment: auditComment,
          createdAt: new Date().toISOString(),
        };

        const verifications = [...issue.verifications, newVerification];

        // Auto-change status
        let status = issue.status;
        if (status !== "In Progress" && status !== "Resolved") {
          const verifiedCount = verifications.filter((v) => v.approved).length;
          const disputedCount = verifications.filter((v) => !v.approved).length;

          if (verifiedCount > disputedCount * 3) {
            status = "Verified";
          } else if (disputedCount > verifiedCount * 3) {
            status = "Rejected";
          } else {
            status = "Unsure";
          }
        }

        return {
          ...issue,
          verifications,
          status,
          updatedAt: new Date().toISOString(),
        };
      }
      return issue;
    });

    // Give auditor +50 XP
    const updatedCitizens = getUpdatedCitizensWithXp(
      citizens,
      50,
      currentUser.id,
      "verify",
    );

    const updatedUser =
      currentUser && currentUser.id !== "guest"
        ? updatedCitizens.find((c) => c.id === currentUser.id) || currentUser
        : currentUser;

    saveState(updatedIssues, updatedCitizens, updatedUser);
  };

  // Add Comment
  const handleAddComment = (issueId: string, commentText: string) => {
    if (!currentUser) return;

    const updatedIssues = issues.map((issue) => {
      if (issue.id === issueId) {
        const newComment: Comment = {
          id: `comment-${Date.now()}`,
          userId: currentUser.id,
          userName: currentUser.name,
          text: commentText,
          createdAt: new Date().toISOString(),
        };
        return {
          ...issue,
          comments: [...issue.comments, newComment],
          updatedAt: new Date().toISOString(),
        };
      }
      return issue;
    });

    saveState(updatedIssues, citizens, currentUser);
  };

  // Mark as In Progress
  const handleInProgressIssue = (
    issueId: string,
    workId: string,
    eta: string,
  ) => {
    if (!currentUser || currentUser.role !== "official") return;

    const updatedIssues = issues.map((issue) => {
      if (issue.id === issueId) {
        return {
          ...issue,
          status: "In Progress" as IssueStatus,
          inProgressDetails: {
            officialId: currentUser.id,
            officialName: currentUser.name,
            workId,
            eta,
          },
          updatedAt: new Date().toISOString(),
        };
      }
      return issue;
    });

    saveState(updatedIssues, citizens, currentUser);
  };

  // Resolve (City works simulation order)
  const handleResolveIssue = (issueId: string, resolutionNotes: string) => {
    let updatedCitizens = citizens;
    const updatedIssues = issues.map((issue) => {
      if (issue.id === issueId) {
        // Reward original reporter with +150 XP for getting their issue resolved!
        updatedCitizens = getUpdatedCitizensWithXp(
          updatedCitizens,
          150,
          issue.reporterId,
          "resolved_bonus",
        );

        return {
          ...issue,
          status: "Resolved" as IssueStatus,
          resolutionNotes,
          resolvedBy: {
            officialId: currentUser.id,
            officialName: currentUser.name,
          },
          updatedAt: new Date().toISOString(),
        };
      }
      return issue;
    });

    const updatedUser =
      currentUser && currentUser.id !== "guest"
        ? updatedCitizens.find((c) => c.id === currentUser.id) || currentUser
        : currentUser;

    saveState(updatedIssues, updatedCitizens, updatedUser);
  };

  // Add New Issue
  const handleAddNewIssue = (
    title: string,
    description: string,
    category: IssueCategory,
    priority: IssuePriority,
    location: LocationCoordinates,
    imageUrl?: string,
    aiTags?: string[],
    safetyAdvice?: string,
  ) => {
    if (!currentUser) return;

    const newIssue: Issue = {
      id: `issue-${Date.now()}`,
      title,
      description,
      category,
      imageUrl,
      location,
      status: "Reported",
      priority,
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      verifications: [],
      comments: [],
      upvotes: 0,
      upvotedBy: [],
      aiTags: aiTags || ["Citizen Log"],
      safetyAdvice,
    };

    const updatedIssues = [newIssue, ...issues];

    // Award +100 XP to current reporter
    const updatedCitizens = getUpdatedCitizensWithXp(
      citizens,
      100,
      currentUser.id,
      "report",
    );

    const updatedUser =
      currentUser && currentUser.id !== "guest"
        ? updatedCitizens.find((c) => c.id === currentUser.id) || currentUser
        : currentUser;

    saveState(updatedIssues, updatedCitizens, updatedUser);
    setMapPinnedCoords(null);
    setSelectedIssueId(newIssue.id); // View the new issue
    setMapCenter({ lat: newIssue.location.lat, lng: newIssue.location.lng });
    setRouteData(null);
    setActiveTab("dashboard"); // Go back to Map
  };

  // Filter lists
  // Show Route
  const handleShowRoute = async (issueId: string) => {
    const issue = issues.find((i) => i.id === issueId);
    if (!issue) return;

    const routeStart = currentLocation ?? MAP_CENTER;

    try {
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${routeStart.lng},${routeStart.lat};${issue.location.lng},${issue.location.lat}?overview=full&geometries=geojson`,
      );
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const coords = data.routes[0].geometry.coordinates.map(
          (c: number[]) => ({
            lat: c[1],
            lng: c[0],
          }),
        );
        setRouteData(coords);
      } else {
        setRouteData([routeStart, issue.location]);
      }
    } catch (e) {
      console.error("Failed to fetch route:", e);
      setRouteData([routeStart, issue.location]);
    }
    setActiveTab("dashboard");
  };

  const filteredIssuesList = issues.filter((issue) => {
    if (categoryFilter !== "All" && issue.category !== categoryFilter)
      return false;
    if (statusFilter !== "All" && issue.status !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = issue.title.toLowerCase().includes(q);
      const matchDesc = issue.description.toLowerCase().includes(q);
      const matchTags = issue.aiTags.some((t) => t.toLowerCase().includes(q));
      const matchAddr = issue.location.address.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchTags && !matchAddr) return false;
    }
    return true;
  });

  const selectedIssue = issues.find((i) => i.id === selectedIssueId);

  const handleInspectIssue = (issue: Issue) => {
    setSelectedIssueId(issue.id);
    setMapCenter({
      lat: issue.location.lat,
      lng: issue.location.lng,
    });
    setRouteData(null);
  };

  const handleInspectIssueFromHotspot = (issue: Issue) => {
    handleInspectIssue(issue);
    window.setTimeout(() => {
      document
        .getElementById("incident-inspection-feed")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  };

  const handleLogin = (citizen: Citizen) => {
    setCurrentUser(citizen);
    localStorage.setItem(
      "community_hero_current_user",
      JSON.stringify(citizen),
    );
    setShowLogin(false);
  };

  const handleRegister = (citizenData: {
    name: string;
    email: string;
    role: "citizen" | "official";
    password?: string;
  }) => {
    const newCitizen: Citizen = {
      id: `user-${Date.now()}`,
      name: citizenData.name,
      email: citizenData.email,
      password: citizenData.password,
      role: citizenData.role,
      xp: 0,
      badges: [],
      verifiedCount: 0,
      reportedCount: 0,
    };

    const updatedCitizens = [...citizens, newCitizen];
    setCitizens(updatedCitizens);
    localStorage.setItem(
      "community_hero_citizens",
      JSON.stringify(updatedCitizens),
    );
    handleLogin(newCitizen);
  };

  const handleGuestLogin = () => {
    setCurrentUser(GUEST_USER);
    localStorage.removeItem("community_hero_current_user"); // ensure it's not saved
    setShowLogin(false);
  };

  const handleLogout = () => {
    setCurrentUser(GUEST_USER);
    localStorage.removeItem("community_hero_current_user");
  };

  const isGuest = currentUser?.id === "guest";
  const civicIncidentFilters = (
    <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm flex flex-col gap-3">
      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
        Filter Civic Incidents
      </h3>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search potholes, streets, tags..."
          className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
          id="search-input-box"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-bold text-slate-400 uppercase font-mono">
            Category
          </span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
            id="category-filter-select"
          >
            <option value="All">All Categories</option>
            <option value="Pothole">Potholes</option>
            <option value="Water Leakage">Water Leakages</option>
            <option value="Damaged Streetlight">Streetlights</option>
            <option value="Waste Management">Waste Management</option>
            <option value="Public Infrastructure">Infrastructure</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-bold text-slate-400 uppercase font-mono">
            Civic Status
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
            id="status-filter-select"
          >
            <option value="All">All Statuses</option>
            <option value="Reported">Reported</option>
            <option value="Verified">Verified</option>
            <option value="Rejected">Rejected</option>
            <option value="Unsure">Unsure</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>
    </div>
  );

  if (showLogin) {
    return (
      <AuthScreen
        onLogin={handleLogin}
        onRegister={handleRegister}
        onGuestLogin={handleGuestLogin}
        citizens={citizens}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans antialiased text-slate-800">
      {/* 1. APP TOP HEADER NAV BAR HUD */}
      <header className="bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo Brand Title */}
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => setActiveTab("dashboard")}
          >
            <div className="w-9 h-9 flex items-center justify-center text-blue-600">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-slate-800 tracking-tight font-display uppercase leading-none">
                Civic Connect
              </h1>
              <span className="text-[10px] text-indigo-600 font-mono font-bold uppercase tracking-wider block mt-0.5">
                AI-Powered Community Issue Reporting & Resolution
              </span>
            </div>
          </div>

          {/* Tab Navigation links */}
          <nav className="hidden md:flex gap-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "dashboard"
                  ? "bg-slate-100 text-indigo-700 font-bold"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Map className="w-4 h-4" /> Dashboard Map
            </button>
            <button
              onClick={() => {
                setActiveTab("report");
                setMapPinnedCoords(null);
              }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "report"
                  ? "bg-slate-100 text-indigo-700 font-bold"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <PlusCircle className="w-4 h-4" /> Report Issue
            </button>
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "leaderboard"
                  ? "bg-slate-100 text-indigo-700 font-bold"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Trophy className="w-4 h-4" /> Leaderboard & XP
            </button>
            <button
              onClick={() => setActiveTab("insights")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "insights"
                  ? "bg-slate-100 text-indigo-700 font-bold"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" /> AI
              Forecasts
            </button>
          </nav>

          {/* Logged in citizen card mini HUD */}
          {currentUser && (
            <div className="flex items-center gap-3 bg-slate-50 p-1.5 pl-3 pr-2.5 rounded-lg border border-slate-100">
              <div className="flex flex-col text-right">
                <span className="text-[10px] font-mono text-slate-400 font-bold leading-none">
                  ACTIVE{" "}
                  {isGuest
                    ? "GUEST"
                    : currentUser.role?.toUpperCase() || "HERO"}
                </span>
                <span className="text-xs font-extrabold text-slate-700 mt-0.5">
                  {currentUser.name}
                </span>
              </div>
              {!isGuest && (
                <div
                  onClick={() => setActiveTab("leaderboard")}
                  className="px-2 py-1 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-extrabold text-[10px] rounded shadow-sm flex items-center gap-1 cursor-pointer hover:from-indigo-600 hover:to-indigo-700 transition-colors"
                  title="View Achievements"
                >
                  <Trophy className="w-3 h-3" />
                  <span>Lvl {Math.floor(currentUser.xp / 500) + 1}</span>
                </div>
              )}
              <button
                onClick={() => (isGuest ? setShowLogin(true) : handleLogout())}
                className="ml-2 text-slate-400 hover:text-slate-600 text-[10px] uppercase font-bold"
              >
                {isGuest ? "Login" : "Logout"}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* MOBILE HUD NAVIGATION FOR SMALL SCREEN COMPATIBILITY */}
      <div className="md:hidden sticky top-16 z-35 bg-white border-b border-slate-100 flex justify-around p-1 shadow-inner">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex-1 py-2 text-[10px] font-bold flex flex-col items-center justify-center gap-0.5 ${activeTab === "dashboard" ? "text-indigo-600 font-black" : "text-slate-400"}`}
        >
          <Map className="w-4 h-4" /> Map
        </button>
        <button
          onClick={() => {
            setActiveTab("report");
            setMapPinnedCoords(null);
          }}
          className={`flex-1 py-2 text-[10px] font-bold flex flex-col items-center justify-center gap-0.5 ${activeTab === "report" ? "text-indigo-600 font-black" : "text-slate-400"}`}
        >
          <PlusCircle className="w-4 h-4" /> Report
        </button>
        <button
          onClick={() => setActiveTab("leaderboard")}
          className={`flex-1 py-2 text-[10px] font-bold flex flex-col items-center justify-center gap-0.5 ${activeTab === "leaderboard" ? "text-indigo-600 font-black" : "text-slate-400"}`}
        >
          <Trophy className="w-4 h-4" /> Heroes
        </button>
        <button
          onClick={() => setActiveTab("insights")}
          className={`flex-1 py-2 text-[10px] font-bold flex flex-col items-center justify-center gap-0.5 ${activeTab === "insights" ? "text-indigo-600 font-black" : "text-slate-400"}`}
        >
          <Sparkles className="w-4 h-4 text-indigo-500" /> AI Alerts
        </button>
      </div>

      {/* LEVEL UP CELEBRATORY ALERT TOAST */}
      <AnimatePresence>
        {levelUpAlert && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-4 right-4 md:left-auto md:right-4 z-50 bg-slate-900 text-white rounded-xl shadow-2xl p-4 max-w-sm border border-indigo-500 flex flex-col gap-2.5"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-yellow-400 font-extrabold text-sm font-display tracking-tight uppercase">
                <Trophy className="w-5 h-5 animate-bounce" /> Level Up Reached!
              </div>
              <button
                onClick={() => setLevelUpAlert(null)}
                className="p-1 hover:bg-slate-800 rounded"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <p className="text-xs text-slate-300 font-light leading-relaxed">
              Incredible work, Citizen Hero! Your efforts moved you from Level{" "}
              <b className="text-white">{levelUpAlert.oldLevel}</b> to{" "}
              <b className="text-indigo-400">Level {levelUpAlert.newLevel}</b>.
            </p>
            {levelUpAlert.badgeName && (
              <div className="bg-indigo-600/50 rounded-lg p-2 flex items-center gap-2 border border-indigo-400/30 text-xs">
                <Award className="w-4 h-4 text-yellow-300 shrink-0" />
                <span>
                  Unlocked Badge:{" "}
                  <b className="text-white">{levelUpAlert.badgeName}</b>
                </span>
              </div>
            )}
            <button
              onClick={() => {
                setLevelUpAlert(null);
                setActiveTab("leaderboard");
              }}
              className="w-full py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 font-semibold rounded-lg text-[11px] transition-colors"
            >
              Check My Trophy Cabinet
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. CORE LAYOUT VIEWPORTS CONTAINER */}
      <main className="flex-grow max-w-7xl mx-auto w-full p-4">
        <AnimatePresence mode="wait">
          {/* TAB 1: DASHBOARD AND COMMUNITY GIS MAP */}
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-5"
            >
              {/* Dynamic Health Stats Grid */}
              <DashboardStats
                issues={issues}
                selectedIssueId={selectedIssueId}
                onSelectIssue={handleInspectIssueFromHotspot}
                rightSlot={civicIncidentFilters}
              />

              {/* DUAL PANELS: Map grid on left, Incident Feed list on right */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
                {/* LEFT 2/3 COLUMN: Interactive SVG map */}
                <div className="lg:col-span-2 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-700 tracking-tight uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <Map className="w-4 h-4 text-indigo-600" />
                      hyperlocal map
                    </h2>

                    <span className="text-[10px] text-slate-400 font-mono">
                      Zoom and drag to explore active pins
                    </span>
                  </div>

                  <IssueMap
                    issues={issues}
                    selectedCategory={categoryFilter}
                    selectedStatus={statusFilter}
                    centerLocation={mapCenter}
                    currentLocation={currentLocation}
                    onLocateCurrent={locateCurrentUser}
                    routeData={routeData}
                    onSelectIssue={(issue) => {
                      handleInspectIssue(issue);
                      // Scroll to right detail card smoothly
                      document
                        .getElementById("incident-inspection-feed")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    selectedIssueId={selectedIssueId}
                  />
                </div>

                {/* RIGHT 1/3 COLUMN: Incident filter search & inspection list */}
                <div
                  id="incident-inspection-feed"
                  className="flex flex-col gap-3"
                >
                  {/* ACTIVE INSPECTOR VIEW OR FILTERED FEED LIST */}
                  {selectedIssue ? (
                    <div className="flex flex-col gap-3 animate-fade-in">
                      <div className="flex justify-between items-center bg-indigo-50/50 p-2 rounded-lg border border-indigo-100/30">
                        <span className="text-[10px] font-mono font-bold text-indigo-700 uppercase">
                          Inspecting Incident ID: {selectedIssue.id.slice(0, 8)}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedIssueId(null);
                            setRouteData(null);
                          }}
                          className="text-[10px] text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-0.5 bg-white px-2 py-0.5 rounded border shadow-sm transition-colors"
                        >
                          Close Detail
                        </button>
                      </div>
                      <IssueCard
                        issue={selectedIssue}
                        currentUser={currentUser}
                        onUpvote={handleUpvote}
                        onVerify={handleVerify}
                        onAddComment={handleAddComment}
                        onResolveIssue={handleResolveIssue}
                        onInProgressIssue={handleInProgressIssue}
                        onRequireLogin={() => setShowLogin(true)}
                        onShowRoute={handleShowRoute}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                          Incident list ({filteredIssuesList.length})
                        </h3>
                        {issues.length > filteredIssuesList.length && (
                          <button
                            onClick={() => {
                              setCategoryFilter("All");
                              setStatusFilter("All");
                              setSearchQuery("");
                            }}
                            className="text-[10px] text-indigo-600 font-bold hover:underline"
                          >
                            Clear Filters
                          </button>
                        )}
                      </div>

                      {filteredIssuesList.length > 0 ? (
                        <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
                          {filteredIssuesList.map((issue) => (
                            <div
                              key={issue.id}
                              onClick={() => handleInspectIssue(issue)}
                              className="bg-white p-3 rounded-xl border border-slate-100 hover:border-indigo-100 shadow-sm hover:shadow transition-all cursor-pointer flex flex-col gap-2"
                              id={`feed-item-${issue.id}`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-50 px-1.5 py-0.2 rounded border border-slate-100">
                                  {issue.category}
                                </span>
                                <span
                                  className={`text-[9px] font-bold uppercase tracking-wider ${
                                    issue.status === "Resolved"
                                      ? "text-emerald-600"
                                      : issue.status === "In Progress"
                                        ? "text-blue-500 animate-pulse"
                                        : issue.status === "Verified"
                                          ? "text-amber-500"
                                          : "text-red-500"
                                  }`}
                                >
                                  {issue.status}
                                </span>
                              </div>

                              <h4 className="text-xs font-bold text-slate-800 leading-tight tracking-tight line-clamp-1">
                                {issue.title}
                              </h4>
                              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-light">
                                {issue.description}
                              </p>

                              <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400 border-t border-slate-50 pt-1.5 mt-0.5">
                                <span className="truncate flex items-center gap-1">
                                  <MapPin className="w-3 h-3 shrink-0" />{" "}
                                  {issue.location.address}
                                </span>
                                <span className="font-semibold text-slate-600 shrink-0">
                                  {issue.upvotes} Upvotes
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-white border border-slate-100 rounded-xl p-8 text-center text-xs text-slate-400 font-light flex flex-col items-center gap-2">
                          <HelpCircle className="w-8 h-8 text-slate-200" />
                          <span>
                            No incidents matching your selected filters. Try
                            broadening your query!
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: INCIDENT REPORT SUBMISSION FORM */}
          {activeTab === "report" && (
            <motion.div
              key="report-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="max-w-2xl mx-auto flex flex-col gap-4"
            >
              {isGuest || currentUser?.role === "official" ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-2">
                    <PlusCircle className="w-8 h-8" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                    Report an Issue
                  </h2>
                  <p className="text-sm text-slate-500 max-w-md mx-auto mb-4">
                    {currentUser?.role === "official" ? (
                      <>
                        Officials cannot report issues. Please{" "}
                        <button
                          onClick={() => {
                            handleLogout();
                            setShowLogin(true);
                          }}
                          className="text-indigo-600 font-bold hover:underline cursor-pointer"
                        >
                          login as a citizen
                        </button>{" "}
                        to report a new issue in your community.
                      </>
                    ) : (
                      <>
                        Please{" "}
                        <button
                          onClick={() => setShowLogin(true)}
                          className="text-indigo-600 font-bold hover:underline cursor-pointer"
                        >
                          login
                        </button>{" "}
                        to report a new issue in your community and earn XP.
                      </>
                    )}
                  </p>
                  <button
                    onClick={() => {
                      if (currentUser?.role === "official") {
                        handleLogout();
                      }
                      setShowLogin(true);
                    }}
                    className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    Login / Register
                  </button>
                </div>
              ) : (
                <>
                  <IssueForm
                    onAddIssue={handleAddNewIssue}
                    selectedMapCoords={mapPinnedCoords}
                    onClearMapCoords={() => setMapPinnedCoords(null)}
                    mapElement={
                      <IssueMap
                        issues={issues}
                        selectedCategory="All"
                        selectedStatus="All"
                        centerLocation={mapCenter}
                        currentLocation={currentLocation}
                        onLocateCurrent={locateCurrentUser}
                        onSelectIssue={() => {}}
                        interactiveMode={true}
                        onSelectLocation={(coords) =>
                          setMapPinnedCoords(coords)
                        }
                        pinnedLocation={mapPinnedCoords}
                        className="h-full w-full"
                      />
                    }
                  />
                </>
              )}
            </motion.div>
          )}

          {/* TAB 3: GAMIFIED CITIZEN LEADERBOARD & XP PROFILE */}
          {activeTab === "leaderboard" && currentUser && (
            <motion.div
              key="leaderboard-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <Leaderboard citizens={citizens} currentUser={currentUser} />
            </motion.div>
          )}

          {/* TAB 4: AI PREDICTIVE MUNICIPAL FORECAST STATION */}
          {activeTab === "insights" && (
            <motion.div
              key="insights-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <PredictiveInsightsPanel currentIssues={issues} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 3. FOOTER */}
      <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400 mt-10 shrink-0 font-light leading-relaxed">
        <p>
          Civic Connect • Hyperlocal Problem Solver Platform • Developed on AI
          Studio
        </p>
        <p className="mt-1 flex items-center justify-center gap-1 text-[10px]">
          Powered by{" "}
          <span className="font-bold text-indigo-600">Gemini 2.5 Flash</span>{" "}
          and <span className="font-bold text-indigo-600">React + Express</span>
        </p>
      </footer>
    </div>
  );
}
