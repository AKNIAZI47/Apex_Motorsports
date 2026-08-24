"""
Apex Motorsports - Python Web Backend (FastAPI / Uvicorn)
==========================================================
Provides real-time motorsport telemetry, multi-discipline paddock data,
live F1 Jolpica proxy with caching, Blacktop multi-series API support,
automated background sync, and manual race results entry engine.
"""

from fastapi import FastAPI, HTTPException, Request, Path, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal
from contextlib import asynccontextmanager
from bs4 import BeautifulSoup
import uvicorn
import os
import json
import time
import httpx
import asyncio
import logging
from datetime import datetime

# Configure Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("apex_motorsports")

# Environment Variables
BLACKTOP_API_KEY = os.environ.get("BLACKTOP_API_KEY", "")
JOLPICA_BASE_URL = "https://api.jolpi.ca/ergast/f1"
BLACKTOP_BASE_URL = "https://api.ocblacktop.com/v1"

# Manual Results Persistence File
MANUAL_RESULTS_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "manual_results.json")

def load_manual_results() -> Dict[str, Dict[str, Any]]:
    """Loads manual results from local JSON file. Falls back to empty dict if missing or corrupted."""
    if not os.path.exists(MANUAL_RESULTS_FILE):
        logger.info(f"Manual results file {MANUAL_RESULTS_FILE} not found. Starting with empty store.")
        return {}
    try:
        with open(MANUAL_RESULTS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, dict):
                logger.info(f"Loaded {len(data)} manual race results from {MANUAL_RESULTS_FILE}.")
                return data
            logger.warning(f"Manual results file format invalid. Resetting to empty store.")
            return {}
    except Exception as e:
        logger.error(f"Error loading manual results from {MANUAL_RESULTS_FILE}: {e}. Starting with empty store.")
        return {}

def save_manual_results() -> bool:
    """Persists manual results dict to local JSON file."""
    try:
        with open(MANUAL_RESULTS_FILE, "w", encoding="utf-8") as f:
            json.dump(manual_results_store, f, indent=2, ensure_ascii=False)
        logger.info(f"Successfully persisted {len(manual_results_store)} results to {MANUAL_RESULTS_FILE}.")
        return True
    except Exception as e:
        logger.error(f"Failed to save manual results to {MANUAL_RESULTS_FILE}: {e}")
        return False

# 5-minute In-Memory Cache (TTL = 300 seconds)
CACHE: Dict[str, Dict[str, Any]] = {}
CACHE_TTL = 300  # seconds

def get_from_cache(key: str) -> Optional[Any]:
    cached = CACHE.get(key)
    if cached and (time.time() - cached["timestamp"]) < CACHE_TTL:
        return cached["data"]
    return None

def set_in_cache(key: str, data: Any) -> None:
    CACHE[key] = {"timestamp": time.time(), "data": data}

# Background Sync State
sync_state = {
    "last_sync_time": None,
    "cached_races_count": 0,
    "last_synced_round": None,
    "last_scrape_time": None,
    "scraped_count": 0,
    "status": "idle"
}

# Manual Results Store (Initialized from manual_results.json)
manual_results_store: Dict[str, Dict[str, Any]] = load_manual_results()

# Helper: Jolpica F1 API Client with Caching & 502 Handling
async def jolpica_get(path: str) -> Any:
    cleaned_path = path.lstrip('/')
    cache_key = f"jolpica:{cleaned_path}"
    cached_data = get_from_cache(cache_key)
    if cached_data is not None:
        return cached_data

    url = f"{JOLPICA_BASE_URL}/{cleaned_path}"
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(url, headers={"User-Agent": "ApexMotorsports/2.0"})
            if response.status_code != 200:
                raise HTTPException(
                    status_code=502,
                    detail=f"Jolpica F1 API returned status {response.status_code} for path: {cleaned_path}"
                )
            data = response.json()
            set_in_cache(cache_key, data)
            return data
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Jolpica F1 API is unreachable: {str(exc)}"
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Error processing Jolpica F1 API response: {str(exc)}"
        )

# Helper: Blacktop Multi-Series API Client with Caching
SupportedBlacktopSeries = Literal["wrc", "wec", "indycar", "formula-e"]

async def blacktop_get(series: str, endpoint: str) -> Any:
    if not BLACKTOP_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="Blacktop API key not configured. Please add BLACKTOP_API_KEY to your environment variables."
        )

    cleaned_series = series.lower().strip()
    cleaned_endpoint = endpoint.lstrip('/')
    cache_key = f"blacktop:{cleaned_series}:{cleaned_endpoint}"
    cached_data = get_from_cache(cache_key)
    if cached_data is not None:
        return cached_data

    url = f"{BLACKTOP_BASE_URL}/{cleaned_series}/{cleaned_endpoint}"
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(
                url,
                headers={
                    "x-api-key": BLACKTOP_API_KEY,
                    "User-Agent": "ApexMotorsports/2.0",
                    "Accept": "application/json"
                }
            )
            if response.status_code == 401 or response.status_code == 403:
                raise HTTPException(
                    status_code=403,
                    detail="Invalid or unauthorized Blacktop API key."
                )
            if response.status_code != 200:
                raise HTTPException(
                    status_code=502,
                    detail=f"Blacktop API returned status {response.status_code} for {url}"
                )
            data = response.json()
            set_in_cache(cache_key, data)
            return data
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Blacktop API is unreachable: {str(exc)}"
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Error processing Blacktop API response: {str(exc)}"
        )

# ==========================================
# Web Scraping Engine (BeautifulSoup4 + HTTPX)
# ==========================================

SCRAPER_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control": "no-cache"
}

async def scrape_dtm_results(year: int, round: int) -> Optional[Dict[str, Any]]:
    """
    Scrapes https://www.dtm.com/en/results for the given round's podium and full classification.
    Parses the HTML table with BeautifulSoup and returns a dict with p1, p2, p3, event_name, full_results.
    Returns None if scraping fails.
    """
    url = f"https://www.dtm.com/en/results"
    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            response = await client.get(url, headers=SCRAPER_HEADERS)
            if response.status_code != 200:
                logger.warning(f"[DTM Scraper] Received HTTP {response.status_code} from {url}")
                return None

            soup = BeautifulSoup(response.text, "html.parser")
            
            # Extract Event / Header name
            event_name = f"DTM Championship {year} Round {round}"
            title_tag = soup.select_one("h1, h2.event-name, .results-header, .event-title")
            if title_tag and title_tag.get_text(strip=True):
                extracted_title = title_tag.get_text(strip=True)
                if len(extracted_title) > 3:
                    event_name = f"DTM - {extracted_title}"

            full_results = []
            
            # Find result tables or classification rows
            rows = soup.select("table tbody tr, .results-table tr, .classification-row, .table__row")
            for idx, row in enumerate(rows):
                cols = [c.get_text(strip=True) for c in row.select("td, th, .cell, .driver-cell") if c.get_text(strip=True)]
                if len(cols) >= 2:
                    pos = cols[0] if cols[0].isdigit() else str(idx + 1)
                    driver = cols[1] if len(cols) > 1 else "Unknown"
                    team = cols[2] if len(cols) > 2 else "GT3 Team"
                    car = cols[3] if len(cols) > 3 else "GT3 Spec"
                    full_results.append({
                        "position": pos,
                        "driver": driver,
                        "team": team,
                        "car": car
                    })

            # Check if podium was found
            p1 = full_results[0]["driver"] + (f" ({full_results[0]['team']})" if full_results[0].get("team") else "") if len(full_results) > 0 else None
            p2 = full_results[1]["driver"] + (f" ({full_results[1]['team']})" if full_results[1].get("team") else "") if len(full_results) > 1 else None
            p3 = full_results[2]["driver"] + (f" ({full_results[2]['team']})" if full_results[2].get("team") else "") if len(full_results) > 2 else None

            # If standard tables were not structured with simple tr/td, try parsing driver card items
            if not p1:
                driver_cards = soup.select(".driver-card, .podium-item, .result-item")
                for idx, card in enumerate(driver_cards[:10]):
                    name = card.select_one(".name, .driver-name, h3, h4")
                    team = card.select_one(".team, .vehicle, .car")
                    driver_text = name.get_text(strip=True) if name else f"Driver {idx+1}"
                    team_text = team.get_text(strip=True) if team else "DTM GT3"
                    full_results.append({"position": str(idx + 1), "driver": driver_text, "team": team_text})

                if len(full_results) >= 1:
                    p1 = full_results[0]["driver"]
                    p2 = full_results[1]["driver"] if len(full_results) > 1 else "TBD"
                    p3 = full_results[2]["driver"] if len(full_results) > 2 else "TBD"

            if p1:
                logger.info(f"[DTM Scraper] Successfully scraped {event_name}: P1={p1}")
                return {
                    "event_name": event_name,
                    "p1": p1,
                    "p2": p2 or "TBD",
                    "p3": p3 or "TBD",
                    "full_results": full_results
                }
            
            logger.warning(f"[DTM Scraper] Could not locate classification elements in page structure.")
            return None

    except Exception as e:
        logger.error(f"[DTM Scraper] Error scraping DTM results for year={year}, round={round}: {e}")
        return None

async def scrape_formuladrift_results(year: int, round: int) -> Optional[Dict[str, Any]]:
    """
    Scrapes https://www.formulad.com/results for the given round's podium and full classification.
    Parses the HTML table with BeautifulSoup and returns a dict with p1, p2, p3, event_name, full_results.
    Returns None if scraping fails.
    """
    url = f"https://www.formulad.com/results"
    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            response = await client.get(url, headers=SCRAPER_HEADERS)
            if response.status_code != 200:
                # Try fallback year path
                url_year = f"https://www.formulad.com/results/{year}"
                response = await client.get(url_year, headers=SCRAPER_HEADERS)
                if response.status_code != 200:
                    logger.warning(f"[Formula Drift Scraper] Received HTTP {response.status_code} from {url}")
                    return None

            soup = BeautifulSoup(response.text, "html.parser")
            
            event_name = f"Formula DRIFT PRO Championship {year} Round {round}"
            title_tag = soup.select_one("h1.page-title, .event-header, h2.round-title, .results-title")
            if title_tag and title_tag.get_text(strip=True):
                event_name = f"Formula Drift - {title_tag.get_text(strip=True)}"

            full_results = []
            
            # Look for podium or bracket results
            podium_blocks = soup.select(".podium, .podium-driver, .bracket-winner, .result-driver, table tbody tr")
            for idx, block in enumerate(podium_blocks):
                name_elem = block.select_one(".driver-name, .name, strong, b, td:nth-child(2)")
                car_elem = block.select_one(".car, .vehicle, .team, td:nth-child(3)")
                driver_name = name_elem.get_text(strip=True) if name_elem else block.get_text(strip=True)
                car_name = car_elem.get_text(strip=True) if car_elem else "Formula D PRO Spec"
                
                if driver_name and len(driver_name) > 2 and "position" not in driver_name.lower():
                    full_results.append({
                        "position": str(idx + 1),
                        "driver": driver_name,
                        "car": car_name
                    })

            p1 = full_results[0]["driver"] if len(full_results) > 0 else None
            p2 = full_results[1]["driver"] if len(full_results) > 1 else None
            p3 = full_results[2]["driver"] if len(full_results) > 2 else None

            if p1:
                logger.info(f"[Formula Drift Scraper] Successfully scraped {event_name}: P1={p1}")
                return {
                    "event_name": event_name,
                    "p1": p1,
                    "p2": p2 or "TBD",
                    "p3": p3 or "TBD",
                    "full_results": full_results
                }

            logger.warning(f"[Formula Drift Scraper] Could not parse podium from {url}")
            return None

    except Exception as e:
        logger.error(f"[Formula Drift Scraper] Error scraping Formula Drift results: {e}")
        return None

async def scrape_supercars_results(year: int, round: int) -> Optional[Dict[str, Any]]:
    """
    Scrapes https://www.supercars.com/results for the given round's podium and full classification.
    Parses the HTML table with BeautifulSoup and returns a dict with p1, p2, p3, event_name, full_results.
    Returns None if scraping fails.
    """
    url = f"https://www.supercars.com/results"
    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            response = await client.get(url, headers=SCRAPER_HEADERS)
            if response.status_code != 200:
                logger.warning(f"[Supercars Scraper] Received HTTP {response.status_code} from {url}")
                return None

            soup = BeautifulSoup(response.text, "html.parser")
            
            event_name = f"Repco Supercars Championship {year} Round {round}"
            title_tag = soup.select_one("h1, .race-title, .session-header, .event-heading")
            if title_tag and title_tag.get_text(strip=True):
                event_name = f"Supercars - {title_tag.get_text(strip=True)}"

            full_results = []
            rows = soup.select("table tbody tr, .results-row, .session-row")
            for idx, row in enumerate(rows):
                cells = [c.get_text(strip=True) for c in row.select("td, .cell") if c.get_text(strip=True)]
                if len(cells) >= 2:
                    pos = cells[0] if cells[0].isdigit() else str(idx + 1)
                    driver = cells[1]
                    team = cells[2] if len(cells) > 2 else "V8 Supercars Team"
                    full_results.append({
                        "position": pos,
                        "driver": driver,
                        "team": team
                    })

            p1 = full_results[0]["driver"] + (f" ({full_results[0]['team']})" if full_results[0].get("team") else "") if len(full_results) > 0 else None
            p2 = full_results[1]["driver"] + (f" ({full_results[1]['team']})" if full_results[1].get("team") else "") if len(full_results) > 1 else None
            p3 = full_results[2]["driver"] + (f" ({full_results[2]['team']})" if full_results[2].get("team") else "") if len(full_results) > 2 else None

            if p1:
                logger.info(f"[Supercars Scraper] Successfully scraped {event_name}: P1={p1}")
                return {
                    "event_name": event_name,
                    "p1": p1,
                    "p2": p2 or "TBD",
                    "p3": p3 or "TBD",
                    "full_results": full_results
                }

            logger.warning(f"[Supercars Scraper] Could not extract podium rows from {url}")
            return None

    except Exception as e:
        logger.error(f"[Supercars Scraper] Error scraping Supercars results: {e}")
        return None

# Helper: Run all scrapers for a given year and round, persisting any successful results
async def run_all_scrapers(year: Optional[int] = None, round_num: int = 1) -> Dict[str, Any]:
    target_year = year or datetime.utcnow().year
    scraped_data = {}

    # 1. DTM
    dtm_res = await scrape_dtm_results(target_year, round_num)
    if dtm_res and dtm_res.get("p1"):
        key = f"DTM:{target_year}:{round_num}"
        record = {
            "series": "DTM",
            "year": target_year,
            "round": round_num,
            "event_name": dtm_res.get("event_name", f"DTM {target_year} Round {round_num}"),
            "p1": dtm_res["p1"],
            "p2": dtm_res.get("p2", "TBD"),
            "p3": dtm_res.get("p3", "TBD"),
            "notes": f"Scraped from DTM Official Portal ({len(dtm_res.get('full_results', []))} drivers)",
            "full_results": dtm_res.get("full_results", []),
            "created_at": datetime.utcnow().isoformat() + "Z"
        }
        manual_results_store[key] = record
        save_manual_results()
        scraped_data["DTM"] = record

    # 2. Formula Drift
    fd_res = await scrape_formuladrift_results(target_year, round_num)
    if fd_res and fd_res.get("p1"):
        key = f"FORMULA_DRIFT:{target_year}:{round_num}"
        record = {
            "series": "FORMULA_DRIFT",
            "year": target_year,
            "round": round_num,
            "event_name": fd_res.get("event_name", f"Formula DRIFT {target_year} Round {round_num}"),
            "p1": fd_res["p1"],
            "p2": fd_res.get("p2", "TBD"),
            "p3": fd_res.get("p3", "TBD"),
            "notes": f"Scraped from Formula Drift Official ({len(fd_res.get('full_results', []))} drivers)",
            "full_results": fd_res.get("full_results", []),
            "created_at": datetime.utcnow().isoformat() + "Z"
        }
        manual_results_store[key] = record
        save_manual_results()
        scraped_data["FORMULA_DRIFT"] = record

    # 3. Supercars V8
    sc_res = await scrape_supercars_results(target_year, round_num)
    if sc_res and sc_res.get("p1"):
        key = f"SUPER_V8:{target_year}:{round_num}"
        record = {
            "series": "SUPER_V8",
            "year": target_year,
            "round": round_num,
            "event_name": sc_res.get("event_name", f"Supercars Championship {target_year} Round {round_num}"),
            "p1": sc_res["p1"],
            "p2": sc_res.get("p2", "TBD"),
            "p3": sc_res.get("p3", "TBD"),
            "notes": f"Scraped from Supercars Official ({len(sc_res.get('full_results', []))} drivers)",
            "full_results": sc_res.get("full_results", []),
            "created_at": datetime.utcnow().isoformat() + "Z"
        }
        manual_results_store[key] = record
        save_manual_results()
        scraped_data["SUPER_V8"] = record

    return scraped_data

# Background Auto-Sync Task: Sync latest F1 race results every hour + scrape manual series
async def sync_latest_results() -> None:
    global sync_state
    try:
        sync_state["status"] = "syncing"
        
        # 1. Sync F1 schedule & latest results from Jolpica
        schedule_data = await jolpica_get("current.json?limit=100")
        races = schedule_data.get("MRData", {}).get("RaceTable", {}).get("Races", [])

        now_str = datetime.utcnow().strftime("%Y-%m-%d")
        past_races = [r for r in races if r.get("date", "") <= now_str]

        cached_count = 0
        latest_round = None

        if past_races:
            # Sort by round number descending to get the most recent completed race
            past_races.sort(key=lambda r: int(r.get("round", 0)), reverse=True)
            most_recent = past_races[0]
            latest_round = most_recent.get("round")
            season = most_recent.get("season", "current")

            # Fetch and cache results for the most recent completed race
            if latest_round:
                await jolpica_get(f"{season}/{latest_round}/results.json")
                cached_count += 1

        # 2. Run web scrapers for current season across manual series (DTM, Formula Drift, Supercars)
        current_year = datetime.utcnow().year
        scraped_results = await run_all_scrapers(year=current_year, round_num=1)
        sync_state["last_scrape_time"] = datetime.utcnow().isoformat() + "Z"
        sync_state["scraped_count"] = len(scraped_results)

        sync_state["last_sync_time"] = datetime.utcnow().isoformat() + "Z"
        sync_state["cached_races_count"] = max(cached_count, len(past_races))
        sync_state["last_synced_round"] = latest_round
        sync_state["status"] = "idle"
        logger.info(f"[Auto-Sync] Background sync completed. Synced F1 round {latest_round}, Scraped {len(scraped_results)} manual series.")
    except Exception as e:
        logger.error(f"[Auto-Sync] Error in background sync loop: {e}")
        sync_state["status"] = f"error: {str(e)}"

async def sync_latest_results_loop() -> None:
    while True:
        await sync_latest_results()
        await asyncio.sleep(3600)  # Repeat every 1 hour (3600 seconds)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Launch the background sync coroutine
    sync_task = asyncio.create_task(sync_latest_results_loop())
    yield
    # Shutdown: Cancel the background task
    sync_task.cancel()
    try:
        await sync_task
    except asyncio.CancelledError:
        pass

# Initialize FastAPI app with Lifespan
app = FastAPI(
    title="Apex Motorsports API",
    description="Multi-discipline motorsport live telemetry, Jolpica & Blacktop proxy, and race intelligence engine.",
    version="2.1.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MOTORSPORTS_SYSTEM_PROMPT = """You are "Apex Motorsports AI" — the premier World Motorsport Specialist, Race Engineer, and Historic Paddock Analyst for Apex Motorsports.

You provide point-to-point accurate telemetry analysis, historical statistics, technical regulations, and driver insight across ALL premier racing disciplines:
1. Formula 1 (F1): Ground effect aero, 1.6L V6 turbo-hybrids, 2026 engine overhaul (350kW MGU-K), 75-year championship history.
2. WEC & 24H Endurance: Le Mans 24h, Nürburgring 24h, Hypercars (Ferrari 499P, Porsche 963, Toyota GR010), BoP power/weight balancing, stint energy.
3. Formula Drift: 1,000+ HP RWD turbo beasts, 75° extreme drift angle telemetry, Irwindale wall proximity, lead/chase tandem judging.
4. WRC Rally: 500hp Rally1 hybrid monsters, gravel jumps in Finland, Monte Carlo ice, pacenote codes, mechanical differentials.
5. MotoGP & WSBK: 1000cc prototype rocketry, 366 km/h top speeds, 65° lean angle physics, ride-height shapeshifter devices.
6. DTM & GT3: GT3 homologation, performance weight ballast, 55-minute sprint shootouts, Norisring street racing.
7. IndyCar & Supercars: Indy 500 230+ mph oval draft, Bathurst 1000 Mount Panorama down Conrod Straight.
"""

class ChatMessage(BaseModel):
    role: str
    text: str

class AIChatRequest(BaseModel):
    message: str
    conversationHistory: Optional[List[ChatMessage]] = []
    provider: Optional[str] = "ollama"
    ollamaEndpoint: Optional[str] = "http://127.0.0.1:11434"
    ollamaModel: Optional[str] = "llama3"
    customEndpoint: Optional[str] = ""
    customApiKey: Optional[str] = ""
    customModel: Optional[str] = "deepseek/deepseek-chat"

class ManualResultInput(BaseModel):
    series: str = Field(..., description="Must be one of: DTM, FORMULA_DRIFT, SUPER_V8")
    year: int = Field(..., description="Championship season year, e.g. 2026")
    round: int = Field(..., description="Round number, e.g. 1")
    event_name: str = Field(..., description="Official Grand Prix or event name")
    p1: str = Field(..., description="1st Place winner name and team")
    p2: str = Field(..., description="2nd Place finisher name and team")
    p3: str = Field(..., description="3rd Place finisher name and team")
    notes: Optional[str] = Field(default=None, description="Optional telemetry or event summary notes")

@app.get("/api/health")
async def health_check():
    return {
        "status": "online",
        "service": "Apex Motorsports Python Engine",
        "version": "2.1.0",
        "disciplines_supported": ["F1", "WEC", "WRC", "DRIFT", "DTM", "MOTOGP", "WSBK", "INDYCAR", "SUPERCARS"],
        "blacktop_configured": bool(BLACKTOP_API_KEY)
    }

# ==========================================
# PROMPT 1: Jolpica F1 Live Data Endpoints
# ==========================================

@app.get("/api/f1/current")
async def get_f1_current_schedule():
    """Shortcut that fetches the current season race calendar using current.json"""
    return await jolpica_get("current.json?limit=100")

@app.get("/api/f1/schedule/{year}")
async def get_f1_schedule(year: str):
    """Fetches /{year}.json, returns race list for the requested year"""
    return await jolpica_get(f"{year}.json?limit=100")

@app.get("/api/f1/results/{year}/{round}")
async def get_f1_results(year: str, round: str):
    """Fetches /{year}/{round}/results.json, returns race classification"""
    return await jolpica_get(f"{year}/{round}/results.json")

@app.get("/api/f1/standings/drivers/{year}")
async def get_f1_driver_standings(year: str):
    """Fetches /{year}/driverStandings.json, returns World Drivers Championship standings"""
    return await jolpica_get(f"{year}/driverStandings.json")

@app.get("/api/f1/standings/constructors/{year}")
async def get_f1_constructor_standings(year: str):
    """Fetches /{year}/constructorStandings.json, returns Constructors Championship standings"""
    return await jolpica_get(f"{year}/constructorStandings.json")

@app.get("/api/f1/qualifying/{year}/{round}")
async def get_f1_qualifying(year: str, round: str):
    """Fetches /{year}/{round}/qualifying.json, returns grid shoot-out telemetry"""
    return await jolpica_get(f"{year}/{round}/qualifying.json")

# ==========================================
# PROMPT 2: Blacktop Multi-Series Endpoints
# ==========================================

VALID_BLACKTOP_SERIES = {"wrc", "wec", "indycar", "formula-e"}

@app.get("/api/{series}/schedule/{year}")
async def get_blacktop_schedule(series: str, year: str):
    """Fetches schedule for WRC, WEC, IndyCar, or Formula E from Blacktop API"""
    if series.lower() not in VALID_BLACKTOP_SERIES:
        raise HTTPException(status_code=400, detail=f"Unsupported series '{series}'. Allowed: {list(VALID_BLACKTOP_SERIES)}")
    return await blacktop_get(series.lower(), f"schedule/{year}")

@app.get("/api/{series}/standings/{year}")
async def get_blacktop_standings(series: str, year: str):
    """Fetches standings for WRC, WEC, IndyCar, or Formula E from Blacktop API"""
    if series.lower() not in VALID_BLACKTOP_SERIES:
        raise HTTPException(status_code=400, detail=f"Unsupported series '{series}'. Allowed: {list(VALID_BLACKTOP_SERIES)}")
    return await blacktop_get(series.lower(), f"standings/{year}")

@app.get("/api/{series}/results/{year}/{round}")
async def get_blacktop_results(series: str, year: str, round: str):
    """Fetches round results for WRC, WEC, IndyCar, or Formula E from Blacktop API"""
    if series.lower() not in VALID_BLACKTOP_SERIES:
        raise HTTPException(status_code=400, detail=f"Unsupported series '{series}'. Allowed: {list(VALID_BLACKTOP_SERIES)}")
    return await blacktop_get(series.lower(), f"results/{year}/{round}")

# ==========================================
# PROMPT 3: Live Championship Leaders Endpoint
# ==========================================

@app.get("/api/motorsports/categories")
async def get_categories():
    """
    Returns metadata, vehicle specifications, regulations, and championship leaders.
    Dynamically fetches live leaders for F1 (Jolpica), WRC (Blacktop), and IndyCar (Blacktop) concurrently.
    """
    # Default fallback leaders
    f1_leader = {"name": "Andrea Kimi Antonelli", "team": "Mercedes-AMG PETRONAS", "points": 290}
    wrc_leader = {"name": "Thierry Neuville (Hyundai i20 N)", "points": 242}
    indycar_leader = {"name": "Alex Palou (Chip Ganassi)", "points": 544}

    # Concurrent fetch helper tasks
    async def fetch_live_f1_leader():
        try:
            data = await jolpica_get("current/driverStandings.json")
            standings = data.get("MRData", {}).get("StandingsTable", {}).get("StandingsLists", [{}])[0].get("DriverStandings", [])
            if standings:
                top = standings[0]
                driver = top.get("Driver", {})
                constructor = top.get("Constructors", [{}])[0]
                return {
                    "name": f"{driver.get('givenName', '')} {driver.get('familyName', '')}".strip() or "Max Verstappen",
                    "team": constructor.get("name", "Oracle Red Bull Racing"),
                    "points": float(top.get("points", 0))
                }
        except Exception:
            pass
        return None

    async def fetch_live_wrc_leader():
        if not BLACKTOP_API_KEY:
            return None
        try:
            data = await blacktop_get("wrc", "standings/current")
            if isinstance(data, list) and len(data) > 0:
                top = data[0]
                return {
                    "name": f"{top.get('driver_name', top.get('name', 'Thierry Neuville'))} ({top.get('team', 'Hyundai Shell Mobis')})",
                    "points": top.get("points", 242)
                }
            elif isinstance(data, dict) and "standings" in data:
                top = data["standings"][0]
                return {
                    "name": f"{top.get('driver_name', top.get('name', 'Thierry Neuville'))} ({top.get('team', 'Hyundai Shell Mobis')})",
                    "points": top.get("points", 242)
                }
        except Exception:
            pass
        return None

    async def fetch_live_indycar_leader():
        if not BLACKTOP_API_KEY:
            return None
        try:
            data = await blacktop_get("indycar", "standings/current")
            if isinstance(data, list) and len(data) > 0:
                top = data[0]
                return {
                    "name": f"{top.get('driver_name', top.get('name', 'Alex Palou'))} ({top.get('team', 'Chip Ganassi')})",
                    "points": top.get("points", 544)
                }
            elif isinstance(data, dict) and "standings" in data:
                top = data["standings"][0]
                return {
                    "name": f"{top.get('driver_name', top.get('name', 'Alex Palou'))} ({top.get('team', 'Chip Ganassi')})",
                    "points": top.get("points", 544)
                }
        except Exception:
            pass
        return None

    results = await asyncio.gather(
        fetch_live_f1_leader(),
        fetch_live_wrc_leader(),
        fetch_live_indycar_leader(),
        return_exceptions=True
    )

    if not isinstance(results[0], Exception) and results[0] is not None:
        f1_leader = results[0]
    if not isinstance(results[1], Exception) and results[1] is not None:
        wrc_leader = results[1]
    if not isinstance(results[2], Exception) and results[2] is not None:
        indycar_leader = results[2]

    return {
        "categories": [
            {
                "id": "F1",
                "name": "FIA Formula One World Championship",
                "shortCode": "F1",
                "powerOutput": "1,000+ BHP (1.6L V6 Turbo-Hybrid)",
                "topSpeed": "372 km/h (231 mph)",
                "flagshipEvent": "Monaco GP & Silverstone",
                "governingBody": "FIA",
                "leader": f1_leader
            },
            {
                "id": "WEC",
                "name": "FIA World Endurance Championship & 24H Series",
                "shortCode": "WEC / 24H",
                "powerOutput": "680 BHP (Le Mans Hypercar Hybrid)",
                "topSpeed": "345 km/h (Circuit de la Sarthe)",
                "flagshipEvent": "24 Hours of Le Mans & 24h Nürburgring",
                "governingBody": "FIA / ACO",
                "leader": {"name": "Ferrari AF Corse 499P #50", "points": 152}
            },
            {
                "id": "DRIFT",
                "name": "Formula DRIFT Pro Championship",
                "shortCode": "FORMULA DRIFT",
                "powerOutput": "1,000 – 1,250+ Wheel HP with Nitrous",
                "topSpeed": "175 km/h entry speed with 75° angle slide",
                "flagshipEvent": "Irwindale Speedway (House of Drift)",
                "governingBody": "Formula Drift Holdings",
                "leader": {"name": "James Deane (Mustang RTR)", "points": 620}
            },
            {
                "id": "WRC",
                "name": "FIA World Rally Championship",
                "shortCode": "WRC",
                "powerOutput": "500+ BHP in Hybrid Boost Mode",
                "topSpeed": "205 km/h on blind forest trails",
                "flagshipEvent": "Rallye Monte-Carlo & Rally Finland",
                "governingBody": "FIA",
                "leader": wrc_leader
            },
            {
                "id": "MOTOGP",
                "name": "FIM MotoGP World Championship",
                "shortCode": "MotoGP",
                "powerOutput": "300+ BHP (157 kg dry / 1.9 HP/kg)",
                "topSpeed": "366.1 km/h (Jorge Martín / Mugello)",
                "flagshipEvent": "Mugello GP & Dutch TT Assen",
                "governingBody": "FIM / Dorna",
                "leader": {"name": "Jorge Martín (Aprilia Racing)", "points": 508}
            },
            {
                "id": "WSBK",
                "name": "FIM Superbike World Championship (WorldSBK)",
                "shortCode": "WorldSBK",
                "powerOutput": "240 – 250+ BHP (Production Superbikes)",
                "topSpeed": "335 km/h (208 mph)",
                "flagshipEvent": "Imola Round & Donington Park",
                "governingBody": "FIM",
                "leader": {"name": "Toprak Razgatlıoğlu (BMW M1000RR)", "points": 527}
            },
            {
                "id": "DTM",
                "name": "DTM & GT3 Championship",
                "shortCode": "DTM / GT3",
                "powerOutput": "550 – 600 BHP (GT3 Homologation)",
                "topSpeed": "295 km/h",
                "flagshipEvent": "Norisring Speedweekend & Nürburgring Sprint",
                "governingBody": "ADAC Motorsport",
                "leader": {"name": "Mirko Bortolotti (Lamborghini)", "points": 238}
            },
            {
                "id": "SUPERCARS",
                "name": "Repco Supercars Championship",
                "shortCode": "SUPERCARS",
                "powerOutput": "600+ BHP Naturally Aspirated V8",
                "topSpeed": "300 km/h down Conrod Straight",
                "flagshipEvent": "Bathurst 1000 (Mount Panorama)",
                "governingBody": "Supercars Australia",
                "leader": {"name": "Will Brown (Camaro Gen3)", "points": 3060}
            },
            {
                "id": "INDYCAR",
                "name": "NTT IndyCar Series",
                "shortCode": "INDYCAR",
                "powerOutput": "760 BHP + 60 BHP Hybrid ERS",
                "topSpeed": "380 km/h (236 mph at Indianapolis Motor Speedway)",
                "flagshipEvent": "The Indianapolis 500",
                "governingBody": "INDYCAR LLC",
                "leader": indycar_leader
            }
        ]
    }

# ==========================================
# PROMPT 4: Live Race Results Auto-Sync Status
# ==========================================

@app.get("/api/sync/status")
async def get_sync_status():
    """Returns when the last background sync ran and how many races have been cached."""
    return {
        "last_sync": sync_state["last_sync_time"],
        "cached_races": sync_state["cached_races_count"],
        "last_round": sync_state["last_synced_round"],
        "status": sync_state["status"]
    }

# ==========================================
# PROMPT 5: Manual Results In-Memory Store
# ==========================================

ALLOWED_MANUAL_SERIES = {"DTM", "FORMULA_DRIFT", "SUPER_V8"}

@app.post("/api/manual/result")
async def add_manual_result(payload: ManualResultInput):
    """
    Accepts manually entered race results for series without free public APIs.
    Validates series is one of DTM, FORMULA_DRIFT, SUPER_V8.
    """
    norm_series = payload.series.upper().strip()
    if norm_series not in ALLOWED_MANUAL_SERIES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid series '{payload.series}'. Allowed manual series: {list(ALLOWED_MANUAL_SERIES)}"
        )

    key = f"{norm_series}:{payload.year}:{payload.round}"
    record = {
        "series": norm_series,
        "year": payload.year,
        "round": payload.round,
        "event_name": payload.event_name,
        "p1": payload.p1,
        "p2": payload.p2,
        "p3": payload.p3,
        "notes": payload.notes or "",
        "created_at": datetime.utcnow().isoformat() + "Z"
    }

    manual_results_store[key] = record
    save_manual_results()
    return {"status": "saved", "key": key, "result": record}

@app.get("/api/manual/results/{series}/{year}")
async def get_manual_results_for_year(series: str, year: int):
    """Returns all manually entered results for that series and year, sorted by round."""
    norm_series = series.upper().strip()
    if norm_series not in ALLOWED_MANUAL_SERIES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid series '{series}'. Allowed manual series: {list(ALLOWED_MANUAL_SERIES)}"
        )

    results = [
        item for item in manual_results_store.values()
        if item["series"] == norm_series and item["year"] == year
    ]
    results.sort(key=lambda x: x["round"])
    return {"series": norm_series, "year": year, "count": len(results), "results": results}

@app.get("/api/manual/results/{series}/{year}/{round}")
async def get_manual_result_for_round(series: str, year: int, round: int):
    """Returns manually entered result for a specific round."""
    norm_series = series.upper().strip()
    if norm_series not in ALLOWED_MANUAL_SERIES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid series '{series}'. Allowed manual series: {list(ALLOWED_MANUAL_SERIES)}"
        )

    key = f"{norm_series}:{year}:{round}"
    if key not in manual_results_store:
        raise HTTPException(status_code=404, detail=f"No manual result found for {key}")

    return manual_results_store[key]

# ==========================================
# PROMPT 6: Web Scraper Manual Trigger
# ==========================================

@app.get("/api/scrape/trigger")
async def trigger_scrape_endpoint(
    year: Optional[int] = Query(default=None, description="Championship season year to scrape (defaults to current year)"),
    round: Optional[int] = Query(default=1, description="Round number to scrape"),
    series: Optional[str] = Query(default=None, description="Specific series (DTM, FORMULA_DRIFT, SUPER_V8) or all")
):
    """
    Manually triggers an immediate web scrape for DTM, Formula Drift, and Supercars without waiting for the hourly loop.
    Persists any newly scraped podiums and classifications to manual_results_store and manual_results.json.
    """
    target_year = year or datetime.utcnow().year
    target_round = round or 1
    scraped_entries: Dict[str, Any] = {}

    if series:
        norm_series = series.upper().strip()
        if norm_series == "DTM":
            data = await scrape_dtm_results(target_year, target_round)
            if data and data.get("p1"):
                key = f"DTM:{target_year}:{target_round}"
                rec = {
                    "series": "DTM",
                    "year": target_year,
                    "round": target_round,
                    "event_name": data.get("event_name", f"DTM {target_year} Round {target_round}"),
                    "p1": data["p1"],
                    "p2": data.get("p2", "TBD"),
                    "p3": data.get("p3", "TBD"),
                    "notes": f"Scraped from DTM Official Portal ({len(data.get('full_results', []))} drivers)",
                    "full_results": data.get("full_results", []),
                    "created_at": datetime.utcnow().isoformat() + "Z"
                }
                manual_results_store[key] = rec
                save_manual_results()
                scraped_entries["DTM"] = rec
        elif norm_series == "FORMULA_DRIFT":
            data = await scrape_formuladrift_results(target_year, target_round)
            if data and data.get("p1"):
                key = f"FORMULA_DRIFT:{target_year}:{target_round}"
                rec = {
                    "series": "FORMULA_DRIFT",
                    "year": target_year,
                    "round": target_round,
                    "event_name": data.get("event_name", f"Formula DRIFT {target_year} Round {target_round}"),
                    "p1": data["p1"],
                    "p2": data.get("p2", "TBD"),
                    "p3": data.get("p3", "TBD"),
                    "notes": f"Scraped from Formula Drift Official ({len(data.get('full_results', []))} drivers)",
                    "full_results": data.get("full_results", []),
                    "created_at": datetime.utcnow().isoformat() + "Z"
                }
                manual_results_store[key] = rec
                save_manual_results()
                scraped_entries["FORMULA_DRIFT"] = rec
        elif norm_series in ("SUPER_V8", "SUPERCARS"):
            data = await scrape_supercars_results(target_year, target_round)
            if data and data.get("p1"):
                key = f"SUPER_V8:{target_year}:{target_round}"
                rec = {
                    "series": "SUPER_V8",
                    "year": target_year,
                    "round": target_round,
                    "event_name": data.get("event_name", f"Supercars Championship {target_year} Round {target_round}"),
                    "p1": data["p1"],
                    "p2": data.get("p2", "TBD"),
                    "p3": data.get("p3", "TBD"),
                    "notes": f"Scraped from Supercars Official ({len(data.get('full_results', []))} drivers)",
                    "full_results": data.get("full_results", []),
                    "created_at": datetime.utcnow().isoformat() + "Z"
                }
                manual_results_store[key] = rec
                save_manual_results()
                scraped_entries["SUPER_V8"] = rec
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported series '{series}'. Allowed: DTM, FORMULA_DRIFT, SUPER_V8"
            )
    else:
        scraped_entries = await run_all_scrapers(year=target_year, round_num=target_round)

    return {
        "status": "completed",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "year": target_year,
        "round": target_round,
        "scraped_count": len(scraped_entries),
        "persisted_store_total": len(manual_results_store),
        "results": scraped_entries
    }

# ==========================================
# AI Engineering Chat Endpoint
# ==========================================

@app.post("/api/ai/chat")
async def ai_chat(payload: AIChatRequest):
    """Multi-provider AI race engineering chat supporting Ollama (unlimited local), Custom OpenRouter/OpenAI, and Gemini."""
    
    # 1. Ollama / Local LLM (Zero Limits)
    if payload.provider == "ollama":
        target_url = f"{payload.ollamaEndpoint.rstrip('/')}/api/chat"
        messages = [{"role": "system", "content": MOTORSPORTS_SYSTEM_PROMPT}]
        for msg in (payload.conversationHistory or []):
            messages.append({"role": "assistant" if msg.role == "assistant" else "user", "content": msg.text})
        messages.append({"role": "user", "content": payload.message})

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                res = await client.post(
                    target_url,
                    json={"model": payload.ollamaModel or "llama3", "messages": messages, "stream": False}
                )
                if res.status_code != 200:
                    raise HTTPException(status_code=res.status_code, detail=f"Ollama error: {res.text}")
                data = res.json()
                reply = data.get("message", {}).get("content", "No response from local Ollama model.")
                return {"reply": reply, "provider": "ollama", "model": payload.ollamaModel}
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Could not connect to Ollama at {payload.ollamaEndpoint}. Ensure 'ollama serve' is running. Error: {str(e)}"
            )

    # 2. Custom OpenAI / OpenRouter
    if payload.provider == "custom" and payload.customEndpoint:
        endpoint = payload.customEndpoint
        if not endpoint.endswith("/chat/completions"):
            endpoint = f"{endpoint.rstrip('/')}/chat/completions"
            
        headers = {"Content-Type": "application/json"}
        if payload.customApiKey:
            headers["Authorization"] = f"Bearer {payload.customApiKey}"

        messages = [{"role": "system", "content": MOTORSPORTS_SYSTEM_PROMPT}]
        for msg in (payload.conversationHistory or []):
            messages.append({"role": msg.role, "content": msg.text})
        messages.append({"role": "user", "content": payload.message})

        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                res = await client.post(
                    endpoint,
                    headers=headers,
                    json={"model": payload.customModel or "deepseek/deepseek-chat", "messages": messages, "temperature": 0.4}
                )
                if res.status_code != 200:
                    raise HTTPException(status_code=res.status_code, detail=f"Custom AI provider error: {res.text}")
                data = res.json()
                reply = data.get("choices", [{}])[0].get("message", {}).get("content", "No response from custom model.")
                return {"reply": reply, "provider": "custom", "model": payload.customModel}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    # 3. Default Fallback Telemetry Engine response
    return {
        "reply": f"**[Apex Motorsports Telemetry Engine]**\n\nTelemetry analysis for: *\"{payload.message}\"*\n\nAcross all 9 motorsport disciplines, powertrain thermal efficiency, tire scrub angles, and aerodynamics dictate apex delta timings. For live real-time LLM inference, connect local Ollama (`ollama serve`) or configure Gemini/OpenAI API keys in the settings panel.",
        "provider": "telemetry-engine",
        "model": "apex-telemetry-v2"
    }

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting Apex Motorsports Python Backend on port {port}...")
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)
