import React, { useState } from "react";
import {
  IssueCategory,
  LocationCoordinates,
  IssuePriority,
  AIAnalysisResult,
} from "../types";
import { MAP_CENTER } from "../data/mockIssues";
import {
  Camera,
  MapPin,
  Sparkles,
  AlertTriangle,
  Loader2,
  CheckCircle,
  Info,
  Droplet,
  Lightbulb,
  Trash2,
  Building,
  HelpCircle,
  FileImage,
} from "lucide-react";

interface IssueFormProps {
  onAddIssue: (
    title: string,
    description: string,
    category: IssueCategory,
    priority: IssuePriority,
    location: LocationCoordinates,
    imageUrl?: string,
    aiTags?: string[],
    safetyAdvice?: string,
  ) => void;
  selectedMapCoords?: LocationCoordinates | null;
  onClearMapCoords?: () => void;
  mapElement?: React.ReactNode;
}

// Preset simulation images that look amazing
// (Removed as per user request to use real image upload)

export default function IssueForm({
  onAddIssue,
  selectedMapCoords,
  onClearMapCoords,
  mapElement,
}: IssueFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<IssueCategory>("Other");
  const [priority, setPriority] = useState<IssuePriority>("Medium");
  const [imageUrl, setImageUrl] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);

  // Address and coordinates
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState<number>(MAP_CENTER.lat);
  const [lng, setLng] = useState<number>(MAP_CENTER.lng);
  const [geoStatus, setGeoStatus] = useState<
    "idle" | "fetching" | "success" | "error"
  >("idle");

  // Sync coords from map pick if selected
  React.useEffect(() => {
    if (selectedMapCoords) {
      setLat(selectedMapCoords.lat);
      setLng(selectedMapCoords.lng);
      setAddress(selectedMapCoords.address);
      setGeoStatus("success");
    }
  }, [selectedMapCoords]);

  // GPS fetch
  const handleFetchGPS = () => {
    if (!navigator.geolocation) {
      setGeoStatus("error");
      // Fallback
      simulateFallbackGPS();
      if (onClearMapCoords) onClearMapCoords();
      return;
    }

    setGeoStatus("fetching");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        setAddress(
          `GPS Location (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}) near District 10`,
        );
        setGeoStatus("success");
        if (onClearMapCoords) onClearMapCoords();
      },
      (error) => {
        console.warn(
          "GPS Access Denied. Simulating nearby district coordinates.",
        );
        simulateFallbackGPS();
        if (onClearMapCoords) onClearMapCoords();
      },
      { timeout: 5000 },
    );
  };

  const simulateFallbackGPS = () => {
    // Generate slightly randomized coordinates within District 10 bounds
    const latOffset = (Math.random() - 0.5) * 0.007;
    const lngOffset = (Math.random() - 0.5) * 0.01;
    const randomLat = MAP_CENTER.lat + latOffset;
    const randomLng = MAP_CENTER.lng + lngOffset;

    setLat(Math.round(randomLat * 10000) / 10000);
    setLng(Math.round(randomLng * 10000) / 10000);
    setAddress(
      `${Math.floor(Math.random() * 250 + 10)} Central Boulevard, District 10 (Simulated Geolocation)`,
    );
    setGeoStatus("success");
  };

  const triggerGeminiAnalysis = async () => {
    if (!description.trim() && !imageUrl) {
      alert(
        "Please provide a description or upload an image for Gemini AI to analyze.",
      );
      return;
    }

    setIsAiLoading(true);
    setAiResult(null);

    try {
      const response = await fetch("/api/analyze-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description.trim(),
          imageBase64: imageUrl ? imageUrl : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze with Gemini");
      }

      const data = await response.json();

      // Auto-populate form with AI results!
      if (data.title) setTitle(data.title);
      if (data.description) setDescription(data.description);
      if (data.category) setCategory(data.category);
      if (data.priority) setPriority(data.priority);
      setAiResult(data);
    } catch (err) {
      console.error("AI Analysis failed:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !title.trim() ||
      (!description.trim() && !imageUrl) ||
      !address.trim()
    ) {
      alert(
        "Please ensure Title, Address, and EITHER an Image or Description are provided.",
      );
      return;
    }

    onAddIssue(
      title.trim(),
      description.trim() || "Image-based report without description.",
      category,
      priority,
      { lat, lng, address: address.trim() },
      imageUrl || undefined,
      aiResult?.aiTags || ["Citizen Log"],
      aiResult?.safetyAdvice || "Please be aware of this reported spot.",
    );

    // Reset Form
    setTitle("");
    setDescription("");
    setCategory("Other");
    setPriority("Medium");
    setImageUrl("");
    setAddress("");
    setGeoStatus("idle");
    setAiResult(null);
    if (onClearMapCoords) onClearMapCoords();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-slate-100 p-5 md:p-6 shadow-sm flex flex-col gap-6"
    >
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-indigo-600" />
          Report Community Issue
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Help improve your neighborhood. Provide details and let AI assist with
          categorization.
        </p>
      </div>

      {/* SECTION 1: MEDIA & AI */}
      <div className="bg-slate-50/80 border border-slate-200/60 p-4 rounded-xl flex flex-col gap-4">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
          <Camera className="w-4 h-4 text-indigo-500" />
          1. Media & Description
        </h3>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
            Upload Image
          </label>
          <div className="flex items-center gap-4">
            <label className="cursor-pointer bg-white border border-slate-200 hover:bg-slate-50 p-3 rounded-lg flex items-center justify-center flex-1 transition-colors">
              <span className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <FileImage className="w-4 h-4 text-slate-400" />
                Choose an image...
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      setImageUrl(event.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
            {imageUrl && (
              <div className="relative h-14 w-14 rounded-lg overflow-hidden border border-slate-200 shrink-0 group shadow-sm">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
            Description of Problem (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="E.g., Large water leakage from underneath the pavement outside Broadway Starbucks."
            className="w-full min-h-[75px] p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-light resize-y bg-white"
            id="form-input-desc"
          />
        </div>

        <button
          type="button"
          onClick={triggerGeminiAnalysis}
          className="w-full flex items-center justify-center gap-2 py-2.5 mt-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-xs font-semibold transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
          disabled={isAiLoading}
          id="btn-trigger-ai-analysis"
        >
          {isAiLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing with AI...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Auto-Fill details using AI</span>
            </>
          )}
        </button>

        {aiResult && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 animate-fade-in flex flex-col gap-1.5 mt-1 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>AI Analysis Complete! (Details Auto-Filled)</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-600 mt-2">
              <div className="bg-white p-2 rounded border border-emerald-100/50">
                <span className="text-slate-400 font-mono text-[9px] uppercase">
                  Category
                </span>
                <p className="font-semibold text-slate-800">
                  {aiResult.category}
                </p>
              </div>
              <div className="bg-white p-2 rounded border border-emerald-100/50">
                <span className="text-slate-400 font-mono text-[9px] uppercase">
                  Severity
                </span>
                <p className="font-semibold text-slate-800">
                  {aiResult.priority}
                </p>
              </div>
            </div>

            <div className="text-[11px] text-slate-600 pt-2 border-t border-emerald-100 mt-1">
              <span className="text-slate-400 font-mono text-[9px] uppercase">
                Public Safety Warning
              </span>
              <p className="font-medium text-indigo-900 mt-0.5">
                {aiResult.safetyAdvice}
              </p>
            </div>

            <div className="flex flex-wrap gap-1 mt-1">
              {aiResult.aiTags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-medium border border-emerald-200/60"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: DETAILS */}
      <div className="bg-slate-50/80 border border-slate-200/60 p-4 rounded-xl flex flex-col gap-4">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
          <Info className="w-4 h-4 text-indigo-500" />
          2. Issue Details
        </h3>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
            Issue Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="E.g., Broadway Road Pothole"
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium bg-white"
            required
            id="form-input-title"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as IssueCategory)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
              id="form-select-category"
            >
              <option value="Pothole">Pothole</option>
              <option value="Water Leakage">Water Leakage</option>
              <option value="Damaged Streetlight">Damaged Streetlight</option>
              <option value="Waste Management">Waste Management</option>
              <option value="Public Infrastructure">
                Public Infrastructure
              </option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              Severity
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as IssuePriority)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
              id="form-select-priority"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 3: LOCATION */}
      <div className="bg-slate-50/80 border border-slate-200/60 p-4 rounded-xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-indigo-500 animate-bounce" />
            3. Pin Location
          </h3>
          <button
            type="button"
            onClick={handleFetchGPS}
            className="text-[10px] text-indigo-700 hover:text-indigo-800 hover:bg-indigo-50 font-bold flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-colors"
            id="btn-fetch-gps"
          >
            Get Device GPS
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address description (E.g. Maple Street, block 3)"
            className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
            required
            id="form-input-address"
          />
          <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-1 px-1">
            <span>
              Lat: {lat.toFixed(4)} | Lng: {lng.toFixed(4)}
            </span>
            {geoStatus === "success" && (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Pinned
              </span>
            )}
          </div>
        </div>

        {mapElement && (
          <div className="mt-1 w-full h-[250px] md:h-[350px] rounded-xl overflow-hidden shadow-sm">
            {mapElement}
          </div>
        )}
      </div>

      <button
        type="submit"
        className="w-full py-3.5 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
        id="btn-submit-report"
      >
        Submit Civic Report Order (+100 XP)
      </button>
    </form>
  );
}
