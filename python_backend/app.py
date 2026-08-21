"""
Apex Motorsports - Python Web Backend (FastAPI / Uvicorn)
==========================================================
Provides real-time motorsport telemetry, multi-discipline paddock news,
Nürburgring circuit telemetry, and zero-limit AI race engineering intelligence
for F1, WEC 24H, WRC, Formula Drift, DTM, MotoGP, WSBK, and Supercars.
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import os
import json
import httpx
import asyncio

app = FastAPI(
    title="Apex Motorsports API",
    description="Multi-discipline motorsport telemetry, news, and race engineering intelligence engine.",
    version="2.0.0",
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
    provider: Optional[str] = "ollama"  # "ollama" | "custom" | "gemini"
    ollamaEndpoint: Optional[str] = "http://127.0.0.1:11434"
    ollamaModel: Optional[str] = "llama3"
    customEndpoint: Optional[str] = ""
    customApiKey: Optional[str] = ""
    customModel: Optional[str] = "deepseek/deepseek-chat"

@app.get("/api/health")
async def health_check():
    return {
        "status": "online",
        "service": "Apex Motorsports Python Engine",
        "version": "2.0.0",
        "disciplines_supported": ["F1", "WEC", "WRC", "DRIFT", "DTM", "MOTOGP", "WSBK", "INDYCAR", "SUPERCARS"]
    }

@app.get("/api/motorsports/categories")
async def get_categories():
    """Returns metadata, vehicle specifications, regulations, and championship leaders for all 9 motorsport disciplines."""
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
                "leader": {"name": "Max Verstappen", "team": "Red Bull Racing", "points": 437}
            },
            {
                "id": "WEC",
                "name": "FIA World Endurance Championship & 24H Series",
                "shortCode": "WEC / 24H",
                "powerOutput": "680 BHP (Le Mans Hypercar Hybrid)",
                "topSpeed": "345 km/h (Circuit de la Sarthe)",
                "flagshipEvent": "24 Hours of Le Mans & 24h Nürburgring",
                "governingBody": "FIA / ACO",
                "leader": {"name": "Ferrari AF Corse 499P", "points": 152}
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
                "leader": {"name": "Thierry Neuville (Hyundai i20 N)", "points": 242}
            },
            {
                "id": "MOTOGP",
                "name": "FIM MotoGP World Championship",
                "shortCode": "MotoGP",
                "powerOutput": "300+ BHP (157 kg dry / 1.9 HP/kg)",
                "topSpeed": "366.1 km/h (Jorge Martín / Mugello)",
                "flagshipEvent": "Mugello GP & Dutch TT Assen",
                "governingBody": "FIM / Dorna",
                "leader": {"name": "Jorge Martín (Ducati Pramac)", "points": 508}
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
                "leader": {"name": "Alex Palou (Chip Ganassi)", "points": 544}
            }
        ]
    }

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

    # 3. Default Fallback Simulation / Telemetry Engine response
    return {
        "reply": f"**[Apex Motorsports Telemetry Engine]**\n\nTelemetry analysis for: *\"{payload.message}\"*\n\nAcross all 9 motorsport disciplines, powertrain thermal efficiency, tire scrub angles, and aerodynamics dictate apex delta timings. For live real-time LLM inference, connect local Ollama (`ollama serve`) or configure Gemini/OpenAI API keys in the settings panel.",
        "provider": "telemetry-engine",
        "model": "apex-telemetry-v2"
    }

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting Apex Motorsports Python Backend on port {port}...")
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)
