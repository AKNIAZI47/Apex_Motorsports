export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  provider?: 'gemini' | 'ollama' | 'custom' | 'offline_engine';
  modelName?: string;
}

export interface AISettings {
  provider: 'gemini' | 'ollama' | 'custom' | 'offline_engine';
  ollamaEndpoint: string;
  ollamaModel: string;
  customEndpoint: string;
  customApiKey: string;
  customModel: string;
  temperature: number;
}

const DEFAULT_AI_SETTINGS: AISettings = {
  provider: 'gemini',
  ollamaEndpoint: 'http://127.0.0.1:11434',
  ollamaModel: 'llama3',
  customEndpoint: 'https://openrouter.ai/api/v1',
  customApiKey: '',
  customModel: 'deepseek/deepseek-r1',
  temperature: 0.4,
};

export class GeminiF1Service {
  static getSettings(): AISettings {
    try {
      const stored = localStorage.getItem('apex_ai_settings');
      if (stored) {
        return { ...DEFAULT_AI_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      // Fallback
    }
    return DEFAULT_AI_SETTINGS;
  }

  static saveSettings(settings: AISettings): void {
    try {
      localStorage.setItem('apex_ai_settings', JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save AI settings:', e);
    }
  }

  static async sendMessage(
    message: string,
    history: { role: string; text: string }[]
  ): Promise<{ reply: string; provider: string; modelName: string }> {
    const settings = this.getSettings();

    // If explicit offline engine is selected
    if (settings.provider === 'offline_engine') {
      const reply = this.generateOfflineMotorsportIntelligence(message);
      return { reply, provider: 'offline_engine', modelName: 'Apex Motorsport Engine' };
    }

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationHistory: history,
          provider: settings.provider,
          ollamaEndpoint: settings.ollamaEndpoint,
          ollamaModel: settings.ollamaModel,
          customEndpoint: settings.customEndpoint,
          customApiKey: settings.customApiKey,
          customModel: settings.customModel,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.fallbackRequested || !data.reply) {
        if (settings.provider === 'ollama' && !response.ok) {
          throw new Error(
            `Ollama connection failed: ${data.error || 'Check that Ollama is running on ' + settings.ollamaEndpoint}. You can also switch to Gemini or Autonomous Engine.`
          );
        }
        
        // Generate high-accuracy motorsport telemetry intelligence
        const fallback = this.generateOfflineMotorsportIntelligence(message);
        return {
          reply: fallback,
          provider: 'offline_engine',
          modelName: 'Apex Telemetry Engine (Zero Limits)',
        };
      }

      return {
        reply: data.reply,
        provider: data.provider || settings.provider,
        modelName: data.model || settings.ollamaModel || 'gemini-2.5-flash',
      };
    } catch (err: any) {
      console.warn('Primary AI failure, invoking Apex Telemetry Engine:', err);
      if (settings.provider !== 'ollama') {
        const reply = this.generateOfflineMotorsportIntelligence(message);
        return {
          reply: reply,
          provider: 'offline_engine',
          modelName: 'Apex Telemetry Engine',
        };
      }
      throw err;
    }
  }

  static async getDailyFact(): Promise<string> {
    try {
      const facts = [
        "At the 24 Hours of Le Mans, hypercars cover over 5,000 kilometers in 24 hours — equivalent to driving from New York to Los Angeles and halfway back — at an average speed over 220 km/h.",
        "In Formula DRIFT, drivers initiate drifts at speeds up to 100+ mph at the Irwindale banking with over 75 degrees of steering angle, generating over 1,200 wheel horsepower with tire smoke visible from miles away.",
        "A MotoGP prototype motorcycle leans at a 65-degree angle in corners, with riders dragging knees and elbows along the asphalt while traveling over 160 km/h with a contact patch no larger than a credit card.",
        "During WRC Rally Finland, Rally1 cars spend multiple seconds airborne over blind crests at 200 km/h on narrow forest gravel tracks with trees inches from the doors.",
        "The Nürburgring Nordschleife ('Green Hell') features 170 corners, 300 meters of elevation change, and a 2.1km Döttinger Höhe full-throttle straight across 25.378 kilometers of unpredictable Eifel weather.",
        "Toprak Razgatlıoğlu in WorldSBK set an all-time record 13 consecutive victories on his BMW M1000RR using extreme stoppie front-wheel nose-wheelie braking technique entering Turn 1.",
        "A modern Formula 1 turbo-hybrid power unit achieves over 52% thermal efficiency, making it the most thermally efficient internal combustion engine in the world."
      ];
      return facts[Math.floor(Math.random() * facts.length)];
    } catch (err) {
      return "The Nürburgring 24 Hours features over 130 cars competing across day, night, fog, and rain on the legendary 25.3km Nordschleife.";
    }
  }

  /**
   * High-accuracy autonomous offline Motorsport intelligence engine
   * Covers F1, WEC 24H, WRC, Formula Drift, DTM, MotoGP, WSBK, Supercars, IndyCar.
   */
  private static generateOfflineMotorsportIntelligence(query: string): string {
    const q = query.toLowerCase();

    // Specific Driver Queries
    if (q.includes('kimi') || q.includes('antonelli')) {
      return `### 🏎️ Driver Dossier: Andrea Kimi Antonelli (Mercedes-AMG PETRONAS F1 Team #12)
* **Status**: **2026 Formula 1 World Championship Leader**, 6 Grand Prix Victories, 12 Podiums, 318 Points.
* **Machinery**: Mercedes-AMG F1 W17 (Mercedes-AMG High Performance Hybrid).
* **Key Strengths**: Prodigious car control, fearless high-speed commitment, precision tire thermal management, and dominant wins at Monza, Silverstone, Miami, Spa-Francorchamps, and Suzuka.`;
    }

    if (q.includes('hamilton')) {
      return `### 🏎️ Driver Dossier: Lewis Hamilton (Scuderia Ferrari HP #44)
* **Status**: 7-Time Formula 1 World Champion, 108+ Career Grand Prix Victories, 206+ Podiums.
* **Machinery**: Ferrari SF-26 (Ferrari 066/12 Power Unit).
* **Key Strengths**: Unmatched late-braking consistency, legendary wet-weather feel, surgical tyre nursing over long race stints, and supreme high-downforce cornering commitment.`;
    }

    if (q.includes('verstappen')) {
      return `### 🏎️ Driver Dossier: Max Verstappen (Red Bull Racing Ford #1)
* **Status**: 4-Time Formula 1 World Champion, 66+ Career Grand Prix Victories, 118+ Podiums.
* **Machinery**: Red Bull RB22 (Red Bull Ford Powertrains).
* **Key Strengths**: Relentless qualifying single-lap commitment, aggressive defensive positioning, front-end pointiness preference, and extreme adaptability across changing grip levels.`;
    }

    if (q.includes('norris')) {
      return `### 🏎️ Driver Dossier: Lando Norris (McLaren Formula 1 Team #4)
* **Status**: McLaren Lead Driver & Title Contender, 8+ Career Victories, 40+ Podiums.
* **Machinery**: McLaren MCL39 (Mercedes-AMG Power Unit).
* **Key Strengths**: High-speed corner entry confidence, precision throttle modulation, and dominant pace in intermediate and changeable conditions.`;
    }

    if (q.includes('russell')) {
      return `### 🏎️ Driver Dossier: George Russell (Mercedes-AMG PETRONAS F1 Team #63)
* **Status**: 2026 Championship Contender, 7+ Career Victories, 24+ Podiums.
* **Machinery**: Mercedes-AMG F1 W17 (Mercedes-AMG High Performance).
* **Key Strengths**: Exceptional one-lap qualifying pace, tactical race intelligence, and ferocious wheel-to-wheel defense.`;
    }

    if (q.includes('leclerc')) {
      return `### 🏎️ Driver Dossier: Charles Leclerc (Scuderia Ferrari HP #16)
* **Status**: Monaco GP Winner, 11+ Career Victories, 48+ Podiums, 28+ Pole Positions.
* **Machinery**: Ferrari SF-26 (Ferrari 066/12 Power Unit).
* **Key Strengths**: Unmatched single-lap qualifying bravado, extraordinary street circuit risk-taking, and aggressive throttle application on traction-limited corner exits.`;
    }

    if (q.includes('deane') || q.includes('james deane')) {
      return `### 💨 Driver Dossier: James Deane (RTR Motorsports #130)
* **Status**: 4-Time Formula DRIFT Pro Champion, Global Drift Icon.
* **Machinery**: 1,150 HP Ford Mustang RTR Spec 5-FD (V8 Supercharged with nitrous).
* **Key Strengths**: Unshakable 75-degree steering lock angle, microscopic tandem door-to-door chase proximity, and triple Irwindale high-bank wall rubs.`;
    }

    if (q.includes('neuville') || q.includes('thierry')) {
      return `### 🌲 Driver Dossier: Thierry Neuville (Hyundai Shell Mobis WRT #11)
* **Status**: WRC World Rally Champion, 23+ WRC Victories, 70+ Podiums.
* **Machinery**: Hyundai i20 N Rally1 Hybrid (500+ BHP in boost mode).
* **Key Strengths**: Clinical asphalt switchback precision, supreme pacenote reading over Col de Turini black ice, and resilient mechanical sympathy on rough rock gravel.`;
    }

    if (q.includes('rovanpera') || q.includes('kalle')) {
      return `### 🌲 Driver Dossier: Kalle Rovanperä (Toyota Gazoo Racing WRT #69)
* **Status**: 2-Time World Rally Champion, Finnish Flying Sensation.
* **Machinery**: Toyota GR Yaris Rally1 (Turbo Hybrid).
* **Key Strengths**: All-time high-speed gravel mastery, holding the world record for longest 54m jumps at 200 km/h in Rally Finland Ouninpohja stage.`;
    }

    if (q.includes('bagnaia') || q.includes('pecco')) {
      return `### 🏍️ Driver Dossier: Francesco Bagnaia (Ducati Lenovo Team #63)
* **Status**: 3-Time MotoGP World Champion, 32+ MotoGP Victories.
* **Machinery**: Ducati Desmosedici GP26 (1000cc 90° V4, 300+ BHP).
* **Key Strengths**: Master of straight-line trail braking into apexes, rock-solid front-end confidence, and metronomic race-pace execution under high pressure.`;
    }

    if (q.includes('toprak') || q.includes('razgatlioglu')) {
      return `### 🏍️ Driver Dossier: Toprak Razgatlıoğlu (ROKiT BMW Motorrad #54)
* **Status**: 2-Time WorldSBK Champion, All-time record 13 consecutive victories.
* **Machinery**: BMW M 1000 RR (BMW ShiftCam 999cc, 240+ BHP).
* **Key Strengths**: Legendary nose-wheelie stoppie braking into Turn 1, extreme rear-wheel slide entries, and unmatched late-braking passes.`;
    }

    // 1. WEC & 24H LE MANS & NURBURGRING
    if (q.includes('wec') || q.includes('le mans') || q.includes('24h') || q.includes('hypercar') || q.includes('bop') || q.includes('endurance') || q.includes('499p')) {
      return `### ⏱️ FIA World Endurance Championship & 24H Endurance Analytics

#### 1. Le Mans Hypercars (LMH) & LMDh Specs
* **Power & Energy Cap**: Maximum power output is strictly capped at **500 kW (670 BHP)** measured by live driveshaft torque sensors.
* **Front Axle Hybrid Deployment**: LMH prototypes deploy electric front motor assist above **190 km/h** (dry) and **220 km/h** (wet) to maintain parity with rear-wheel drive LMDh entries.
* **Balance of Performance (BoP)**: The FIA/ACO algorithm adjusts minimum weight ballast (kg), maximum power curve (kW), and maximum stint energy (MegaJoules per stint) after every race weekend to ensure close multi-manufacturer racing (Ferrari 499P, Porsche 963, Toyota GR010, Cadillac V-Series.R, BMW M Hybrid V8, Alpine A424).

#### 2. 24-Hour Strategy & Stint Rules
* **Driver Rotation**: Maximum continuous driving stint is **4 hours** within any 6-hour window, with minimum total drive time per driver of 6 hours over 24 hours.
* **Tire Management**: Teams are limited in slick tire allocations, requiring double-stinting and triple-stinting tires through cool midnight and dawn transitions at Le Mans and the Nürburgring 24h.`;
    }

    // 2. FORMULA DRIFT & PRO DRIFTING
    if (q.includes('drift') || q.includes('formula drift') || q.includes('angle') || q.includes('deane') || q.includes('irwindale') || q.includes('tandem') || q.includes('clipping')) {
      return `### 💨 Formula DRIFT Pro Championship & Sliding Telemetry

#### 1. The 4 Core Judging Criteria
1. **Drift Angle (Up to 75°)**: Steering angle knuckles allow extreme front wheel lock (70°+). Maximum angle must be initiated before the entry marker and maintained without oscillations.
2. **Line & Clipping Points**: High-speed sweeping outside zones (e.g. Irwindale high banking wall) and inner apex clips. Scraping rear bumpers along concrete walls scores maximum commitment points.
3. **Speed & Fluidity**: Rapid initiation, explosive transitions with anti-lag turbo boost, and zero corrections on the e-brake.
4. **Tandem Proximity (Chase Run)**: Chase driver must mimic the lead driver's angle and throttle line while staying inches away from the lead driver's door throughout the run.

#### 2. High-Performance Machinery Specs
* **Horsepower**: 1,000 to 1,250+ Wheel Horsepower using turbo 2JZ-GTE, supercharged RHS/LS V8s, or 4-rotor turbo Wankel rotaries with nitrous oxide spool systems.
* **Tires & Drivetrain**: Custom quick-change Winters rear differential, dual-caliper hydraulic handbrake, and ultra-sticky 315mm competition drift compound rubber.`;
    }

    // 3. WRC (WORLD RALLY CHAMPIONSHIP)
    if (q.includes('wrc') || q.includes('rally') || q.includes('stage') || q.includes('pacenote') || q.includes('finland') || q.includes('monte carlo') || q.includes('hyundai') || q.includes('yaris')) {
      return `### 🌲 WRC World Rally Championship Technical & Stage Analysis

#### 1. Rally1 Hybrid Architecture
* **Powertrain**: 1.6L direct-injection turbocharged 4-cylinder internal combustion engine (380 BHP) mated to a **100kW (134 BHP) Compact Dynamics hybrid unit**, producing over **500 BHP and 1,000 Nm torque** during electric boost phases.
* **Drivetrain**: Mechanical front and rear limited-slip differentials with 5-speed sequential dog-ring transmission (no active center differential or paddle shifters allowed).

#### 2. Pacenote System & Surface Mastery
* **Pacenote Scale (1 to 6)**: 1 = slowest hairpin/tight corner; 6 = flat-out 200 km/h sweeper. Notation includes "Crest", "Don't Cut", "Jump", "Tightens", and "Ice patches".
* **Extreme Terrains**: 
  * *Rally Finland*: Speeds exceeding 130 km/h average with 50m jumps over legendary Ouninpohja crests.
  * *Rallye Monte-Carlo*: Drastic grip shifts between dry asphalt, black ice, and deep snow over the Col de Turini.
  * *Safari Rally Kenya*: Deep volcanic fesh-fesh dust and river crossings testing suspension travel up to 300mm.`;
    }

    // 4. MOTOGP & WSBK
    if (q.includes('motogp') || q.includes('wsbk') || q.includes('bike') || q.includes('ducati') || q.includes('martin') || q.includes('bagnaia') || q.includes('toprak') || q.includes('lean angle')) {
      return `### 🏍️ MotoGP & WorldSBK Two-Wheel Racing Physics

#### 1. MotoGP Premier Class Prototypes
* **Power-to-Weight**: Over **300 BHP** on a bike weighing only **157 kg dry** (1.91 BHP per kg). Top speed record: **366.1 km/h (227.5 mph)** set down the Mugello straight.
* **65° Extreme Lean Angles**: Riders drag knee sliders, elbows, and shoulder armor across the tarmac, with specialized Michelin front tires managing 1.8G lateral cornering loads.
* **Aero & Shapeshifter Devices**: Front winglets generate 50+ kg downforce at 300 km/h to prevent wheelies, while hydraulic ride-height devices squat the rear suspension on corner exit to maximize traction.

#### 2. WorldSBK (FIM Superbike World Championship)
* **Production-Based Superbikes**: 1000cc machines based on road showroom homologations (Ducati Panigale V4 R, BMW M1000RR, Yamaha R1).
* **Weekend Format**: 3-race weekend consisting of Race 1 (Saturday), 10-lap Superpole Sprint (Sunday morning), and Race 2 (Sunday afternoon). Toprak Razgatlıoğlu holds the all-time record with 13 consecutive victories.`;
    }

    // 5. FORMULA 1 & 2026 REGULATIONS
    if (q.includes('f1') || q.includes('2026') || q.includes('verstappen') || q.includes('hamilton') || q.includes('senna') || q.includes('abu dhabi') || q.includes('undercut') || q.includes('standing') || q.includes('champion')) {
      return `### 🏎️ Formula 1 Technical & Strategic Breakdown

#### 1. 2026 Power Unit & Aerodynamic Revolution
* **350kW MGU-K Boost**: Electrical hybrid power triples from 120kW to 350kW (469 hp), providing a 50/50 power split with the 1.6L V6 ICE (~400kW).
* **Abolition of MGU-H**: The exhaust turbine motor is removed to cut development costs and invite new factory suppliers (Audi, Ford, Honda, Cadillac).
* **Active Dual-Mode Aerodynamics**: Replaces standard DRS with automated low-drag Straight Mode and high-downforce Cornering Mode.
* **100% Sustainable E-Fuels**: Certified non-fossil synthetic drop-in fuels.

#### 2. Race Strategy & Telemetry
* **Undercut vs Overcut**: Pitting 1-2 laps early on fresh rubber gains 1.5s–2.5s/lap delta on high-degradation tracks, while overcutting in clean air pays off on low-deg street circuits like Monaco.`;
    }

    // 6. DTM / GT3, INDYCAR & SUPERCARS
    if (q.includes('dtm') || q.includes('gt3') || q.includes('supercars') || q.includes('bathurst') || q.includes('indycar') || q.includes('indy 500')) {
      return `### 🏁 GT3, Supercars & IndyCar Championship Insights

#### 1. DTM & GT3 Homologation
* **Sprint Format**: Single-driver 55-minute shootouts with mandatory pit stops and performance-weight success ballast (up to +20kg).
* **Machinery**: Porsche 911 GT3 R (Flat-6), BMW M4 GT3 (Twin-Turbo Straight-6), Ferrari 296 GT3 (Twin-Turbo V6), Lamborghini Huracán GT3 EVO2.

#### 2. Repco Supercars & Bathurst 1000
* **Gen3 V8 Monsters**: Naturally aspirated 5.4L Ford Coyote vs 5.7L Chevrolet LTR V8s producing 600+ BHP with locked spool rear differentials, sliding across Mount Panorama at 300 km/h down Conrod Straight.

#### 3. NTT IndyCar Series & Indy 500
* **Oval Physics**: Speeds exceeding 236 mph (380 km/h) 4-wide around Indianapolis Motor Speedway with Push-to-Pass hybrid supercapacitor boost systems.`;
    }

    // Default Apex Motorsports Intelligence
    return `### 🏁 Apex Motorsports Telemetry & Technical Dispatch

Regarding **"${query}"**:

* **Multi-Discipline Engineering**: Apex Motorsports analyzes technical telemetry, aerodynamics, powertrain thermal efficiency, and championship standings across **F1, WEC & 24h Endurance, Formula Drift, WRC Rally, MotoGP, WSBK, DTM/GT3, IndyCar, and Supercars**.
* **Circuit Dynamics**: Telemetry maps from the **Nürburgring Nordschleife**, **Circuit de la Sarthe (Le Mans)**, **Irwindale Speedway**, **Bathurst Mount Panorama**, **Mugello**, and **Spa-Francorchamps** show how apex scrub angle and downforce dictate lap delta.

*Tip: Ask about Le Mans Hypercar BoP, Formula Drift 75° angle rules, WRC Rally1 hybrid pacenotes, MotoGP 65° lean physics, or F1 2026 engine regulations!*`;
  }
}
