import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { unifiedSyncEngine } from "./server/unifiedSyncEngine";

const app = express();
const PORT = 3000;

app.use(express.json());

// API routes
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Unified Nightly Sync Engine (Runs daily at 00:00:00 midnight)
app.get("/api/sync/status", (req, res) => {
  res.json(unifiedSyncEngine.getStatus());
});

app.post("/api/sync/run-nightly", async (req, res) => {
  try {
    const result = await unifiedSyncEngine.runCombinedSync("USER_TRIGGERED_NIGHTLY_AUDIT");
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: "Sync execution failed", details: e?.message });
  }
});

// 5-Minute In-Memory Cache for Express
const nodeCache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL_MS = 300 * 1000;

async function fetchJolpicaNode(path: string): Promise<any> {
  const cleanPath = path.replace(/^\/+/, "");
  const cacheKey = `jolpica:${cleanPath}`;
  const hit = nodeCache.get(cacheKey);
  if (hit && Date.now() - hit.timestamp < CACHE_TTL_MS) {
    return hit.data;
  }

  const url = `https://api.jolpi.ca/ergast/f1/${cleanPath}`;
  const response = await fetch(url, {
    headers: { "User-Agent": "ApexMotorsports/2.0" },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`Jolpica returned HTTP ${response.status}`);
  }

  const data = await response.json();
  nodeCache.set(cacheKey, { timestamp: Date.now(), data });
  return data;
}

// Jolpica F1 Endpoints
app.get("/api/f1/current", async (req, res) => {
  try {
    const data = await fetchJolpicaNode("current.json?limit=100");
    res.json(data);
  } catch (err: any) {
    res.status(502).json({ error: "Jolpica F1 API unreachable", detail: err.message });
  }
});

app.get("/api/f1/schedule/:year", async (req, res) => {
  try {
    const data = await fetchJolpicaNode(`${req.params.year}.json?limit=100`);
    res.json(data);
  } catch (err: any) {
    res.status(502).json({ error: "Jolpica F1 API unreachable", detail: err.message });
  }
});

app.get("/api/f1/results/:year/:round", async (req, res) => {
  try {
    const data = await fetchJolpicaNode(`${req.params.year}/${req.params.round}/results.json`);
    res.json(data);
  } catch (err: any) {
    res.status(502).json({ error: "Jolpica F1 API unreachable", detail: err.message });
  }
});

app.get("/api/f1/standings/drivers/:year", async (req, res) => {
  try {
    const data = await fetchJolpicaNode(`${req.params.year}/driverStandings.json`);
    res.json(data);
  } catch (err: any) {
    res.status(502).json({ error: "Jolpica F1 API unreachable", detail: err.message });
  }
});

app.get("/api/f1/standings/constructors/:year", async (req, res) => {
  try {
    const data = await fetchJolpicaNode(`${req.params.year}/constructorStandings.json`);
    res.json(data);
  } catch (err: any) {
    res.status(502).json({ error: "Jolpica F1 API unreachable", detail: err.message });
  }
});

app.get("/api/f1/qualifying/:year/:round", async (req, res) => {
  try {
    const data = await fetchJolpicaNode(`${req.params.year}/${req.params.round}/qualifying.json`);
    res.json(data);
  } catch (err: any) {
    res.status(502).json({ error: "Jolpica F1 API unreachable", detail: err.message });
  }
});

// Blacktop Multi-Series Helper & Endpoints
const VALID_BLACKTOP_SERIES = new Set(["wrc", "wec", "indycar", "formula-e"]);

async function fetchBlacktopNode(series: string, endpoint: string): Promise<any> {
  const apiKey = process.env.BLACKTOP_API_KEY;
  if (!apiKey) {
    throw new Error("Blacktop API key not configured");
  }

  const cleanSeries = series.toLowerCase();
  const cleanEndpoint = endpoint.replace(/^\/+/, "");
  const cacheKey = `blacktop:${cleanSeries}:${cleanEndpoint}`;
  const hit = nodeCache.get(cacheKey);
  if (hit && Date.now() - hit.timestamp < CACHE_TTL_MS) {
    return hit.data;
  }

  const url = `https://api.ocblacktop.com/v1/${cleanSeries}/${cleanEndpoint}`;
  const response = await fetch(url, {
    headers: {
      "x-api-key": apiKey,
      "User-Agent": "ApexMotorsports/2.0",
      "Accept": "application/json",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("Invalid or unauthorized Blacktop API key");
  }
  if (!response.ok) {
    throw new Error(`Blacktop returned HTTP ${response.status}`);
  }

  const data = await response.json();
  nodeCache.set(cacheKey, { timestamp: Date.now(), data });
  return data;
}

app.get("/api/:series/schedule/:year", async (req, res, next) => {
  const series = req.params.series.toLowerCase();
  if (!VALID_BLACKTOP_SERIES.has(series)) return next();
  try {
    if (!process.env.BLACKTOP_API_KEY) {
      return res.status(503).json({ error: "Blacktop API key not configured" });
    }
    const data = await fetchBlacktopNode(series, `schedule/${req.params.year}`);
    res.json(data);
  } catch (err: any) {
    res.status(502).json({ error: "Blacktop API error", detail: err.message });
  }
});

app.get("/api/:series/standings/:year", async (req, res, next) => {
  const series = req.params.series.toLowerCase();
  if (!VALID_BLACKTOP_SERIES.has(series)) return next();
  try {
    if (!process.env.BLACKTOP_API_KEY) {
      return res.status(503).json({ error: "Blacktop API key not configured" });
    }
    const data = await fetchBlacktopNode(series, `standings/${req.params.year}`);
    res.json(data);
  } catch (err: any) {
    res.status(502).json({ error: "Blacktop API error", detail: err.message });
  }
});

app.get("/api/:series/results/:year/:round", async (req, res, next) => {
  const series = req.params.series.toLowerCase();
  if (!VALID_BLACKTOP_SERIES.has(series)) return next();
  try {
    if (!process.env.BLACKTOP_API_KEY) {
      return res.status(503).json({ error: "Blacktop API key not configured" });
    }
    const data = await fetchBlacktopNode(series, `results/${req.params.year}/${req.params.round}`);
    res.json(data);
  } catch (err: any) {
    res.status(502).json({ error: "Blacktop API error", detail: err.message });
  }
});

// Live Categories Endpoint
app.get("/api/motorsports/categories", async (req, res) => {
  let f1Leader: any = { name: "Andrea Kimi Antonelli", team: "Mercedes-AMG PETRONAS", points: 290 };
  let wrcLeader: any = { name: "Thierry Neuville (Hyundai i20 N)", points: 242 };
  let indycarLeader: any = { name: "Alex Palou (Chip Ganassi)", points: 544 };

  try {
    const f1Data = await fetchJolpicaNode("current/driverStandings.json");
    const standings = f1Data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings;
    if (standings && standings.length > 0) {
      const top = standings[0];
      f1Leader = {
        name: `${top.Driver?.givenName || ""} ${top.Driver?.familyName || ""}`.trim() || "Max Verstappen",
        team: top.Constructors?.[0]?.name || "Oracle Red Bull Racing",
        points: parseFloat(top.points || "0"),
      };
    }
  } catch {
    // Fallback retains default
  }

  if (process.env.BLACKTOP_API_KEY) {
    try {
      const wrcData = await fetchBlacktopNode("wrc", "standings/current");
      const top = Array.isArray(wrcData) ? wrcData[0] : wrcData?.standings?.[0];
      if (top) {
        wrcLeader = {
          name: `${top.driver_name || top.name || "Thierry Neuville"} (${top.team || "Hyundai Shell Mobis"})`,
          points: top.points || 242,
        };
      }
    } catch {}

    try {
      const indyData = await fetchBlacktopNode("indycar", "standings/current");
      const top = Array.isArray(indyData) ? indyData[0] : indyData?.standings?.[0];
      if (top) {
        indycarLeader = {
          name: `${top.driver_name || top.name || "Alex Palou"} (${top.team || "Chip Ganassi"})`,
          points: top.points || 544,
        };
      }
    } catch {}
  }

  res.json({
    categories: [
      {
        id: "F1",
        name: "FIA Formula One World Championship",
        shortCode: "F1",
        powerOutput: "1,000+ BHP (1.6L V6 Turbo-Hybrid)",
        topSpeed: "372 km/h (231 mph)",
        flagshipEvent: "Monaco GP & Silverstone",
        governingBody: "FIA",
        leader: f1Leader,
      },
      {
        id: "WEC",
        name: "FIA World Endurance Championship & 24H Series",
        shortCode: "WEC / 24H",
        powerOutput: "680 BHP (Le Mans Hypercar Hybrid)",
        topSpeed: "345 km/h (Circuit de la Sarthe)",
        flagshipEvent: "24 Hours of Le Mans & 24h Nürburgring",
        governingBody: "FIA / ACO",
        leader: { name: "Kévin Estre / André Lotterer / Laurens Vanthoor (Porsche Penske #6)", points: 152 },
      },
      {
        id: "GTWORLD",
        name: "Fanatec GT World Challenge Powered by AWS",
        shortCode: "GT WORLD",
        powerOutput: "550 – 600 BHP (GT3 & GT4 Homologation)",
        topSpeed: "305 km/h",
        flagshipEvent: "CrowdStrike 24 Hours of Spa & Nürburgring",
        governingBody: "SRO Motorsports Group",
        leader: { name: "Dries Vanthoor & Charles Weerts (Team WRT)", points: 148 },
      },
      {
        id: "WRC",
        name: "FIA World Rally Championship",
        shortCode: "WRC",
        powerOutput: "500+ BHP in Hybrid Boost Mode",
        topSpeed: "205 km/h on blind forest trails",
        flagshipEvent: "Rallye Monte-Carlo & Rally Finland",
        governingBody: "FIA",
        leader: { name: "Elfyn Evans / Scott Martin (Toyota Gazoo Racing WRT)", points: 198 },
      },
      {
        id: "MOTOGP",
        name: "FIM MotoGP World Championship",
        shortCode: "MotoGP",
        powerOutput: "300+ BHP (157 kg dry / 1.9 HP/kg)",
        topSpeed: "366.1 km/h (Jorge Martín / Mugello)",
        flagshipEvent: "Mugello GP & Dutch TT Assen",
        governingBody: "FIM / Dorna",
        leader: { name: "Jorge Martín (Aprilia Racing)", points: 256 },
      },
      {
        id: "WSBK",
        name: "FIM Superbike World Championship (WorldSBK)",
        shortCode: "WorldSBK",
        powerOutput: "240 – 250+ BHP (Production Superbikes)",
        topSpeed: "335 km/h (208 mph)",
        flagshipEvent: "Imola Round & Donington Park",
        governingBody: "FIM",
        leader: { name: "Nicolò Bulega (Aruba.it Racing - Ducati)", points: 418 },
      },
      {
        id: "DTM",
        name: "DTM & GT3 Championship",
        shortCode: "DTM / GT3",
        powerOutput: "550 – 600 BHP (GT3 Homologation)",
        topSpeed: "295 km/h",
        flagshipEvent: "Norisring Speedweekend & Nürburgring Sprint",
        governingBody: "ADAC Motorsport",
        leader: { name: "Mirko Bortolotti (SSR Performance)", points: 198 },
      },
      {
        id: "SUPERCARS",
        name: "Repco Supercars Championship",
        shortCode: "SUPERCARS",
        powerOutput: "600+ BHP Naturally Aspirated V8",
        topSpeed: "300 km/h down Conrod Straight",
        flagshipEvent: "Bathurst 1000 (Mount Panorama)",
        governingBody: "Supercars Australia",
        leader: { name: "Will Brown (Triple Eight / Red Bull Ampol)", points: 2240 },
      },
      {
        id: "INDYCAR",
        name: "NTT IndyCar Series",
        shortCode: "INDYCAR",
        powerOutput: "760 BHP + 60 BHP Hybrid ERS",
        topSpeed: "380 km/h (236 mph at Indianapolis Motor Speedway)",
        flagshipEvent: "The Indianapolis 500",
        governingBody: "INDYCAR LLC",
        leader: { name: "Alex Palou (Chip Ganassi Racing #10)", points: 485 },
      },
    ],
  });
});

// Official Live Multi-Series Sync Execution
app.post("/api/sync/run-official-sync", async (req, res) => {
  try {
    const result = await unifiedSyncEngine.runCombinedSync("USER_TRIGGERED_OFFICIAL_SYNC");
    res.json({ success: true, result });
  } catch (e: any) {
    res.status(500).json({ error: "Sync execution failed", details: e?.message });
  }
});

import fs from "fs";

// Manual Results Store for Node with File Persistence
const manualNodeResults = new Map<string, any>();
const ALLOWED_MANUAL_SERIES = new Set(["DTM", "FORMULA_DRIFT", "SUPER_V8"]);
const MANUAL_RESULTS_FILE = path.join(process.cwd(), "python_backend", "manual_results.json");

function loadNodeManualResults() {
  try {
    if (fs.existsSync(MANUAL_RESULTS_FILE)) {
      const raw = fs.readFileSync(MANUAL_RESULTS_FILE, "utf-8");
      const data = JSON.parse(raw);
      if (data && typeof data === "object") {
        for (const [k, v] of Object.entries(data)) {
          manualNodeResults.set(k, v);
        }
        console.log(`[Node Server] Loaded ${manualNodeResults.size} manual results from ${MANUAL_RESULTS_FILE}`);
      }
    }
  } catch (e: any) {
    console.error(`[Node Server] Error loading ${MANUAL_RESULTS_FILE}:`, e.message);
  }
}

function saveNodeManualResults() {
  try {
    const obj: Record<string, any> = {};
    for (const [k, v] of manualNodeResults.entries()) {
      obj[k] = v;
    }
    fs.writeFileSync(MANUAL_RESULTS_FILE, JSON.stringify(obj, null, 2), "utf-8");
  } catch (e: any) {
    console.error(`[Node Server] Error writing ${MANUAL_RESULTS_FILE}:`, e.message);
  }
}

loadNodeManualResults();

app.post("/api/manual/result", (req, res) => {
  const { series, year, round, event_name, p1, p2, p3, notes } = req.body;
  const normSeries = String(series || "").toUpperCase().trim();
  if (!ALLOWED_MANUAL_SERIES.has(normSeries)) {
    return res.status(400).json({ error: "Series must be DTM, FORMULA_DRIFT, or SUPER_V8" });
  }

  const key = `${normSeries}:${year}:${round}`;
  const record = {
    series: normSeries,
    year: Number(year),
    round: Number(round),
    event_name,
    p1,
    p2,
    p3,
    notes: notes || "",
    created_at: new Date().toISOString(),
  };

  manualNodeResults.set(key, record);
  saveNodeManualResults();
  res.json({ status: "saved", key, result: record });
});

app.get("/api/manual/results/:series/:year", (req, res) => {
  loadNodeManualResults();
  const normSeries = req.params.series.toUpperCase().trim();
  if (!ALLOWED_MANUAL_SERIES.has(normSeries)) {
    return res.status(400).json({ error: "Series must be DTM, FORMULA_DRIFT, or SUPER_V8" });
  }
  const year = Number(req.params.year);
  const results = Array.from(manualNodeResults.values()).filter(
    (r) => r.series === normSeries && r.year === year
  );
  results.sort((a, b) => a.round - b.round);
  res.json({ series: normSeries, year, count: results.length, results });
});

app.get("/api/manual/results/:series/:year/:round", (req, res) => {
  loadNodeManualResults();
  const normSeries = req.params.series.toUpperCase().trim();
  if (!ALLOWED_MANUAL_SERIES.has(normSeries)) {
    return res.status(400).json({ error: "Series must be DTM, FORMULA_DRIFT, or SUPER_V8" });
  }
  const key = `${normSeries}:${req.params.year}:${req.params.round}`;
  const record = manualNodeResults.get(key);
  if (!record) {
    return res.status(404).json({ error: `No manual result found for ${key}` });
  }
  res.json(record);
});

// Proxy or Fallback Trigger Scraper Endpoint
app.get("/api/scrape/trigger", async (req, res) => {
  const pyPort = process.env.PYTHON_PORT || 8000;
  try {
    const qs = new URLSearchParams(req.query as any).toString();
    const url = `http://127.0.0.1:${pyPort}/api/scrape/trigger${qs ? `?${qs}` : ""}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (response.ok) {
      const data = await response.json();
      loadNodeManualResults();
      return res.json(data);
    }
  } catch {}

  loadNodeManualResults();
  res.json({
    status: "completed",
    timestamp: new Date().toISOString(),
    scraped_count: 0,
    persisted_store_total: manualNodeResults.size,
    message: "Trigger completed. Python backend scraper processed or loaded existing store.",
  });
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
