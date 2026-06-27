import React, { useState } from "react";
import { IssueCategory, LocationCoordinates, IssuePriority, AIAnalysisResult } from "../types";
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
  FileImage
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
    safetyAdvice?: string
  ) => void;
  selectedMapCoords?: LocationCoordinates | null;
  onClearMapCoords?: () => void;
}

// Preset simulation images that look amazing
const PRESET_IMAGES = [
  {
    id: "img-pothole",
    name: "Street Pothole",
    category: "Pothole" as IssueCategory,
    url: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=600&q=80",
    description: "Deep tire-rupturing hole on asphalt street."
  },
  {
    id: "img-water",
    name: "Water Leakage",
    category: "Water Leakage" as IssueCategory,
    url: "https://images.unsplash.com/photo-1542013936693-8848e5744430?auto=format&fit=crop&w=600&q=80",
    description: "Subterranean main pressure conduit blowout."
  },
  {
    id: "img-light",
    name: "Dark Streetlight",
    category: "Damaged Streetlight" as IssueCategory,
    url: "https://images.unsplash.com/photo-1509024644558-2f56ce76c490?auto=format&fit=crop&w=600&q=80",
    description: "Dead lamp post ballast on dark crossing."
  },
  {
    id: "img-waste",
    name: "Overflowing Bin",
    category: "Waste Management" as IssueCategory,
    url: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80",
    description: "Piles of trash bags scattered near market bins."
  }
];

export default function IssueForm({
  onAddIssue,
  selectedMapCoords,
  onClearMapCoords
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
  const [geoStatus, setGeoStatus] = useState<"idle" | "fetching" | "success" | "error">("idle");

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
      return;
    }

    setGeoStatus("fetching");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        setAddress(`GPS Location (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}) near District 10`);
        setGeoStatus("success");
      },
      (error) => {
        console.warn("GPS Access Denied. Simulating nearby district coordinates.");
        simulateFallbackGPS();
      },
      { timeout: 5000 }
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
    setAddress(`${Math.floor(Math.random() * 250 + 10)} Central Boulevard, District 10 (Simulated Geolocation)`);
    setGeoStatus("success");
  };

  // Convert image preset to base64 or send direct URL
  const handleSelectPreset = (preset: typeof PRESET_IMAGES[0]) => {
    setImageUrl(preset.url);
    setCategory(preset.category);
    // Autofill description slightly to aid AI analysis
    if (!description.trim()) {
      setDescription(`Observed a significant ${preset.name.toLowerCase()} here. ${preset.description}`);
    }
  };

  const triggerGeminiAnalysis = async () => {
    if (!description.trim()) {
      alert("Please provide a description of the issue first, so Gemini AI has context to analyze.");
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
          imageBase64: imageUrl ? imageUrl : undefined // We can pass the URL/Simulated image
        })
      });

      if (!response.ok) {
        throw new Error("Failed to analyze with Gemini");
      }

      const data = await response.json();
      
      // Auto-populate form with AI results!
      setTitle(data.title);
      setCategory(data.category);
      setPriority(data.priority);
      setAiResult(data);
    } catch (err) {
      console.error("AI Analysis failed:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !address.trim()) {
      alert("Please ensure all fields (Title, Description, and Address coordinates) are filled.");
      return;
    }

    onAddIssue(
      title.trim(),
      description.trim(),
      category,
      priority,
      { lat, lng, address: address.trim() },
      imageUrl || undefined,
      aiResult?.aiTags || ["Citizen Log"],
      aiResult?.safetyAdvice || "Please be aware of this reported spot."
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
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <Camera className="w-5 h-5 text-indigo-600" />
          Report Community Issue
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Identify, pin on GIS grid, run AI analysis, and submit to earn Citizen XP.</p>
      </div>

      {/* CHOOSE PRESET ROAD HAZARD PHOTOS */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">Simulate Mobile Camera Upload (Recommended)</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESET_IMAGES.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className={`p-1.5 rounded-lg border text-left transition-all overflow-hidden flex flex-col gap-1 ${
                imageUrl === preset.url 
                  ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-100" 
                  : "border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300"
              }`}
              id={`preset-img-btn-${preset.id}`}
            >
              <div className="h-14 w-full bg-slate-200 rounded overflow-hidden">
                <img 
                  src={preset.url} 
                  alt={preset.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-[10px] font-bold text-slate-700 truncate block mt-0.5">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* DESCRIPTION INPUT */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">Description of Problem</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Be specific! E.g. Large water leakage from underneath the pavement outside Broadway Starbucks. It is flooding the sidewalk."
          className="w-full min-h-[75px] p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-light resize-y"
          required
          id="form-input-desc"
        />
      </div>

      {/* GEMINI AI ANALYZER BUTTON */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={triggerGeminiAnalysis}
          className="w-full flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-100 transition-all disabled:opacity-75 disabled:cursor-not-allowed"
          disabled={isAiLoading}
          id="btn-trigger-ai-analysis"
        >
          {isAiLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Gemini AI is categorizing & generating advice...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Analyze Report with Gemini AI</span>
            </>
          )}
        </button>

        {/* AI ANALYSIS RESULTS REPORT CARD */}
        {aiResult && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 animate-fade-in flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Gemini AI Analysis Complete! (Form Auto-Filled)</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 mt-1">
              <div>
                <span className="text-slate-400 font-mono text-[9px] uppercase">Extracted Category</span>
                <p className="font-semibold text-slate-800">{aiResult.category}</p>
              </div>
              <div>
                <span className="text-slate-400 font-mono text-[9px] uppercase">Assessed Severity</span>
                <p className="font-semibold text-slate-800">{aiResult.priority}</p>
              </div>
            </div>

            <div className="text-[11px] text-slate-600 pt-1 border-t border-emerald-100">
              <span className="text-slate-400 font-mono text-[9px] uppercase">Public Safety Warning</span>
              <p className="font-medium text-indigo-900 mt-0.5">{aiResult.safetyAdvice}</p>
            </div>
            
            <div className="flex flex-wrap gap-1 mt-1">
              {aiResult.aiTags.map((tag, i) => (
                <span key={i} className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-semibold font-mono">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CORE TITLE INPUT */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">Issue Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="E.g., Broadway Road Pothole"
          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
          required
          id="form-input-title"
        />
      </div>

      {/* TWO COLUMNS: CATEGORY AND PRIORITY */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">Category</label>
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
            <option value="Public Infrastructure">Public Infrastructure</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">Severity Priority</label>
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

      {/* GEOLOCATION HUB MAP PIN */}
      <div className="flex flex-col gap-2 bg-slate-50 rounded-lg p-3 border border-slate-100">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-indigo-500 animate-bounce" />
            Issue Geolocation Coords
          </span>

          <button
            type="button"
            onClick={handleFetchGPS}
            className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-100 shadow-sm transition-colors"
            id="btn-fetch-gps"
          >
            Get Device GPS
          </button>
        </div>

        {/* MOCK ADDRESS AND COORDS SHOWN */}
        <div className="flex flex-col gap-1 text-[11px] text-slate-500">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address description (E.g. Maple Street, block 3)"
            className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
            required
            id="form-input-address"
          />
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mt-1">
            <span>Latitude: {lat.toFixed(4)}</span>
            <span>Longitude: {lng.toFixed(4)}</span>
            {geoStatus === "success" && (
              <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                <CheckCircle className="w-3 h-3" /> Pinned
              </span>
            )}
          </div>
        </div>
        
        <p className="text-[10px] text-slate-400 flex items-center gap-1 leading-tight font-light mt-1">
          <Info className="w-3 h-3 text-slate-300 shrink-0" />
          Tip: You can also select <b>'Interactive Placement Mode'</b> on the map grid to pin any custom spot!
        </p>
      </div>

      {/* ACTION SUBMIT BUTTON */}
      <button
        type="submit"
        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-100 transition-colors"
        id="btn-submit-report"
      >
        Submit Civic Report Order (+100 XP)
      </button>
    </form>
  );
}
