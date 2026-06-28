import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json({ limit: "10mb" }));

const PORT = 3000;

// Lazy initialization of Google GenAI SDK
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("GEMINI_API_KEY:", apiKey);
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      console.warn(
        "GEMINI_API_KEY not configured or using placeholder. Running in simulated fallback mode.",
      );
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Heuristic fallback for analysis when Gemini API is unavailable
function getSimulatedAnalysis(description: string): any {
  const descLower = description.toLowerCase();
  let category = "Other";
  let title = "Reported Incident";
  let priority = "Medium";
  let tags = ["Community Report"];
  let safetyAdvice =
    "Please keep a safe distance and report any escalation immediately to the city council.";

  if (
    descLower.includes("pothole") ||
    descLower.includes("road") ||
    descLower.includes("cracked") ||
    descLower.includes("asphalt")
  ) {
    category = "Pothole";
    title = "Significant Road Pothole";
    priority = "Medium";
    tags = ["Road Safety", "Hazard", "Traffic Hindrance"];
    safetyAdvice =
      "Slow down when approaching this section. Avoid swerving into oncoming traffic to bypass it.";
  } else if (
    descLower.includes("leak") ||
    descLower.includes("water") ||
    descLower.includes("burst") ||
    descLower.includes("flooding") ||
    descLower.includes("pipe")
  ) {
    category = "Water Leakage";
    title = "Water Mains Leakage";
    priority = "High";
    tags = ["Resource Waste", "Utility Failure", "Road Damage"];
    safetyAdvice =
      "Be alert for slippery road surfaces or pooling water. Report any sudden drops in local tap water pressure.";
  } else if (
    descLower.includes("streetlight") ||
    descLower.includes("lamp") ||
    descLower.includes("dark") ||
    descLower.includes("broken light") ||
    descLower.includes("street light")
  ) {
    category = "Damaged Streetlight";
    title = "Non-functioning Streetlight";
    priority = "Low";
    tags = ["Public Safety", "Security", "Night Hazard"];
    safetyAdvice =
      "Exercise extra caution when walking or driving in this dark section during evening hours.";
  } else if (
    descLower.includes("waste") ||
    descLower.includes("garbage") ||
    descLower.includes("trash") ||
    descLower.includes("litter") ||
    descLower.includes("dumping") ||
    descLower.includes("bin")
  ) {
    category = "Waste Management";
    title = "Overflowing Waste Disposal Area";
    priority = "Medium";
    tags = ["Sanitation", "Hygiene", "Odor Complaint"];
    safetyAdvice =
      "Do not add further refuse to the overflowing site. Avoid contact with loose rubbish or potential biohazards.";
  } else if (
    descLower.includes("bridge") ||
    descLower.includes("sidewalk") ||
    descLower.includes("park") ||
    descLower.includes("bench") ||
    descLower.includes("handrail") ||
    descLower.includes("fence")
  ) {
    category = "Public Infrastructure";
    title = "Damaged Pedestrian Sidewalk";
    priority = "Medium";
    tags = ["Pedestrian Safety", "Accessibility", "Infrastructure Maintenance"];
    safetyAdvice =
      "Watch your footing to avoid trips. Wheelchair users may need to seek alternative bypasses.";
  }

  if (
    descLower.includes("urgent") ||
    descLower.includes("danger") ||
    descLower.includes("accident") ||
    descLower.includes("blocking") ||
    descLower.includes("critical")
  ) {
    priority = "Critical";
  }

  return {
    title,
    category,
    priority,
    aiTags: tags,
    safetyAdvice,
    description: description || "Simulated issue description",
  };
}

// 1. Endpoint to analyze reported issues using Gemini
app.post("/api/analyze-issue", async (req, res) => {
  const { description, imageBase64 } = req.body;

  if (!description && !imageBase64) {
    return res
      .status(400)
      .json({ error: "Either description or image is required" });
  }

  const ai = getGeminiClient();

  if (!ai) {
    // Return simulated analysis
    const simulated = getSimulatedAnalysis(
      description || "Unknown issue from image",
    );
    return res.json(simulated);
  }

  try {
    const systemPrompt = `You are an expert civic infrastructure assistant designed to catalog and categorize hyperlocal municipal problems reported by citizens. 
Determine the correct category (Must be exactly one of: 'Pothole', 'Water Leakage', 'Damaged Streetlight', 'Waste Management', 'Public Infrastructure', 'Other').
Determine the severity priority (Must be exactly one of: 'Low', 'Medium', 'High', 'Critical').
Generate a clear, professional summary title of the issue (max 5 words).
Generate a clear, professional description of the issue if an image is provided.
Generate 3 relevant civic tagging keywords.
Generate 1 practical public safety advice sentence for fellow citizens encountering this issue.

Respond with valid JSON containing:
- title (string)
- description (string)
- category (string, exactly matched)
- priority (string, exactly matched)
- aiTags (array of 3 strings)
- safetyAdvice (string)`;

    let parts: any[] = [];
    if (imageBase64) {
      let mimeType = "image/jpeg";
      let base64Data = imageBase64;

      if (imageBase64.includes(",")) {
        const matches = imageBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (matches) {
          mimeType = matches[1];
          base64Data = matches[2];
        } else {
          base64Data = imageBase64.split(",")[1];
        }
      }

      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data,
        },
      });
    }
    if (description) {
      parts.push({
        text: `User reported issue description: "${description}"`,
      });
    } else {
      parts.push({
        text: `Please analyze the image to identify the civic issue and generate a description.`,
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            category: {
              type: Type.STRING,
              enum: [
                "Pothole",
                "Water Leakage",
                "Damaged Streetlight",
                "Waste Management",
                "Public Infrastructure",
                "Other",
              ],
            },
            priority: {
              type: Type.STRING,
              enum: ["Low", "Medium", "High", "Critical"],
            },
            aiTags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            safetyAdvice: { type: Type.STRING },
          },
          required: [
            "title",
            "description",
            "category",
            "priority",
            "aiTags",
            "safetyAdvice",
          ],
        },
      },
    });

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      return res.json(parsed);
    } else {
      throw new Error("Empty response from Gemini API");
    }
  } catch (error: any) {
    console.error("Gemini API issue analysis failed:", error);
    // Graceful fallback to heuristic simulation
    const simulated = getSimulatedAnalysis(description);
    return res.json(simulated);
  }
});

// 2. Endpoint to generate predictive community insights based on reports
app.post("/api/predictive-insights", async (req, res) => {
  const { currentIssues } = req.body;
  const ai = getGeminiClient();

  const simulatedInsights = [
    {
      id: "pred-1",
      title: "Monsoon Pothole Deterioration Risk",
      description:
        "Based on historical cluster records and local wear-and-tear, heavy rain forecasts are highly likely to turn small cracks on Broadway Boulevard into severe potholes.",
      riskScore: 85,
      potentialImpact:
        "Vehicle alignment damage, potential localized traffic gridlocks, and increased fender-bender accidents.",
      recommendedAction:
        "Pre-emptively spray-fill minor cracks on Broadway Blvd; issue early warning to commuters to drive with caution during rainy commutes.",
      category: "Pothole",
      predictedLocation: "Broadway Boulevard (Intersection with 5th Ave)",
      triggerFactor:
        "Heavy rainfall coupled with micro-cracks in aging asphalt pavement.",
    },
    {
      id: "pred-2",
      title: "Waste Accumulation Hotspot Over-load",
      description:
        "Weekend community trash bins in the Downtown Promenade routinely overflow due to surge footfalls and lack of automated sensor alerts.",
      riskScore: 72,
      potentialImpact:
        "Unsanitary public conditions, odor complaints from local storefronts, and stray animal foraging.",
      recommendedAction:
        "Temporarily double the bin capacity on Friday afternoons; reschedule municipal clearance routes to include a Saturday morning run.",
      category: "Waste Management",
      predictedLocation: "Downtown Pedestrian Promenade",
      triggerFactor:
        "Socio-demographic crowds and outdated static collection schedules.",
    },
    {
      id: "pred-3",
      title: "Mains Pressure Leakage Forecast",
      description:
        "Minor water trickles reported near Oakwood residential blocks point to stress-induced micro-fractures in high-pressure subterranean conduits.",
      riskScore: 68,
      potentialImpact:
        "Underground soil erosion leading to minor pavement sinkholes, and localized tap water brownout in low-lying blocks.",
      recommendedAction:
        "Dispatch acoustic leak detection teams to scan main pressure hubs on Oakwood Rd.",
      category: "Water Leakage",
      predictedLocation: "Oakwood Road (100-300 block range)",
      triggerFactor:
        "Corrosion of vintage iron pipelines during summer utility surge peaks.",
    },
  ];

  if (!ai) {
    return res.json(simulatedInsights);
  }

  try {
    const serializedIssues = (currentIssues || [])
      .slice(0, 15)
      .map((issue: any) => ({
        title: issue.title,
        category: issue.category,
        address: issue.location.address,
        priority: issue.priority,
        status: issue.status,
        upvotes: issue.upvotes,
        created: issue.createdAt,
      }));

    const systemPrompt = `You are a municipal civil intelligence analyzer. Analyze the current civic issues in the community.
Identify 3 predictive municipal insights (risks of future infrastructure failures, congestion bottlenecks, sanitation spikes, or upcoming utility collapses) by detecting spatial patterns, frequency, and severity.

Your response MUST be a JSON array of exactly 3 objects. Each object must have these fields:
- id (string, unique like 'pred-1', 'pred-2', 'pred-3')
- title (string, professional alert name)
- description (string, explaining the prediction logic)
- riskScore (number, 1 to 100)
- potentialImpact (string, consequences of neglect)
- recommendedAction (string, preventive civic action)
- category (string, matches one of the issue categories)
- predictedLocation (string, street or area)
- triggerFactor (string, main cause)`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Provide 3 predictive insights based on the current reported issues data: ${JSON.stringify(serializedIssues)}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              riskScore: { type: Type.NUMBER },
              potentialImpact: { type: Type.STRING },
              recommendedAction: { type: Type.STRING },
              category: {
                type: Type.STRING,
                enum: [
                  "Pothole",
                  "Water Leakage",
                  "Damaged Streetlight",
                  "Waste Management",
                  "Public Infrastructure",
                  "Other",
                ],
              },
              predictedLocation: { type: Type.STRING },
              triggerFactor: { type: Type.STRING },
            },
            required: [
              "id",
              "title",
              "description",
              "riskScore",
              "potentialImpact",
              "recommendedAction",
              "category",
              "predictedLocation",
              "triggerFactor",
            ],
          },
        },
      },
    });

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      return res.json(parsed);
    } else {
      throw new Error("Empty predictive response from Gemini API");
    }
  } catch (error) {
    console.error("Gemini AI predictive intelligence failed:", error);
    return res.json(simulatedInsights);
  }
});

// Setup dev server with Vite middleware or serve static production build
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `Community Hero backend server online at http://localhost:${PORT}`,
    );
  });
}

startServer();
