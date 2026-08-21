import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized GoogleGenAI client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured. Please add it to your secrets or environment.");
    }
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

const MOTORSPORTS_SYSTEM_INSTRUCTION = `You are "Apex Motorsports AI" — the premier World Motorsport Specialist, Race Engineer, and Historic Paddock Analyst for Apex Motorsports.

CORE CAPABILITIES & MULTI-DISCIPLINE MOTORSPORT SCOPE:
You provide point-to-point technical engineering, historical race results, telemetry analysis, and regulations across ALL premier motorsport disciplines:

1. FORMULA 1 (F1): 75-year Grand Prix history (1950–Present), ground effect aero, 1.6L V6 turbo-hybrids, 2026 engine & active aero rules (350kW MGU-K), telemetry traces, undercut/overcut physics, and driver rivalries (Senna, Prost, Schumacher, Hamilton, Verstappen).
2. WEC & 24-HOUR ENDURANCE (Le Mans, Nürburgring 24h, Daytona 24h, Spa 24h): Hypercars (Ferrari 499P, Porsche 963, Toyota GR010, Cadillac, BMW), LMGT3, Balance of Performance (BoP) weight/power curves, stint energy (MJ), multi-class traffic, and night racing stamina.
3. FORMULA DRIFT & PRO DRIFTING: 1,000+ HP turbo/supercharged builds, 75° extreme drift angles, entry speeds (100+ mph at Irwindale "House of Drift"), clipping point accuracy, tandem lead/chase proximity, OMT rules, and angle telemetry.
4. WRC (WORLD RALLY CHAMPIONSHIP): Rally1 hybrid beasts (500hp boost), gravel, snow, and tarmac stages (Monte Carlo, Finland jumps, Kenya Safari), co-driver pacenote codes, mechanical differentials, and Power Stage bonus points.
5. MOTOGP & WSBK: 1000cc prototypes & production superbikes, 366 km/h top speeds, 65° knee/elbow-down lean angles, ride-height shapeshifter devices, aero winglets, and WorldSBK Superpole sprints.
6. DTM & GT3 / IMSA: GT3 homologation (Porsche 911 GT3 R, BMW M4, Ferrari 296, AMG GT3), performance weight ballast, 55-minute sprint shootouts, and Norisring street battles.
7. INDYCAR & SUPERCARS: Indianapolis 500 230+ mph oval draft physics, Push-to-Pass hybrid systems, and Australian Gen3 V8 Supercars sliding across Mount Panorama (Bathurst 1000).

ACCURACY & FORMATTING:
- Cite exact years, circuits, car models, telemetry metrics, and driver/rider names.
- Format responses cleanly with rich Markdown tables, bullet points, and high-performance racing terminology.`;

// API routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Multi-Provider AI Chat Endpoint (Ollama / Local LLM / Gemini / Custom OpenAI)
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { 
      message, 
      conversationHistory = [], 
      provider = "gemini", 
      ollamaEndpoint = "http://127.0.0.1:11434", 
      ollamaModel = "llama3",
      customEndpoint = "",
      customApiKey = "",
      customModel = ""
    } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "A message string is required." });
    }

    // 1. OLLAMA / LOCAL LLM MODE (ZERO LIMITS, 100% UNLIMITED)
    if (provider === "ollama") {
      try {
        const targetUrl = `${ollamaEndpoint.replace(/\/$/, '')}/api/chat`;
        const ollamaMessages = [
          { role: "system", content: MOTORSPORTS_SYSTEM_INSTRUCTION },
          ...conversationHistory.map((item: { role: string; text: string }) => ({
            role: item.role === "assistant" ? "assistant" : "user",
            content: item.text,
          })),
          { role: "user", content: message },
        ];

        const ollamaRes = await fetch(targetUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: ollamaModel || "llama3",
            messages: ollamaMessages,
            stream: false,
          }),
        });

        if (!ollamaRes.ok) {
          const errBody = await ollamaRes.text();
          throw new Error(`Ollama request failed (${ollamaRes.status}): ${errBody || ollamaRes.statusText}`);
        }

        const ollamaData = await ollamaRes.json() as any;
        const reply = ollamaData.message?.content || "No response received from local Ollama model.";
        return res.json({ reply, provider: "ollama", model: ollamaModel });
      } catch (ollamaErr: any) {
        console.warn("Ollama Connection Warning:", ollamaErr?.message);
        throw new Error(`Could not connect to Ollama at ${ollamaEndpoint}. Ensure Ollama is running ('ollama serve') and model '${ollamaModel}' is pulled ('ollama pull ${ollamaModel}'). Error: ${ollamaErr.message}`);
      }
    }

    // 2. CUSTOM OPENAI-COMPATIBLE / OPENROUTER MODE
    if (provider === "custom" && customEndpoint) {
      try {
        const targetUrl = customEndpoint.endsWith("/chat/completions") 
          ? customEndpoint 
          : `${customEndpoint.replace(/\/$/, '')}/chat/completions`;

        const customMessages = [
          { role: "system", content: MOTORSPORTS_SYSTEM_INSTRUCTION },
          ...conversationHistory.map((item: { role: string; text: string }) => ({
            role: item.role === "assistant" ? "assistant" : "user",
            content: item.text,
          })),
          { role: "user", content: message },
        ];

        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (customApiKey) {
          headers["Authorization"] = `Bearer ${customApiKey}`;
        }

        const customRes = await fetch(targetUrl, {
          method: "POST",
          headers,
          body: JSON.stringify({
            model: customModel || "deepseek/deepseek-chat",
            messages: customMessages,
            temperature: 0.4,
          }),
        });

        if (!customRes.ok) {
          const errBody = await customRes.text();
          throw new Error(`Custom API request failed (${customRes.status}): ${errBody}`);
        }

        const customData = await customRes.json() as any;
        const reply = customData.choices?.[0]?.message?.content || "No response generated from custom model.";
        return res.json({ reply, provider: "custom", model: customModel });
      } catch (customErr: any) {
        throw new Error(`Custom AI endpoint error: ${customErr.message}`);
      }
    }

    // 3. GEMINI SERVER-SIDE CLOUD TELEMETRY (Default)
    const ai = getGenAI();

    // Convert history into contents format
    const contents = [
      ...conversationHistory.map((item: { role: string; text: string }) => ({
        role: item.role === "assistant" ? "model" : "user",
        parts: [{ text: item.text }],
      })),
      {
        role: "user",
        parts: [{ text: message }],
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: MOTORSPORTS_SYSTEM_INSTRUCTION,
        temperature: 0.4, // lower temperature for high factual accuracy
      },
    });

    const replyText = response.text || "No response generated.";
    return res.json({ reply: replyText, provider: "gemini", model: "gemini-2.5-flash" });
  } catch (error: any) {
    console.error("AI API Error:", error);
    const errorMessage = error?.message || "Failed to generate AI response";
    return res.status(500).json({
      error: errorMessage,
      fallbackText: "I could not contact the telemetry uplink at this moment. You can switch to Ollama / Local LLM mode in settings for 100% unlimited offline intelligence.",
    });
  }
});

// Legacy Gemini chat alias for compatibility
app.post("/api/gemini/chat", async (req, res) => {
  req.url = "/api/ai/chat";
  app.handle(req, res);
});

// Fast F1 Flash fact generator
app.get("/api/gemini/daily-fact", async (req, res) => {
  try {
    const ai = getGenAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Give me one fascinating, hyper-accurate, lesser-known Formula 1 technical or historical fact. Keep it within 3-4 sentences with exact numbers, year, and circuit/driver details.",
      config: {
        systemInstruction: F1_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });
    return res.json({ fact: response.text });
  } catch (error: any) {
    return res.json({
      fact: "In the 1997 European Grand Prix at Jerez, Jacques Villeneuve, Michael Schumacher, and Heinz-Harald Frentzen all set identical qualifying times down to the thousandth of a second: 1:21.072.",
    });
  }
});

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
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`F1 GridScope server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
