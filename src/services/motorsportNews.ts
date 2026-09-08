import { NewsArticle, MotorsportCategory } from '../types';

interface WireTemplate {
  idPrefix: string;
  discipline: MotorsportCategory;
  category: string; // TECH, RACE, REPORT, STEWARDS, CONTRACTS
  source: string;
  url: string;
  titles: string[];
  summaries: string[];
  fullReports: string[];
}

const WIRE_TEMPLATES: WireTemplate[] = [
  // 1. FORMULA 1
  {
    idPrefix: 'f1-wire-monza',
    discipline: 'F1',
    category: 'RACE',
    source: 'AUTOSPORT WIRE',
    url: 'https://www.formula1.com/news',
    titles: [
      'Italian Grand Prix Monza Debrief: Andrea Kimi Antonelli Powers Mercedes to Magnificent Home Triumph at the Temple of Speed',
      'Monza Telemetry Analysis: How Antonelli Staged Flawless Tyre Management and 355 km/h Straight-Line Prowess',
      'Italian GP Stewards Summary: Provisional Classification Confirmed with Zero Penalties as Monza Crowds Hail Italian Prodigy',
    ],
    summaries: [
      '19-year-old Italian sensation Andrea Kimi Antonelli drove a masterclass in front of the home tifosi at Monza, claiming a stunning victory for the Mercedes-AMG PETRONAS F1 Team with surgical precision through Ascari and the Parabolica.',
      'Data telemetry confirms Antonelli managed tyre surface temperatures with supreme discipline, keeping degradation lower than Norris and Hamilton while maximizing straight-line deployment across Monza high-speed sectors.',
      'FIA race stewards confirmed the official classification with Andrea Kimi Antonelli recognized as winner of the Italian Grand Prix, marking one of the most celebrated home victories in modern motorsport history.',
    ],
    fullReports: [
      'MONZA, ITALY — The 2026 Italian Grand Prix concluded with an unforgettable triumph at the Temple of Speed. Starting from the front row, Andrea Kimi Antonelli delivered a peerless drive in his Mercedes-AMG F1 W17, executing a flawless pit strategy and holding off fierce late-race charges to claim the victory. The Monza grandstands erupted into pandemonium as the Bologna-born teenager crossed the line to take the chequered flag.',
      'Telemetry traces from Monza show Antonelli carried remarkable minimum corner speeds through the Variante del Rettifilo and Curva Grande. Mercedes-AMG low-downforce aero trim gave him the decisive straight-line defense against DRS overtakes down the main straight, with peak trap speeds registering at 355.2 km/h.',
      'Post-race FIA technical inspections confirmed all powertrain parameters and skid wear were fully compliant. Andrea Kimi Antonelli stepped onto the iconic Monza podium suspended over the pit straight to deafening cheers, etching his name into the annals of Italian motorsport royalty.',
    ],
  },
  {
    idPrefix: 'f1-wire-tech',
    discipline: 'F1',
    category: 'TECH',
    source: 'RACEFANS TECHNICAL',
    url: 'https://www.formula1.com/technical',
    titles: [
      'Technical Directive Update: FIA Tightens Front Wing Flex Guidelines Ahead of Baku & Madrid',
      '2026 Engine Bench Tests: 350kW MGU-K Power Curves Show Dramatic Instant Low-End Torque',
      'Telemetry Breakdown: Cooling Duct Geometries and Brake Disc Carbon Wear in Heavy Braking Zones',
    ],
    summaries: [
      'The FIA technical department has issued an updated monitoring directive targeting front wing aeroelastic deformation under sustained 280 km/h dynamic downforce loads.',
      'Manufacturer dyno tests reveal the upcoming 2026 powertrain architecture delivers seamless electrical torque vectoring, completely offsetting turbo lag without requiring the complex MGU-H assembly.',
      'Engineers explain why Monza and Baku place unmatched thermal loads on carbon-carbon brake rotors, with peak deceleration reaching 5.4G into Turn 1 from 350 km/h.',
    ],
    fullReports: [
      'FIA technical delegate Jo Bauer has introduced calibrated high-speed video tracking to inspect front wing endplate flexure. Teams will be required to run micro-targets on wing mainplanes during upcoming free practice sessions to verify compliance with structural rigidity limits.',
      'The transition to 50% electrical and 50% internal combustion power in 2026 represents the most significant propulsion overhaul in grand prix history. Advanced battery chemistries maintain consistent 350kW discharge without derating over full lap simulations.',
      'Thermal imaging of Brembo carbon-carbon brake packages showed friction face temperatures eclipsing 1,050°C during heavy braking at the end of the main straight, requiring specialized titanium caliper cooling ducts.',
    ],
  },

  // 2. MOTOGP
  {
    idPrefix: 'motogp-wire-1',
    discipline: 'MOTOGP',
    category: 'RACE',
    source: 'MOTOGP OFFICIAL WIRE',
    url: 'https://www.motogp.com/news',
    titles: [
      'MotoGP Misano World Circuit: Marc Márquez Clinches Pole with Blistering Sub-1:31 Lap',
      'Ducati Lenovo Factory Team: Desmosedici GP26 Aerodynamic Winglet Package Validated in Wind Tunnel',
      'MotoGP Telemetry: 65-Degree Lean Angles and Front Tyre Pressure Regulation Compliance',
    ],
    summaries: [
      'Eight-time champion Marc Márquez dominated Saturday qualifying at the Misano World Circuit Marco Simoncelli, utilizing trademark front-end feel to eclipse the all-time two-wheel lap record.',
      'Gigi Dall’Igna confirmed Ducati Corse has finalized its revised ground-effect fairing downwash ducts, maximizing stability under hard acceleration without penalizing top speed down the back straight.',
      'Riders and crew chiefs discuss the strict Michelin minimum front tire pressure thresholds (1.80 bar) and the technical balancing act required to prevent front tyre overheating in turbulent slipstreams.',
    ],
    fullReports: [
      'MISANO ADRIATICO — Qualifying at the San Marino Grand Prix delivered scintillating pace as Marc Márquez steered the factory Ducati to pole position with a 1:30.824 record lap. Francesco Bagnaia and Jorge Martín completed the front row, separated by a microscopic 0.088 seconds.',
      'The technical evolution of MotoGP aero continues to advance. Ground-effect fairings create localized low-pressure zones that suck the motorcycle to the asphalt at 60-degree lean angles, vastly expanding corner-entry confidence.',
      'Dorna race direction confirmed that Michelin real-time telemetry sensors verified 100% compliance across the grid for minimum running pressures during sprint and feature race distances.',
    ],
  },

  // 3. WSBK
  {
    idPrefix: 'wsbk-wire-1',
    discipline: 'WSBK',
    category: 'TECH',
    source: 'WORLDSBK PRESS',
    url: 'https://www.worldsbk.com/news',
    titles: [
      'WorldSBK Magny-Cours: Toprak Razgatlıoğlu Reasserts Authority with Superpole Record',
      'BMW Motorrad M1000RR Engine Tuning: Variable Camshaft ShiftCam Delivering Unmatched Mid-Range Drive',
      'Ducati Panigale V4 R Weight Ballast Calibration: FIM Rev-Limit Harmonization Technical Report',
    ],
    summaries: [
      'Toprak Razgatlıoğlu dismantled the Superbike field in France, executing mind-boggling stoppies and aggressive line-cutting transitions to secure his 14th consecutive front-row start.',
      'BMW engineers reveal how the high-revving ShiftCam powerplant integrates with Magneti Marelli electronics to stabilize tyre wear across 21-lap full distance features.',
      'FIM technical directors released the updated algorithm for engine balance rules, confirming rev limits remain untouched after equalized performance across inline-four and V4 machinery.',
    ],
    fullReports: [
      'CIRCUIT DE NEVERS MAGNY-COURS — BMW Motorrad continued its remarkable Superbike campaign as Toprak Razgatlıoğlu demonstrated total mastery of the French layout. The Turkish rider recorded a 1:35.122 benchmark that left Ducati title rival Nicolò Bulega searching for answers.',
      'WorldSBK electronics strategy has reached grand prix levels of sophistication. Traction control slip maps dynamically adapt corner-by-corner using six-axis inertial measurement units (IMU), providing smooth torque delivery even as Pirellis grip fades in high ambient heat.',
      'FIM technical regulations mandate strict production-based engine component tolerances, ensuring championship superbikes remain directly linked to road-going showroom flagships.',
    ],
  },

  // 4. WEC & 24H
  {
    idPrefix: 'wec-wire-1',
    discipline: 'WEC',
    category: 'ENDURANCE',
    source: 'FIA WEC DISPATCH',
    url: 'https://www.fiawec.com/news',
    titles: [
      '6 Hours of Fuji: Hypercar Balance of Performance Bulletin Released Ahead of Practice 1',
      'Ferrari 499P vs Porsche 963: Hybrid Energy Allocation and Virtual Energy Tank Dynamics',
      'WEC Night Stint Strategy: Michelin Cold-Pressure Warming Regulations and Double-Stinting Tyres',
    ],
    summaries: [
      'The FIA and ACO have issued the official BoP parameters for the upcoming round at Fuji Speedway, adjusting maximum power output and base ballast across LMH and LMDh competitors.',
      'Technical analysis of the 680-horsepower Hypercar class reveals how the virtual energy tank system precisely meters megajoules per stint to guarantee parity between rear-wheel and all-wheel drive platforms.',
      'Crew strategists explain the complexity of night-time tire management, where ambient track drop temperatures require millimeter-precise damper rebound adjustments.',
    ],
    fullReports: [
      'FUJI SPEEDWAY, JAPAN — As the World Endurance Championship heads to Mount Fuji, the Hypercar battle remains razor-tight between Ferrari, Porsche Penske, Toyota Gazoo, and Alpine. BoP parameters for the 4.563km circuit feature modest weight adjustments to balance high-speed straight-line prowess with tight chicane agility.',
      'The virtual energy tank algorithm enforces a maximum stint energy allocation (typically 900 to 910 MJ), requiring drivers to lift and coast before braking zones to maximize lap efficiency.',
      'Post-race scrutineering across previous rounds validated zero driveline torque sensor anomalies, ensuring transparent competition at the highest echelon of sports car racing.',
    ],
  },

  // 5. WRC
  {
    idPrefix: 'wrc-wire-1',
    discipline: 'WRC',
    category: 'RALLY',
    source: 'WRC PRESS WIRE',
    url: 'https://www.wrc.com/news',
    titles: [
      'Acropolis Rally Greece: Brutal Rock-Strewn Mountain Stages Challenge Rally1 Suspension Limits',
      'Toyota GR Yaris vs Hyundai i20 N: Hybrid Boost Energy Mapping for High-Elevation Stages',
      'WRC Pacenote Precision: How Co-Drivers Navigate Blind Blind Crests in Zero-Visibility Dust',
    ],
    summaries: [
      'Known as the Rally of Gods, the Acropolis Rally tested mechanical resilience as 35°C ambient heat and razor-sharp bedrock pushed gravel dampers to the absolute brink.',
      'Rally1 engineers explain how electric boost triggers (up to 100kW extra surge) are programmed via throttle pedal thresholds to slingshot cars out of rocky hairpins.',
      'Thierry Neuville and Kalle Rovanperä traded stage wins by tenths of a second, highlighting the critical importance of tire choice on abrasive Mediterranean gravel.',
    ],
    fullReports: [
      'LAMIA, GREECE — The FIA World Rally Championship encountered severe terrain across the gravel stages of central Greece. Suspension travel of over 300mm was tested repeatedly over deep ruts and jagged shale as teams struggled with punctures.',
      'Compact hybrid powertrains in Rally1 cars require sophisticated regenerative charging under heavy braking, storing energy in sealed battery modules that discharge instantly upon throttle reapplication.',
      'Crews completed recce notes under strict radar supervision, dialing in precise steering angles for over 300 kilometers of timed competitive running.',
    ],
  },

  // 6. INDYCAR
  {
    idPrefix: 'indy-wire-1',
    discipline: 'INDYCAR',
    category: 'RACE',
    source: 'INDYCAR TIMING & WIRE',
    url: 'https://www.indycar.com/news',
    titles: [
      'IndyCar Milwaukee Mile: 220+ MPH Oval Drafting Duels Decided on Final Turn Overtake',
      'Hybrid Supercapacitor Deployment: How Drivers Use 60-Horsepower Push-to-Pass Bursts',
      'Alternate Green Guayule Tire Compounds: Firestone Delivers Grip and Sustainability',
    ],
    summaries: [
      'Chip Ganassi Racing and Team Penske engaged in a breathtaking 250-lap short-track oval spectacle, trading high and low lines through turns 1 and 2 at 180 mph wheel-to-wheel.',
      'The newly integrated EMPEL ultracapacitor hybrid system allows drivers to charge in braking zones and deploy instant horsepower surges for defense or drafting overtakes.',
      'Firestone Firehawk alternate compound tyres derived from natural desert shrubs offered supreme initial mechanical grip while testing driver tire preservation on abrasive concrete.',
    ],
    fullReports: [
      'WEST ALLIS, WISCONSIN — Oval racing in the NTT IndyCar Series produced another instant classic at the historic Milwaukee Mile. High downforce packages allowed drivers to run side-by-side through both banks without lifting.',
      'The hybrid power unit integrates seamlessly with the twin-turbo 2.2-liter V6, providing drivers with steering wheel-mounted harvest paddles that replenish capacitors within two heavy braking applications.',
      'Officials verified that all aeroscreen cockpits operated with optimal cooling airflow ducts, ensuring driver comfort during humid 2-hour continuous physical workouts.',
    ],
  },

  // 7. SUPERCARS
  {
    idPrefix: 'supercars-wire-1',
    discipline: 'SUPERCARS',
    category: 'RACE',
    source: 'SUPERCARS AUSTRALIA WIRE',
    url: 'https://www.supercars.com/news',
    titles: [
      'Sandown 500: Triple Eight Camaro and Walkinshaw Mustang Lock Horns in Endurance Thriller',
      'Gen3 Aerodynamic Parity Update: Full-Scale Wind Tunnel Testing Results Confirmed',
      'V8 Supercars Fuel Drop Regulations: Strategy Nuances for Mandatory 120-Litre Stops',
    ],
    summaries: [
      'Will Brown and Broc Feeney steered their Red Bull Ampol Camaro to the top step at Sandown Raceway following a gripping tactical duel with the Mobil 1 Walkinshaw Mustang.',
      'Supercars technical board confirms the aerodynamic drag and front-to-rear downforce balance between the Chevrolet Camaro and Ford Mustang is within 0.15% across all yaw angles.',
      'Endurance co-driver pace proved decisive as fuel burn rates and transaxle gear temperatures dictated pit stop windows during the 161-lap distance.',
    ],
    fullReports: [
      'MELBOURNE, AUSTRALIA — The traditional Bathurst warmup at Sandown delivered intense touring car action. High-speed curbs across the Esses challenged the lightweight Gen3 chromoly chassis tubes, requiring delicate curb-hopping precision.',
      'Comprehensive parity testing conducted at Windshear in North Carolina ensured that straight-line acceleration and corner-entry stability remain perfectly matched across manufacturers.',
      'Fans packed the grandstands as roaring naturally-aspirated V8 engines echoed across the Melbourne parkland circuit.',
    ],
  },

  // 8. DTM
  {
    idPrefix: 'dtm-wire-1',
    discipline: 'DTM',
    category: 'RACE',
    source: 'ADAC DTM DISPATCH',
    url: 'https://www.dtm.com/news',
    titles: [
      'DTM Sachsenring: Mirko Bortolotti Leads Lamborghini 1-2 in Scorching Sprint Battle',
      'GT3 Balance of Performance: Engine Restrictor and Minimum Weight Adjustments Announced',
      'DTM Performance Pit Stop Rule: Teams Battle for Sub-6-Second 4-Wheel Tyre Swaps',
    ],
    summaries: [
      'SSR Performance mastered the undulating Sachsenring roller-coaster, taking maximum points after resisting late pressure from the Manthey EMA Porsche and Schubert BMW.',
      'ADAC motorsport technical delegates calibrated intake restrictor diameters and turbo boost maps to ensure parity across V10, twin-turbo V8, and flat-six platforms.',
      'With pit lane crews restricted to specific mechanic numbers, flawless wheel gun precision made the difference between podium glory and mid-pack finishes.',
    ],
    fullReports: [
      'HOHENSTEIN-ERNSTTHAL — Round 6 of the Deutsche Tourenwagen Masters pushed GT3 racers through the blind, downhill Omega curve at 220 km/h. Bortolotti displayed supreme car control on Pirelli slick rubber to claim pole and race win.',
      'The DTM pit stop regulation mandates that all four wheels must be exchanged using manual pit guns with no automated wheel spinners, preserving raw crew athletic skill.',
      'Lamborghini, Porsche, Audi, BMW, Mercedes-AMG, and Ferrari machines finished within 12 seconds of each other after 60 minutes of flat-out green flag racing.',
    ],
  },

  // 9. FORMULA DRIFT
  {
    idPrefix: 'drift-wire-1',
    discipline: 'DRIFT',
    category: 'DRIFT',
    source: 'FORMULA DRIFT NEWS WIRE',
    url: 'https://www.formulad.com/news',
    titles: [
      'Formula DRIFT Irwindale Finals: James Deane Executes Flawless 98-Point Qualifying Run',
      'Pro Spec Chassis Engineering: 74-Degree Steering Angle Knuckles and Quick-Change Diffs',
      'Formula Drift Judges Telemetry: Deceleration Zones, Outside Clipping Points, and Angle Sensors',
    ],
    summaries: [
      'James Deane set the benchmark at the House of Drift with an astonishing high-bank wall ride, brushing the rear bumper against the outer barrier at 95 mph while maintaining 72 degrees of continuous drift angle.',
      'Technical breakdown of modern Formula Drift machinery: 1,150+ horsepower twin-turbo V8 and 2JZ setups running nitrous oxide spool systems and custom Wisefab suspension geometry.',
      'FD judges explain how real-time GPS accelerometer sensors track lead-car acceleration deltas, penalizing unexpected lift-offs and rewarding bumper-to-door chase proximity.',
    ],
    fullReports: [
      'IRWINDALE, CALIFORNIA — The final round of the Formula DRIFT PRO Championship ignited the legendary banked oval. Deane piloted his Ford Mustang RTR Spec 5-D with millimeter precision, filling the inner oval with torrential tire smoke.',
      'Modern drift competition builds represent extreme automotive engineering, requiring dual rear caliper handbrakes for instant rear-axle lockup and dry-sump lubrication systems capable of sustaining 8,500 RPM under sustained lateral G-forces.',
      'Officials verified that all competition vehicles complied with strict tire treadwear ratings and roll cage wall thickness specs for driver safety.',
    ],
  },
  // 10. GT WORLD CHALLENGE (GT3 & GT4)
  {
    idPrefix: 'gtworld-wire-sprint',
    discipline: 'GTWORLD',
    category: 'RACE',
    source: 'SRO GT WORLD WIRE',
    url: 'https://www.gt-world-challenge-europe.com/news',
    titles: [
      'GT World Challenge Sprint Cup: Team WRT BMW M4 GT3 EVO Captures Thrilling Victory Over AF Corse Ferrari',
      '24 Hours of Spa Technical Debrief: SRO Balance of Performance Parity Delivers 14 Lead Changes in Final Six Hours',
      'GT World Endurance Cup: Manthey EMA Porsche 911 GT3 R Survives Rain-Soaked Nürburgring 3-Hour Showdown',
    ],
    summaries: [
      'Dries Vanthoor and Charles Weerts guided the #32 Team WRT BMW M4 GT3 EVO to a sensational Sprint Cup victory, fending off Antonio Fuoco in the #51 AF Corse Ferrari 296 GT3 by a scant 0.412 seconds.',
      'SRO technical stewards praised the tight competitive spread during the CrowdStrike 24 Hours of Spa, with seven different manufacturers finishing on the lead lap as Comtoyou Racing Aston Martin secured the overall trophy.',
      'Klaus Bachler and Thomas Preining mastered treacherous wet-to-dry track conditions at the Nürburgring GP circuit, capitalizing on Manthey EMA superior mechanical traction to clinch the endurance victory.',
    ],
    fullReports: [
      'CIRCUIT PAUL RICARD, FRANCE — The Fanatec GT World Challenge delivered another masterclass in GT3 sprint racing. Starting from the outside of row one, Dries Vanthoor executed a brave pass around the outside into Signes, maintaining track position before handing the BMW M4 GT3 EVO to Charles Weerts. Weerts absorbed intense pressure from the charging Ferrari 296 GT3 of Antonio Fuoco, executing flawless traffic management through the final laps.',
      'SPA-FRANCORCHAMPS, BELGIUM — The 77th running of the CrowdStrike 24 Hours of Spa showcased why GT3 remains the benchmark for world customer endurance racing. Comtoyou Racing Aston Martin Vantage AMR GT3 navigated rain squalls across Blanchimont and Eau Rouge to claim a historic victory, backed by faultless pit stops and Pirelli tire temperature preservation.',
      'NÜRBURGRING, GERMANY — The Nürburgring 3-Hour Endurance Cup was shaped by unpredictable Eifel weather. Manthey EMA Porsche #911 made the critical call to switch to slick tires as the dry racing line materialized, gaining 18 seconds on the field in three laps and commanding the race to the checkered flag.',
    ],
  },
  {
    idPrefix: 'gtworld-wire-classes',
    discipline: 'GTWORLD',
    category: 'TECH',
    source: 'SRO TECHNICAL BULLETIN',
    url: 'https://www.gt-world-challenge-europe.com/technical',
    titles: [
      'SRO Balance of Performance Bulletin: Adjustments Confirmed for GT3 Restrictors and GT4 Ride Heights',
      'Driver Categorization Committee Update: Silver Cup and Bronze Class Allocations Finalized Ahead of Barcelona',
      'GT4 European Series Report: BMW M4 GT4 Battles Audi R8 LMS in Fierce Production Sports Car Duel',
    ],
    summaries: [
      'SRO Motorsports Group has published technical bulletin BoP-2026-08, modifying minimum ballast weights and turbo boost pressure curves for BMW, Ferrari, Porsche, and Mercedes-AMG machinery.',
      'The FIA/SRO Driver Categorization Committee announced confirmed ratings across Platinum, Gold, Silver, and Bronze grades, preserving intense class competition across Pro, Pro-Am, and Silver Cups.',
      "In the GT4 European Series, Ricardo van der Ende and Benjamin Lessennes led L'Espace Bienvenue BMW M4 GT4 G82 to double podium finishes against Team Speedcar Audi and AVR Porsche squads.",
    ],
    fullReports: [
      'STAVELOT, BELGIUM — SRO technical director Claude Surmont confirmed minor adjustments under the Balance of Performance algorithm. The Ferrari 296 GT3 receives a 5kg ballast reduction, while the BMW M4 GT3 EVO operates with a revised boost ramp above 6,800 RPM to balance acceleration out of medium-speed chicanes.',
      'The multi-tier driver grading system continues to ensure integrity across GT World Challenge Europe. In the Pro-Am Cup, Bronze-rated drivers must complete mandatory driving time minimums, emphasizing strategic driver handover timing during fuel windows.',
      "The GT4 class proved sensational as 30 production-derived sports cars fought across the sprint double-header. The twin-turbocharged BMW M4 GT4 G82 exhibited formidable straight-line punch, while the mid-engine agility of the Audi R8 LMS GT4 kept the battle alive through technical sector two.",
    ],
  },
];

export const MotorsportNewsService = {
  /**
   * Fetches fresh, text-based racing wire articles across all disciplines or a specific category.
   * Dynamically generates updated timestamps and varied content on each invocation.
   */
  async fetchLatestNews(discipline?: MotorsportCategory | 'ALL', refreshKey?: number): Promise<NewsArticle[]> {
    // Artificial small latency for realistic live wire feel
    await new Promise((res) => setTimeout(res, 120));

    const now = Date.now();
    const articles: NewsArticle[] = [];

    WIRE_TEMPLATES.forEach((tpl, tplIdx) => {
      // If filtering for a specific discipline, only include matching templates
      if (discipline && discipline !== 'ALL' && tpl.discipline !== discipline) {
        return;
      }

      // Pick a variation index based on time and refresh key to deliver varied news every refresh
      const seed = Math.floor(now / (1000 * 60)) + (refreshKey || 0) + tplIdx;
      const titleIndex = seed % tpl.titles.length;
      const secondTitleIndex = (seed + 1) % tpl.titles.length;

      // Primary wire article
      const timeOffsetMinutes = (tplIdx * 9 + (seed % 15) + 3);
      articles.push({
        id: `${tpl.idPrefix}-${titleIndex}-${refreshKey || 0}`,
        title: tpl.titles[titleIndex],
        summary: tpl.summaries[titleIndex],
        body: tpl.fullReports[titleIndex],
        publishedAt: new Date(now - 1000 * 60 * timeOffsetMinutes).toISOString(),
        source: tpl.source,
        url: tpl.url,
        category: tpl.category,
        discipline: tpl.discipline,
      });

      // Secondary wire article for high density
      if (tpl.titles.length > 1) {
        const secondOffsetMinutes = (tplIdx * 14 + (seed % 25) + 28);
        articles.push({
          id: `${tpl.idPrefix}-b-${secondTitleIndex}-${refreshKey || 0}`,
          title: tpl.titles[secondTitleIndex],
          summary: tpl.summaries[secondTitleIndex],
          body: tpl.fullReports[secondTitleIndex],
          publishedAt: new Date(now - 1000 * 60 * secondOffsetMinutes).toISOString(),
          source: tpl.source,
          url: tpl.url,
          category: tpl.category,
          discipline: tpl.discipline,
        });
      }
    });

    // Sort by latest publishedAt first
    articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    return articles;
  },
};
