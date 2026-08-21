import { CircuitInfo } from '../types';

export const CIRCUITS: Record<string, CircuitInfo> = {
  // ==========================================
  // 1. FORMULA 1 CIRCUITS (Category: 'F1')
  // ==========================================
  silverstone: {
    id: 'silverstone',
    name: 'Silverstone Circuit (Home of British GP)',
    location: 'Silverstone, Northamptonshire',
    country: 'United Kingdom',
    lapLengthKm: 5.891,
    turns: 18,
    category: 'F1',
    lapRecord: {
      time: '1:27.097',
      driver: 'Max Verstappen (Red Bull RB16)',
      year: 2020,
    },
    drsZones: 2,
    surfaceType: 'ASPHALT',
    pathData: 'M 180,320 L 220,180 L 320,130 L 420,150 L 480,110 L 580,120 L 640,190 L 600,280 L 680,310 L 650,420 L 520,380 L 440,430 L 320,390 L 240,410 Z',
    keyCoordinates: [
      { x: 180, y: 320, speed: 290, distancePct: 0 },    // Hamilton Straight
      { x: 220, y: 180, speed: 250, distancePct: 0.15 }, // Abbey & Farm Curve
      { x: 320, y: 130, speed: 120, distancePct: 0.25 }, // Village & The Loop
      { x: 480, y: 110, speed: 300, distancePct: 0.4 },  // Wellington Straight
      { x: 580, y: 120, speed: 230, distancePct: 0.5 },  // Brooklands & Luffield
      { x: 640, y: 190, speed: 285, distancePct: 0.6 },  // Copse (290 km/h in 8th gear)
      { x: 600, y: 280, speed: 290, distancePct: 0.7 },  // Maggotts, Becketts & Chapel
      { x: 680, y: 310, speed: 325, distancePct: 0.8 },  // Hangar Straight
      { x: 650, y: 420, speed: 140, distancePct: 0.88 }, // Stowe Corner
      { x: 440, y: 430, speed: 120, distancePct: 0.95 }, // Vale & Club
    ],
  },

  monaco: {
    id: 'monaco',
    name: 'Circuit de Monaco (Monte Carlo Street Circuit)',
    location: 'Monte Carlo',
    country: 'Monaco',
    lapLengthKm: 3.337,
    turns: 19,
    category: 'F1',
    lapRecord: {
      time: '1:12.909',
      driver: 'Lewis Hamilton (Mercedes W12)',
      year: 2021,
    },
    drsZones: 1,
    surfaceType: 'STREET',
    pathData: 'M 220,400 L 220,240 C 220,180 280,150 350,160 L 440,190 L 540,160 L 610,180 C 650,210 660,270 600,300 L 530,310 C 490,320 480,360 520,380 L 620,370 C 680,370 700,420 650,450 L 480,450 L 360,430 L 260,440 Z',
    keyCoordinates: [
      { x: 220, y: 400, speed: 270, distancePct: 0 },
      { x: 220, y: 240, speed: 115, distancePct: 0.15 }, // Sainte Dévote
      { x: 350, y: 160, speed: 210, distancePct: 0.25 }, // Beau Rivage & Massenet
      { x: 440, y: 190, speed: 130, distancePct: 0.35 }, // Casino Square
      { x: 540, y: 160, speed: 90, distancePct: 0.45 },  // Mirabeau Haute
      { x: 610, y: 180, speed: 50, distancePct: 0.55 },  // Grand Hotel Hairpin (tightest in F1)
      { x: 600, y: 300, speed: 280, distancePct: 0.65 }, // Tunnel
      { x: 520, y: 380, speed: 90, distancePct: 0.75 },  // Nouvelle Chicane
      { x: 620, y: 370, speed: 180, distancePct: 0.85 }, // Tabac
      { x: 480, y: 450, speed: 140, distancePct: 0.92 }, // Swimming Pool (Louis Chiron)
      { x: 260, y: 440, speed: 85, distancePct: 0.98 },  // La Rascasse & Anthony Noghès
    ],
  },

  spa: {
    id: 'spa',
    name: 'Circuit de Spa-Francorchamps (Ardennes Rollercoaster)',
    location: 'Stavelot, Ardennes',
    country: 'Belgium',
    lapLengthKm: 7.004,
    turns: 19,
    category: 'F1',
    lapRecord: {
      time: '1:46.286',
      driver: 'Valtteri Bottas (Mercedes W09)',
      year: 2018,
    },
    drsZones: 2,
    surfaceType: 'ASPHALT',
    pathData: 'M 180,410 L 210,340 L 240,250 C 260,200 310,160 380,150 L 520,130 L 640,110 L 710,160 L 670,260 L 580,310 L 590,390 L 510,430 L 370,410 L 270,440 Z',
    keyCoordinates: [
      { x: 180, y: 410, speed: 260, distancePct: 0 },
      { x: 210, y: 340, speed: 90, distancePct: 0.1 },  // La Source Hairpin
      { x: 240, y: 250, speed: 305, distancePct: 0.2 }, // Eau Rouge & Raidillon uphill compression
      { x: 520, y: 130, speed: 335, distancePct: 0.35 },// Kemmel Straight
      { x: 640, y: 110, speed: 160, distancePct: 0.45 },// Les Combes & Malmedy
      { x: 710, y: 160, speed: 220, distancePct: 0.55 },// Bruxelles & Speakers Corner
      { x: 670, y: 260, speed: 270, distancePct: 0.65 },// Pouhon double-apex high-G
      { x: 580, y: 310, speed: 210, distancePct: 0.75 },// Stavelot
      { x: 590, y: 390, speed: 320, distancePct: 0.85 },// Blanchimont
      { x: 270, y: 440, speed: 80, distancePct: 0.97 }, // Bus Stop Chicane
    ],
  },

  monza: {
    id: 'monza',
    name: 'Autodromo Nazionale Monza (Temple of Speed)',
    location: 'Monza, Lombardy',
    country: 'Italy',
    lapLengthKm: 5.793,
    turns: 11,
    category: 'F1',
    lapRecord: {
      time: '1:21.046',
      driver: 'Rubens Barrichello (Ferrari F2004)',
      year: 2004,
    },
    drsZones: 2,
    surfaceType: 'ASPHALT',
    pathData: 'M 190,420 L 190,160 C 210,110 270,100 340,110 L 480,120 L 590,140 L 680,220 L 670,330 C 650,420 560,430 450,420 L 320,420 Z',
    keyCoordinates: [
      { x: 190, y: 420, speed: 355, distancePct: 0 },    // Rettifilo Tribune (350+ km/h)
      { x: 190, y: 160, speed: 85, distancePct: 0.2 },   // Prima Variante
      { x: 340, y: 110, speed: 310, distancePct: 0.35 }, // Curva Grande / Biassono
      { x: 480, y: 120, speed: 140, distancePct: 0.5 },  // Variante della Roggia
      { x: 590, y: 140, speed: 260, distancePct: 0.65 }, // Curve di Lesmo 1 & 2
      { x: 680, y: 220, speed: 335, distancePct: 0.8 },  // Variante Ascari & Straight
      { x: 670, y: 330, speed: 235, distancePct: 0.9 },  // Curva Parabolica (Alboreto)
    ],
  },

  suzuka: {
    id: 'suzuka',
    name: 'Suzuka International Racing Course (Figure-8 Masterpiece)',
    location: 'Suzuka, Mie Prefecture',
    country: 'Japan',
    lapLengthKm: 5.807,
    turns: 18,
    category: 'F1',
    lapRecord: {
      time: '1:30.983',
      driver: 'Lewis Hamilton (Mercedes W10)',
      year: 2019,
    },
    drsZones: 1,
    surfaceType: 'ASPHALT',
    pathData: 'M 190,400 L 220,280 L 290,210 L 380,170 L 490,150 L 600,160 L 690,210 L 660,310 L 560,340 L 440,360 L 320,420 Z',
    keyCoordinates: [
      { x: 190, y: 400, speed: 320, distancePct: 0 },    // Main Straight
      { x: 220, y: 280, speed: 235, distancePct: 0.15 }, // First Corner & S-Curves (Esses)
      { x: 380, y: 170, speed: 130, distancePct: 0.35 }, // Degner 1 & 2
      { x: 490, y: 150, speed: 65, distancePct: 0.5 },   // Suzuka Hairpin
      { x: 600, y: 160, speed: 280, distancePct: 0.65 }, // Spoon Curve double-apex
      { x: 690, y: 210, speed: 315, distancePct: 0.82 }, // 130R (315 km/h high-G flat out)
      { x: 560, y: 340, speed: 75, distancePct: 0.94 },  // Casio Triangle Chicane
    ],
  },

  interlagos: {
    id: 'interlagos',
    name: 'Autódromo José Carlos Pace (Interlagos GP)',
    location: 'São Paulo',
    country: 'Brazil',
    lapLengthKm: 4.309,
    turns: 15,
    category: 'F1',
    lapRecord: {
      time: '1:10.540',
      driver: 'Valtteri Bottas (Mercedes W09)',
      year: 2018,
    },
    drsZones: 2,
    surfaceType: 'ASPHALT',
    pathData: 'M 210,410 L 210,240 L 310,180 L 450,150 L 590,170 L 680,240 L 640,340 L 520,380 L 370,420 Z',
    keyCoordinates: [
      { x: 210, y: 410, speed: 325, distancePct: 0 },    // Arquibancadas / Reta dos Boxes
      { x: 210, y: 240, speed: 110, distancePct: 0.15 }, // Senna S (Turns 1-2 downhill)
      { x: 450, y: 150, speed: 310, distancePct: 0.38 }, // Curva do Sol & Reta Oposta
      { x: 590, y: 170, speed: 140, distancePct: 0.55 }, // Descida do Lago & Ferradura
      { x: 680, y: 240, speed: 85, distancePct: 0.72 },  // Bico de Pato (Duck's Beak)
      { x: 520, y: 380, speed: 125, distancePct: 0.88 }, // Junção uphill
    ],
  },

  bahrain: {
    id: 'bahrain',
    name: 'Bahrain International Circuit (Sakhir Desert GP)',
    location: 'Sakhir',
    country: 'Bahrain',
    lapLengthKm: 5.412,
    turns: 15,
    category: 'F1',
    lapRecord: {
      time: '1:31.447',
      driver: 'Pedro de la Rosa (McLaren MP4-20)',
      year: 2005,
    },
    drsZones: 3,
    surfaceType: 'ASPHALT',
    pathData: 'M 180,410 L 180,220 L 260,180 L 360,190 L 440,150 L 580,130 L 680,160 L 670,260 L 590,290 L 530,380 L 420,430 L 290,410 Z',
    keyCoordinates: [
      { x: 180, y: 410, speed: 325, distancePct: 0 },    // Main Straight
      { x: 180, y: 220, speed: 85, distancePct: 0.12 },  // Turn 1 Schumacher Hairpin
      { x: 360, y: 190, speed: 240, distancePct: 0.28 }, // Turns 5-7 Esses
      { x: 440, y: 150, speed: 90, distancePct: 0.42 },  // Turn 8 Hairpin
      { x: 580, y: 130, speed: 110, distancePct: 0.55 }, // Turns 9-10 Downhill Blind Braking
      { x: 680, y: 160, speed: 305, distancePct: 0.7 },  // Back Straight
      { x: 530, y: 380, speed: 130, distancePct: 0.85 }, // Turn 13
      { x: 290, y: 410, speed: 115, distancePct: 0.96 }, // Turns 14-15 onto Straight
    ],
  },

  cota_f1: {
    id: 'cota_f1',
    name: 'Circuit of the Americas (United States Grand Prix)',
    location: 'Austin, Texas',
    country: 'United States',
    lapLengthKm: 5.513,
    turns: 20,
    category: 'F1',
    lapRecord: {
      time: '1:36.169',
      driver: 'Charles Leclerc (Ferrari SF90)',
      year: 2019,
    },
    drsZones: 2,
    surfaceType: 'ASPHALT',
    pathData: 'M 190,410 L 230,190 L 320,150 L 430,170 L 560,140 L 680,180 L 670,310 L 570,360 L 460,420 L 310,430 Z',
    keyCoordinates: [
      { x: 190, y: 410, speed: 320, distancePct: 0 },
      { x: 230, y: 190, speed: 85, distancePct: 0.15 },  // 133-ft Uphill Turn 1 Blind Hairpin
      { x: 430, y: 170, speed: 275, distancePct: 0.38 }, // High-Speed Maggotts-Style Esses (Turns 3-6)
      { x: 680, y: 180, speed: 335, distancePct: 0.65 }, // 1.2km Backstraight
      { x: 570, y: 360, speed: 190, distancePct: 0.85 }, // Multi-apex Turn 16-18 Stadium Section
      { x: 310, y: 430, speed: 110, distancePct: 0.97 }, // Turn 20 onto Main Straight
    ],
  },

  // ==========================================
  // 2. WEC HYPERCAR & 24H (Category: 'WEC')
  // ==========================================
  lemans: {
    id: 'lemans',
    name: 'Circuit de la Sarthe (24 Hours of Le Mans)',
    location: 'Le Mans',
    country: 'France',
    lapLengthKm: 13.626,
    turns: 38,
    category: 'WEC',
    lapRecord: {
      time: '3:14.791',
      driver: 'Kamui Kobayashi (Toyota TS050)',
      year: 2017,
    },
    elevationMeters: 45,
    surfaceType: 'ASPHALT',
    pathData: 'M 220,380 L 240,260 L 310,210 L 440,160 L 610,130 L 740,110 L 710,220 L 590,260 L 570,390 L 460,420 L 320,440 L 220,380 Z',
    keyCoordinates: [
      { x: 220, y: 380, speed: 305, distancePct: 0 },    // Pit Straight
      { x: 240, y: 260, speed: 135, distancePct: 0.1 },  // Dunlop Chicane & Bridge
      { x: 310, y: 210, speed: 270, distancePct: 0.2 },  // Tertre Rouge
      { x: 440, y: 160, speed: 340, distancePct: 0.35 }, // Mulsanne Straight (Chicane 1)
      { x: 610, y: 130, speed: 342, distancePct: 0.5 },  // Mulsanne Straight (Chicane 2)
      { x: 740, y: 110, speed: 90, distancePct: 0.62 },  // Mulsanne Corner Hairpin
      { x: 710, y: 220, speed: 310, distancePct: 0.72 }, // Indianapolis & Arnage
      { x: 590, y: 260, speed: 245, distancePct: 0.85 }, // Porsche Curves
      { x: 570, y: 390, speed: 210, distancePct: 0.92 }, // Maison Blanche
      { x: 460, y: 420, speed: 95, distancePct: 0.97 },  // Ford Chicanes
    ],
  },

  nurburgring: {
    id: 'nurburgring',
    name: 'Nürburgring Nordschleife (ADAC 24h Gesamtstrecke)',
    location: 'Nürburg, Eifel',
    country: 'Germany',
    lapLengthKm: 25.378,
    turns: 170,
    category: 'WEC',
    lapRecord: {
      time: '5:19.546',
      driver: 'Timo Bernhard (Porsche 919 Evo)',
      year: 2018,
    },
    elevationMeters: 300,
    surfaceType: 'ASPHALT',
    pathData: 'M 380,440 L 440,410 L 520,410 L 580,360 L 640,300 L 700,220 L 720,160 C 730,110 680,80 620,70 L 520,65 L 430,70 L 360,95 L 300,130 L 250,180 L 200,240 L 160,310 C 140,360 160,410 210,430 L 290,440 L 380,440 Z',
    keyCoordinates: [
      { x: 380, y: 440, speed: 290, distancePct: 0 },
      { x: 520, y: 410, speed: 180, distancePct: 0.1 },
      { x: 640, y: 300, speed: 265, distancePct: 0.22 },
      { x: 700, y: 220, speed: 120, distancePct: 0.35 },
      { x: 720, y: 160, speed: 280, distancePct: 0.45 },
      { x: 620, y: 70, speed: 140, distancePct: 0.58 },
      { x: 520, y: 65, speed: 110, distancePct: 0.68 },
      { x: 430, y: 70, speed: 220, distancePct: 0.78 },
      { x: 300, y: 130, speed: 175, distancePct: 0.88 },
      { x: 200, y: 240, speed: 330, distancePct: 0.94 },
      { x: 160, y: 310, speed: 135, distancePct: 0.98 },
    ],
  },

  fuji_wec: {
    id: 'fuji_wec',
    name: 'Fuji International Speedway (6 Hours of Fuji)',
    location: 'Oyama, Shizuoka Prefecture',
    country: 'Japan',
    lapLengthKm: 4.563,
    turns: 16,
    category: 'WEC',
    lapRecord: {
      time: '1:23.570',
      driver: 'Kamui Kobayashi (Toyota GR010)',
      year: 2022,
    },
    surfaceType: 'ASPHALT',
    pathData: 'M 180,420 L 180,210 L 260,160 L 390,140 L 520,130 L 660,170 L 670,290 L 580,340 L 490,420 L 310,430 Z',
    keyCoordinates: [
      { x: 180, y: 420, speed: 320, distancePct: 0 },    // 1.475km Main Straight
      { x: 180, y: 210, speed: 100, distancePct: 0.18 }, // First Corner Hairpin
      { x: 390, y: 140, speed: 250, distancePct: 0.38 }, // Coca-Cola & 100R
      { x: 660, y: 170, speed: 90, distancePct: 0.62 },  // Hairpin
      { x: 670, y: 290, speed: 140, distancePct: 0.78 }, // 300R & Dunlop
      { x: 490, y: 420, speed: 110, distancePct: 0.92 }, // Panasonic onto Straight
    ],
  },

  sebring_wec: {
    id: 'sebring_wec',
    name: 'Sebring International Raceway (Mobil 1 12 Hours)',
    location: 'Sebring, Florida',
    country: 'United States',
    lapLengthKm: 6.019,
    turns: 17,
    category: 'WEC',
    lapRecord: {
      time: '1:40.124',
      driver: 'Kamui Kobayashi (Cadillac / Toyota)',
      year: 2023,
    },
    surfaceType: 'ASPHALT',
    pathData: 'M 190,420 L 220,240 L 330,190 L 470,160 L 600,160 L 680,250 L 620,360 L 490,430 L 330,430 Z',
    keyCoordinates: [
      { x: 190, y: 420, speed: 295, distancePct: 0 },
      { x: 220, y: 240, speed: 140, distancePct: 0.15 }, // Turn 1 fast bumpy left
      { x: 470, y: 160, speed: 100, distancePct: 0.45 }, // Hairpin & Big Bend
      { x: 680, y: 250, speed: 305, distancePct: 0.75 }, // Ullman Straight
      { x: 490, y: 430, speed: 120, distancePct: 0.94 }, // Turn 17 Sunset Bend brutal concrete slabs
    ],
  },

  spa_wec: {
    id: 'spa_wec',
    name: 'Circuit de Spa-Francorchamps (TotalEnergies 6 Hours of Spa)',
    location: 'Stavelot, Ardennes',
    country: 'Belgium',
    lapLengthKm: 7.004,
    turns: 19,
    category: 'WEC',
    lapRecord: {
      time: '2:00.777',
      driver: 'Antonio Fuoco (Ferrari 499P)',
      year: 2024,
    },
    surfaceType: 'ASPHALT',
    pathData: 'M 180,410 L 210,340 L 240,250 C 260,200 310,160 380,150 L 520,130 L 640,110 L 710,160 L 670,260 L 580,310 L 590,390 L 510,430 L 370,410 L 270,440 Z',
    keyCoordinates: [
      { x: 180, y: 410, speed: 255, distancePct: 0 },
      { x: 210, y: 340, speed: 85, distancePct: 0.1 },  // La Source
      { x: 240, y: 250, speed: 295, distancePct: 0.2 }, // Eau Rouge & Raidillon
      { x: 520, y: 130, speed: 320, distancePct: 0.35 },// Kemmel Straight
      { x: 670, y: 260, speed: 250, distancePct: 0.65 },// Pouhon
      { x: 270, y: 440, speed: 80, distancePct: 0.97 }, // Bus Stop
    ],
  },

  // ==========================================
  // 3. FORMULA DRIFT (Category: 'DRIFT')
  // ==========================================
  irwindale: {
    id: 'irwindale',
    name: 'Irwindale Speedway (House of Drift)',
    location: 'Irwindale, California',
    country: 'United States',
    lapLengthKm: 0.805,
    turns: 4,
    category: 'DRIFT',
    stageType: 'DRIFT_ARENA',
    isPointToPoint: true,
    startLabel: 'START ACCELERATION CHUTE',
    finishLabel: 'FINISH DECEL BOX',
    lapRecord: {
      time: '98.5 Points',
      driver: 'James Deane (Angle & Proximity)',
      year: 2023,
    },
    surfaceType: 'BANKED_OVAL',
    pathData: 'M 100,380 L 220,380 C 260,380 290,340 270,280 C 240,190 310,130 420,130 L 590,130 C 690,130 730,220 680,310 C 640,380 540,390 440,370 L 320,370',
    keyCoordinates: [
      { x: 100, y: 380, speed: 145, distancePct: 0, driftAngle: 0 },    // Infield Launch Straight
      { x: 220, y: 380, speed: 165, distancePct: 0.15, driftAngle: 45 }, // Initiation Point
      { x: 270, y: 280, speed: 155, distancePct: 0.3, driftAngle: 68 },  // High Bank Outer Zone 1 (OZ1 Wall Tap)
      { x: 420, y: 130, speed: 140, distancePct: 0.5, driftAngle: 62 },  // Inner Clip 1 (IC1)
      { x: 680, y: 310, speed: 130, distancePct: 0.78, driftAngle: 66 }, // Infield Outer Zone 2 (OZ2)
      { x: 320, y: 370, speed: 95, distancePct: 1.0, driftAngle: 35 },   // Finish Line Deceleration
    ],
    clippingZones: [
      { id: 'init', name: 'Initiation Cone', type: 'TOUCH_AND_GO', x: 220, y: 380, radius: 14 },
      { id: 'oz1', name: 'Outer Zone 1 (Wall Ride)', type: 'OUTER_ZONE', x: 270, y: 280, radius: 24 },
      { id: 'ic1', name: 'Inner Clip 1', type: 'INNER_CLIP', x: 420, y: 130, radius: 16 },
      { id: 'oz2', name: 'Outer Zone 2 (Infield Sweeper)', type: 'OUTER_ZONE', x: 680, y: 310, radius: 22 },
      { id: 'ic2', name: 'Inner Clip 2', type: 'INNER_CLIP', x: 500, y: 380, radius: 16 },
    ],
  },

  longbeach_drift: {
    id: 'longbeach_drift',
    name: 'Streets of Long Beach (Formula DRIFT Streets Course)',
    location: 'Long Beach, California',
    country: 'United States',
    lapLengthKm: 0.950,
    turns: 6,
    category: 'DRIFT',
    stageType: 'DRIFT_ARENA',
    isPointToPoint: true,
    startLabel: 'START ACCEL CHUTE',
    finishLabel: 'FINISH BOX T9-11',
    lapRecord: {
      time: '97.0 Points',
      driver: 'Fredric Aasbo (Tandem Lead)',
      year: 2024,
    },
    surfaceType: 'STREET',
    pathData: 'M 110,390 L 240,390 C 270,390 300,340 280,260 C 260,180 340,140 450,150 L 580,160 C 670,170 710,250 670,320 C 630,390 530,400 400,390',
    keyCoordinates: [
      { x: 110, y: 390, speed: 140, distancePct: 0, driftAngle: 0 },
      { x: 240, y: 390, speed: 158, distancePct: 0.2, driftAngle: 50 },  // Turn 9 Initiation
      { x: 280, y: 260, speed: 145, distancePct: 0.4, driftAngle: 72 },  // Outer Zone 1 Concrete Barrier
      { x: 450, y: 150, speed: 130, distancePct: 0.6, driftAngle: 60 },  // Inner Clip 1 (Apex Transition)
      { x: 670, y: 320, speed: 120, distancePct: 0.85, driftAngle: 68 }, // Outer Zone 2 Grandstand Wall
      { x: 400, y: 390, speed: 90, distancePct: 1.0, driftAngle: 30 },   // Finish Line
    ],
    clippingZones: [
      { id: 'oz1', name: 'Outer Zone 1 (Turn 9 Wall)', type: 'OUTER_ZONE', x: 280, y: 260, radius: 22 },
      { id: 'ic1', name: 'Inner Clip 1 (Turn 10 Apex)', type: 'INNER_CLIP', x: 450, y: 150, radius: 16 },
      { id: 'oz2', name: 'Outer Zone 2 (Turn 11 Wall)', type: 'OUTER_ZONE', x: 670, y: 320, radius: 22 },
    ],
  },

  atlanta_drift: {
    id: 'atlanta_drift',
    name: 'Michelin Raceway Road Atlanta (Drift Down the Hill)',
    location: 'Braselton, Georgia',
    country: 'United States',
    lapLengthKm: 1.200,
    turns: 5,
    category: 'DRIFT',
    stageType: 'DRIFT_ARENA',
    isPointToPoint: true,
    startLabel: 'TOP OF HILL LAUNCH',
    finishLabel: 'INFIELD FINISH GATE',
    lapRecord: {
      time: '99.0 Points',
      driver: 'Matt Field (Max Angle Lock)',
      year: 2024,
    },
    surfaceType: 'ASPHALT',
    pathData: 'M 100,410 L 220,380 C 260,360 280,300 250,230 C 220,160 300,120 420,130 C 540,140 640,170 690,260 C 730,330 670,390 560,390 L 410,390',
    keyCoordinates: [
      { x: 100, y: 410, speed: 150, distancePct: 0, driftAngle: 0 },
      { x: 220, y: 380, speed: 170, distancePct: 0.18, driftAngle: 55 }, // Blind Crest Downhill Drop
      { x: 250, y: 230, speed: 150, distancePct: 0.38, driftAngle: 75 }, // The Horseshoe OZ1
      { x: 420, y: 130, speed: 135, distancePct: 0.6, driftAngle: 62 },  // Inner Clip 1 Transition
      { x: 690, y: 260, speed: 125, distancePct: 0.82, driftAngle: 70 }, // Outside Zone 2 Wall
      { x: 410, y: 390, speed: 90, distancePct: 1.0, driftAngle: 30 },   // Finish Deceleration
    ],
    clippingZones: [
      { id: 'oz1', name: 'Horseshoe Outer Zone 1', type: 'OUTER_ZONE', x: 250, y: 230, radius: 22 },
      { id: 'ic1', name: 'Inner Clip 1', type: 'INNER_CLIP', x: 420, y: 130, radius: 16 },
      { id: 'oz2', name: 'Outer Zone 2 Keyhole', type: 'OUTER_ZONE', x: 690, y: 260, radius: 22 },
    ],
  },

  englishtown_drift: {
    id: 'englishtown_drift',
    name: 'Englishtown Raceway (Old Bridge Township Drift Arena)',
    location: 'Englishtown, New Jersey',
    country: 'United States',
    lapLengthKm: 1.100,
    turns: 5,
    category: 'DRIFT',
    stageType: 'DRIFT_ARENA',
    isPointToPoint: true,
    startLabel: 'DRAGSTRIP ACCEL LAUNCH',
    finishLabel: 'ARENA FINISH GATE',
    lapRecord: {
      time: '98.0 Points',
      driver: 'Chelsea DeNofa (RTR Mustang)',
      year: 2024,
    },
    surfaceType: 'ASPHALT',
    pathData: 'M 100,400 L 230,400 C 270,400 300,340 270,260 C 240,180 320,140 440,140 L 580,150 C 680,160 720,240 680,320 C 640,390 530,400 380,400',
    keyCoordinates: [
      { x: 100, y: 400, speed: 150, distancePct: 0, driftAngle: 0 },
      { x: 230, y: 400, speed: 160, distancePct: 0.18, driftAngle: 50 }, // Initiation
      { x: 270, y: 260, speed: 140, distancePct: 0.42, driftAngle: 72 }, // Outer Wall 1
      { x: 440, y: 140, speed: 130, distancePct: 0.65, driftAngle: 60 }, // Inner Clip 1
      { x: 680, y: 320, speed: 125, distancePct: 0.88, driftAngle: 68 }, // Outer Wall 2
      { x: 380, y: 400, speed: 90, distancePct: 1.0, driftAngle: 30 },   // Finish line box
    ],
    clippingZones: [
      { id: 'oz1', name: 'Outer Wall 1 Ride', type: 'OUTER_ZONE', x: 270, y: 260, radius: 22 },
      { id: 'ic1', name: 'Inner Clip 1', type: 'INNER_CLIP', x: 440, y: 140, radius: 16 },
      { id: 'oz2', name: 'Outer Wall 2 Grandstand', type: 'OUTER_ZONE', x: 680, y: 320, radius: 22 },
    ],
  },

  utah_drift: {
    id: 'utah_drift',
    name: 'Utah Motorsports Campus (Formula DRIFT Round 6)',
    location: 'Grantsville, Utah',
    country: 'United States',
    lapLengthKm: 1.300,
    turns: 6,
    category: 'DRIFT',
    stageType: 'DRIFT_ARENA',
    isPointToPoint: true,
    startLabel: 'START SPEED RUNWAY',
    finishLabel: 'INFIELD FINISH GATE',
    lapRecord: {
      time: '97.5 Points',
      driver: 'Ryan Tuerck (Mobil 1 GR Corolla)',
      year: 2024,
    },
    surfaceType: 'ASPHALT',
    pathData: 'M 100,410 L 220,410 C 260,410 290,360 270,280 C 250,200 330,150 450,150 L 590,160 C 690,170 720,250 670,320 C 620,380 520,390 390,390',
    keyCoordinates: [
      { x: 100, y: 410, speed: 155, distancePct: 0, driftAngle: 0 },
      { x: 220, y: 410, speed: 168, distancePct: 0.2, driftAngle: 52 },
      { x: 270, y: 280, speed: 145, distancePct: 0.45, driftAngle: 72 },
      { x: 450, y: 150, speed: 135, distancePct: 0.68, driftAngle: 64 },
      { x: 670, y: 320, speed: 125, distancePct: 0.88, driftAngle: 66 },
      { x: 390, y: 390, speed: 90, distancePct: 1.0, driftAngle: 30 },
    ],
    clippingZones: [
      { id: 'oz1', name: 'Outer Zone 1 High Speed Wall', type: 'OUTER_ZONE', x: 270, y: 280, radius: 22 },
      { id: 'ic1', name: 'Inner Clip 1 Transition Apex', type: 'INNER_CLIP', x: 450, y: 150, radius: 16 },
      { id: 'oz2', name: 'Outer Zone 2 Infield Arc', type: 'OUTER_ZONE', x: 670, y: 320, radius: 22 },
    ],
  },

  // ==========================================
  // 4. MOTOGP (Category: 'MOTOGP')
  // ==========================================
  mugello: {
    id: 'mugello',
    name: 'Autodromo Internazionale del Mugello (Tuscan Cathedral)',
    location: 'Scarperia e San Piero, Tuscany',
    country: 'Italy',
    lapLengthKm: 5.245,
    turns: 15,
    category: 'MOTOGP',
    lapRecord: {
      time: '1:44.504',
      driver: 'Jorge Martín (Ducati GP24)',
      year: 2024,
    },
    surfaceType: 'ASPHALT',
    pathData: 'M 190,410 L 210,210 L 320,160 L 450,140 L 590,160 L 670,240 L 640,340 L 510,390 L 370,430 L 240,440 Z',
    keyCoordinates: [
      { x: 190, y: 410, speed: 363, distancePct: 0, leanAngle: 0 },    // 1.14km Main Straight (360+ km/h crest)
      { x: 210, y: 210, speed: 110, distancePct: 0.15, leanAngle: 62 }, // San Donato heavy braking
      { x: 320, y: 160, speed: 190, distancePct: 0.3, leanAngle: 64 },  // Luco & Poggio Secco
      { x: 450, y: 140, speed: 240, distancePct: 0.48, leanAngle: 65 }, // Casanova & Savelli
      { x: 590, y: 160, speed: 215, distancePct: 0.65, leanAngle: 65 }, // Arrabbiata 1 & 2 (High-G Blind Crest)
      { x: 670, y: 240, speed: 130, distancePct: 0.8, leanAngle: 60 },  // Scarperia & Palagio
      { x: 640, y: 340, speed: 175, distancePct: 0.9, leanAngle: 62 },  // Correntaio
      { x: 510, y: 390, speed: 220, distancePct: 0.97, leanAngle: 58 }, // Biondetti & Bucine onto Straight
    ],
  },

  assen: {
    id: 'assen',
    name: 'TT Circuit Assen (The Cathedral of Speed)',
    location: 'Assen, Drenthe',
    country: 'Netherlands',
    lapLengthKm: 4.542,
    turns: 18,
    category: 'MOTOGP',
    lapRecord: {
      time: '1:31.504',
      driver: 'Francesco Bagnaia (Ducati Lenovo)',
      year: 2024,
    },
    surfaceType: 'ASPHALT',
    pathData: 'M 210,420 L 210,230 L 310,180 L 440,150 L 570,160 L 690,200 L 680,310 L 590,360 L 480,420 L 320,430 Z',
    keyCoordinates: [
      { x: 210, y: 420, speed: 310, distancePct: 0, leanAngle: 0 },
      { x: 210, y: 230, speed: 120, distancePct: 0.18, leanAngle: 61 }, // Haarbocht
      { x: 440, y: 150, speed: 215, distancePct: 0.42, leanAngle: 65 }, // Strubben & Ruskenhoek
      { x: 690, y: 200, speed: 275, distancePct: 0.68, leanAngle: 66 }, // Ramshoek high-speed sweeper
      { x: 590, y: 360, speed: 90, distancePct: 0.92, leanAngle: 60 },  // Geert Timmer Chicane
    ],
  },

  jerez_motogp: {
    id: 'jerez_motogp',
    name: 'Circuito de Jerez - Ángel Nieto (Spanish GP)',
    location: 'Jerez de la Frontera, Andalusia',
    country: 'Spain',
    lapLengthKm: 4.423,
    turns: 13,
    category: 'MOTOGP',
    lapRecord: {
      time: '1:36.025',
      driver: 'Marc Márquez (Ducati GP23)',
      year: 2024,
    },
    surfaceType: 'ASPHALT',
    pathData: 'M 200,410 L 210,250 L 300,190 L 430,160 L 560,180 L 670,240 L 650,350 L 530,400 L 360,430 Z',
    keyCoordinates: [
      { x: 200, y: 410, speed: 295, distancePct: 0, leanAngle: 0 },
      { x: 210, y: 250, speed: 95, distancePct: 0.15, leanAngle: 62 },  // Expo 92
      { x: 430, y: 160, speed: 240, distancePct: 0.45, leanAngle: 64 }, // Curva Sito Pons
      { x: 670, y: 240, speed: 225, distancePct: 0.72, leanAngle: 65 }, // Alex Crivillé & Ferrari
      { x: 530, y: 400, speed: 80, distancePct: 0.94, leanAngle: 61 },  // Jorge Lorenzo Hairpin
    ],
  },

  phillipisland_motogp: {
    id: 'phillipisland_motogp',
    name: 'Phillip Island Grand Prix Circuit (Oceanfront Thriller)',
    location: 'Phillip Island, Victoria',
    country: 'Australia',
    lapLengthKm: 4.448,
    turns: 12,
    category: 'MOTOGP',
    lapRecord: {
      time: '1:27.246',
      driver: 'Jorge Martín (Pramac Ducati)',
      year: 2023,
    },
    surfaceType: 'ASPHALT',
    pathData: 'M 220,410 L 220,220 L 320,160 L 480,140 L 620,160 L 700,240 L 650,360 L 510,420 L 350,430 Z',
    keyCoordinates: [
      { x: 220, y: 410, speed: 345, distancePct: 0, leanAngle: 0 },    // Gardner Straight
      { x: 220, y: 220, speed: 220, distancePct: 0.15, leanAngle: 64 }, // Doohan Corner
      { x: 320, y: 160, speed: 180, distancePct: 0.3, leanAngle: 63 },  // Southern Loop
      { x: 480, y: 140, speed: 65, distancePct: 0.5, leanAngle: 58 },   // Miller Corner (Honda Hairpin)
      { x: 700, y: 240, speed: 210, distancePct: 0.75, leanAngle: 65 }, // Lukey Heights downhill
      { x: 510, y: 420, speed: 235, distancePct: 0.92, leanAngle: 64 }, // Swan Corner onto Gardner Straight
    ],
  },

  // ==========================================
  // 5. WORLDSBK (Category: 'WSBK')
  // ==========================================
  misano: {
    id: 'misano',
    name: 'Misano World Circuit Marco Simoncelli (WorldSBK Riviera)',
    location: 'Misano Adriatico, Rimini',
    country: 'Italy',
    lapLengthKm: 4.226,
    turns: 16,
    category: 'WSBK',
    lapRecord: {
      time: '1:32.320',
      driver: 'Toprak Razgatlıoğlu (BMW M 1000 RR)',
      year: 2024,
    },
    surfaceType: 'ASPHALT',
    pathData: 'M 210,400 L 210,230 L 300,190 L 400,160 L 530,150 L 660,180 L 680,290 L 590,320 L 520,410 L 380,410 Z',
    keyCoordinates: [
      { x: 210, y: 400, speed: 290, distancePct: 0, leanAngle: 0 },
      { x: 210, y: 230, speed: 105, distancePct: 0.18, leanAngle: 60 }, // Variante del Parco
      { x: 300, y: 190, speed: 145, distancePct: 0.32, leanAngle: 63 }, // Rio
      { x: 530, y: 150, speed: 285, distancePct: 0.55, leanAngle: 62 }, // Curvone (Fastest right hander)
      { x: 680, y: 290, speed: 90, distancePct: 0.78, leanAngle: 58 },  // Tramonto hairpin
      { x: 520, y: 410, speed: 110, distancePct: 0.92, leanAngle: 62 }, // Misano corner onto straight
    ],
  },

  donington_wsbk: {
    id: 'donington_wsbk',
    name: 'Donington Park Circuit (Prosecco DOC UK Round)',
    location: 'Castle Donington, Leicestershire',
    country: 'United Kingdom',
    lapLengthKm: 4.023,
    turns: 12,
    category: 'WSBK',
    lapRecord: {
      time: '1:25.505',
      driver: 'Toprak Razgatlıoğlu (BMW M 1000 RR)',
      year: 2024,
    },
    surfaceType: 'ASPHALT',
    pathData: 'M 220,410 L 220,240 L 330,180 L 470,150 L 600,160 L 680,250 L 620,350 L 500,420 L 340,430 Z',
    keyCoordinates: [
      { x: 220, y: 410, speed: 275, distancePct: 0, leanAngle: 0 },
      { x: 220, y: 240, speed: 120, distancePct: 0.16, leanAngle: 61 }, // Redgate
      { x: 470, y: 150, speed: 230, distancePct: 0.45, leanAngle: 64 }, // Craner Curves downhill swoops
      { x: 680, y: 250, speed: 105, distancePct: 0.75, leanAngle: 59 }, // Coppice & Starkey's
      { x: 500, y: 420, speed: 85, distancePct: 0.94, leanAngle: 58 },  // Melbourne Hairpin & Goddards
    ],
  },

  portimao_wsbk: {
    id: 'portimao_wsbk',
    name: 'Autódromo Internacional do Algarve (Portimão Rollercoaster)',
    location: 'Portimão, Algarve',
    country: 'Portugal',
    lapLengthKm: 4.592,
    turns: 15,
    category: 'WSBK',
    lapRecord: {
      time: '1:39.825',
      driver: 'Toprak Razgatlıoğlu (BMW M 1000 RR)',
      year: 2024,
    },
    surfaceType: 'ASPHALT',
    pathData: 'M 200,410 L 200,230 L 310,170 L 440,150 L 580,170 L 680,230 L 650,340 L 520,400 L 360,430 Z',
    keyCoordinates: [
      { x: 200, y: 410, speed: 310, distancePct: 0, leanAngle: 0 },
      { x: 200, y: 230, speed: 110, distancePct: 0.15, leanAngle: 61 }, // Primeiral
      { x: 440, y: 150, speed: 225, distancePct: 0.45, leanAngle: 64 }, // Craig Jones Blind Crest
      { x: 680, y: 230, speed: 100, distancePct: 0.72, leanAngle: 60 }, // Torre VIP
      { x: 520, y: 400, speed: 230, distancePct: 0.92, leanAngle: 65 }, // Galp Downhill Drop onto Straight
    ],
  },

  // ==========================================
  // 6. WRC RALLY (Category: 'WRC') - Point-to-Point Authentic Stages
  // ==========================================
  ouninpohja: {
    id: 'ouninpohja',
    name: 'Rally Finland: Ouninpohja Special Stage (22.4 km)',
    location: 'Jyväskylä, Central Finland',
    country: 'Finland',
    lapLengthKm: 22.400,
    turns: 88,
    category: 'WRC',
    stageType: 'SPECIAL_STAGE',
    isPointToPoint: true,
    startLabel: 'SS1 OUNINPOHJA STAGE START (0.0 km)',
    finishLabel: 'FLYING FINISH & STOP CONTROL (22.4 km)',
    lapRecord: {
      time: '11:06.4',
      driver: 'Kalle Rovanperä (Toyota GR Yaris Rally1)',
      year: 2024,
    },
    elevationMeters: 140,
    surfaceType: 'GRAVEL',
    pathData: 'M 70,390 L 150,360 L 210,340 C 240,320 260,280 230,240 C 200,200 230,170 290,180 L 390,200 C 440,210 470,160 520,140 L 610,130 C 660,130 690,170 660,220 L 590,270 C 560,300 580,350 640,360 L 720,380 L 790,390',
    keyCoordinates: [
      { x: 70, y: 390, speed: 195, distancePct: 0 },     // Stage Start Forest Corridor
      { x: 210, y: 340, speed: 180, distancePct: 0.18 }, // Yellow House Jump (50m Airborne)
      { x: 230, y: 240, speed: 130, distancePct: 0.32 }, // Kakaristo Hairpin Junction
      { x: 390, y: 200, speed: 200, distancePct: 0.48 }, // 200 km/h Gravel Rollercoaster Straight
      { x: 520, y: 140, speed: 185, distancePct: 0.65 }, // Mutanen Crest Blind Jump
      { x: 660, y: 220, speed: 125, distancePct: 0.8 },  // Pine Forest Technical S-Bends
      { x: 790, y: 390, speed: 190, distancePct: 1.0 },  // Flying Finish Gate
    ],
    splits: [
      { name: 'Split 1', distancePct: 0.28, label: 'Split 1 (6.2 km)', x: 260, y: 210 },
      { name: 'Split 2', distancePct: 0.58, label: 'Split 2 (13.1 km)', x: 470, y: 155 },
      { name: 'Split 3', distancePct: 0.84, label: 'Split 3 (18.8 km)', x: 620, y: 310 },
    ],
  },

  turini: {
    id: 'turini',
    name: 'Rallye Monte-Carlo: Col de Turini Mountain Pass (1,607m)',
    location: 'Alpes-Maritimes, French Riviera',
    country: 'Monaco / France',
    lapLengthKm: 18.300,
    turns: 64,
    category: 'WRC',
    stageType: 'SPECIAL_STAGE',
    isPointToPoint: true,
    startLabel: 'SS14 LA BOLLÈNE-VÉSUBIE START (0.0 km)',
    finishLabel: 'COL DE TURINI SUMMIT FINISH (18.3 km)',
    lapRecord: {
      time: '12:44.2',
      driver: 'Thierry Neuville (Hyundai i20 N Rally1)',
      year: 2024,
    },
    elevationMeters: 850,
    surfaceType: 'ASPHALT',
    pathData: 'M 75,430 L 140,400 C 180,380 190,340 140,330 C 90,320 110,280 160,270 C 210,260 240,230 200,210 C 160,190 190,160 250,150 L 360,160 C 420,170 460,130 520,120 C 580,110 620,150 590,200 C 560,250 610,290 660,280 C 710,270 730,330 690,360 L 760,400 L 795,410',
    keyCoordinates: [
      { x: 75, y: 430, speed: 150, distancePct: 0 },     // Mountain Valley Start
      { x: 140, y: 330, speed: 60, distancePct: 0.18 },  // Hairpin Series 1 (Black Ice Hazard)
      { x: 200, y: 210, speed: 70, distancePct: 0.35 },  // Cliffside Switchback 3
      { x: 360, y: 160, speed: 165, distancePct: 0.52 }, // Mountain Ridge Tunnel Acceleration
      { x: 590, y: 200, speed: 65, distancePct: 0.72 },  // Turini Summit Hairpin & Spectator Area
      { x: 690, y: 360, speed: 135, distancePct: 0.88 }, // Downhill Canyon Sprint
      { x: 795, y: 410, speed: 160, distancePct: 1.0 },  // Flying Finish
    ],
    splits: [
      { name: 'Split 1', distancePct: 0.3, label: 'Split 1 (5.4 km)', x: 180, y: 240 },
      { name: 'Split 2', distancePct: 0.6, label: 'Split 2 (11.0 km)', x: 440, y: 140 },
      { name: 'Split 3', distancePct: 0.85, label: 'Split 3 (15.5 km)', x: 680, y: 320 },
    ],
  },

  safari_kenya: {
    id: 'safari_kenya',
    name: 'Safari Rally Kenya: Naivasha Geothermal Stage (29.3 km)',
    location: 'Great Rift Valley, Naivasha',
    country: 'Kenya',
    lapLengthKm: 29.320,
    turns: 74,
    category: 'WRC',
    stageType: 'SPECIAL_STAGE',
    isPointToPoint: true,
    startLabel: 'SS7 NAIVASHA GEOTHERMAL START (0.0 km)',
    finishLabel: 'HELL\'S GATE FLYING FINISH (29.3 km)',
    lapRecord: {
      time: '14:20.8',
      driver: 'Kalle Rovanperä (Toyota GR Yaris)',
      year: 2024,
    },
    elevationMeters: 220,
    surfaceType: 'GRAVEL',
    pathData: 'M 70,410 L 160,370 L 250,320 C 310,290 330,230 290,190 C 250,150 300,110 380,120 L 510,130 C 580,140 610,200 570,250 C 530,300 580,350 660,330 L 740,300 L 795,310',
    keyCoordinates: [
      { x: 70, y: 410, speed: 185, distancePct: 0 },     // Dust Cloud Launch
      { x: 250, y: 320, speed: 70, distancePct: 0.22 },  // Deep Fesh-Fesh Soft Sand Rut
      { x: 380, y: 120, speed: 195, distancePct: 0.46 }, // Sleeping Warrior High-Speed Plain Straight
      { x: 570, y: 250, speed: 85, distancePct: 0.68 },  // Volcanic Rocky Ravine Crossing
      { x: 660, y: 330, speed: 175, distancePct: 0.85 }, // Wildlife Plains Flying Sprint
      { x: 795, y: 310, speed: 180, distancePct: 1.0 },  // Hell's Gate Finish Line
    ],
    splits: [
      { name: 'Split 1', distancePct: 0.25, label: 'Split 1 (7.3 km)', x: 270, y: 270 },
      { name: 'Split 2', distancePct: 0.55, label: 'Split 2 (16.2 km)', x: 450, y: 125 },
      { name: 'Split 3', distancePct: 0.82, label: 'Split 3 (24.0 km)', x: 630, y: 320 },
    ],
  },

  sweden_snow: {
    id: 'sweden_snow',
    name: 'Rally Sweden: Umeå Frozen Forest Stage (24.8 km)',
    location: 'Västerbotten, Umeå',
    country: 'Sweden',
    lapLengthKm: 24.800,
    turns: 62,
    category: 'WRC',
    stageType: 'SPECIAL_STAGE',
    isPointToPoint: true,
    startLabel: 'SS10 UMEÅ SPRINT START (0.0 km)',
    finishLabel: 'RED BARN ARENA FLYING FINISH (24.8 km)',
    lapRecord: {
      time: '11:42.5',
      driver: 'Esapekka Lappi (Hyundai i20 N)',
      year: 2024,
    },
    elevationMeters: 90,
    surfaceType: 'SNOW',
    pathData: 'M 75,410 L 170,370 C 230,340 250,280 200,240 C 150,200 200,150 280,150 L 400,170 C 470,180 510,130 590,130 C 670,130 690,200 640,250 C 590,300 630,360 710,370 L 795,390',
    keyCoordinates: [
      { x: 75, y: 410, speed: 180, distancePct: 0 },     // Studded Tire Ice Launch
      { x: 200, y: 240, speed: 155, distancePct: 0.22 }, // High-Speed Snow Bank Lean
      { x: 280, y: 150, speed: 195, distancePct: 0.42 }, // Colin's Crest 45m Airborne Jump
      { x: 590, y: 130, speed: 90, distancePct: 0.68 },  // Narrow Pine Forest Junction
      { x: 640, y: 250, speed: 170, distancePct: 0.82 }, // Frozen River Ice Flat-out
      { x: 795, y: 390, speed: 165, distancePct: 1.0 },  // Red Barn Arena Finish Jump
    ],
    splits: [
      { name: 'Split 1', distancePct: 0.28, label: 'Split 1 (6.9 km)', x: 220, y: 210 },
      { name: 'Split 2', distancePct: 0.58, label: 'Split 2 (14.4 km)', x: 490, y: 160 },
      { name: 'Split 3', distancePct: 0.85, label: 'Split 3 (21.0 km)', x: 670, y: 330 },
    ],
  },

  // ==========================================
  // 7. SUPERCARS V8 (Category: 'SUPERCARS')
  // ==========================================
  bathurst: {
    id: 'bathurst',
    name: 'Mount Panorama Circuit (Bathurst 1000)',
    location: 'Bathurst, New South Wales',
    country: 'Australia',
    lapLengthKm: 6.213,
    turns: 23,
    category: 'SUPERCARS',
    lapRecord: {
      time: '1:56.605',
      driver: 'Jules Gounon (Mercedes-AMG GT3)',
      year: 2024,
    },
    elevationMeters: 174,
    surfaceType: 'ASPHALT',
    pathData: 'M 180,410 L 220,290 L 310,210 L 460,150 L 590,130 L 680,180 L 650,270 L 540,320 L 420,380 L 310,430 Z',
    keyCoordinates: [
      { x: 180, y: 410, speed: 280, distancePct: 0 },   // Mountain Straight
      { x: 220, y: 290, speed: 115, distancePct: 0.18 }, // Hell Corner & The Cutting
      { x: 310, y: 210, speed: 195, distancePct: 0.35 }, // Reid Park & Sulman Park
      { x: 460, y: 150, speed: 210, distancePct: 0.5 },  // McPhillamy Park & Brock's Skyline
      { x: 590, y: 130, speed: 120, distancePct: 0.62 }, // The Esses & The Dipper
      { x: 680, y: 180, speed: 165, distancePct: 0.72 }, // Forrest's Elbow
      { x: 650, y: 270, speed: 300, distancePct: 0.85 }, // Conrod Straight 1.9km
      { x: 540, y: 320, speed: 140, distancePct: 0.94 }, // The Chase (Fastest chicane in motorsport)
      { x: 420, y: 380, speed: 100, distancePct: 0.98 }, // Murray's Corner
    ],
  },

  goldcoast_supercars: {
    id: 'goldcoast_supercars',
    name: 'Surfers Paradise Street Circuit (Boost Mobile Gold Coast 500)',
    location: 'Surfers Paradise, Queensland',
    country: 'Australia',
    lapLengthKm: 2.960,
    turns: 15,
    category: 'SUPERCARS',
    lapRecord: {
      time: '1:10.085',
      driver: 'Broc Feeney (Red Bull Camaro)',
      year: 2024,
    },
    surfaceType: 'STREET',
    pathData: 'M 200,410 L 200,200 L 290,140 L 450,140 L 600,190 L 680,290 L 610,390 L 440,420 Z',
    keyCoordinates: [
      { x: 200, y: 410, speed: 270, distancePct: 0 },
      { x: 200, y: 200, speed: 110, distancePct: 0.2 },  // Beach Chicane Kerb Hopping
      { x: 450, y: 140, speed: 265, distancePct: 0.48 }, // Main Beach Parade
      { x: 680, y: 290, speed: 95, distancePct: 0.75 },  // Ana Street Hairpin
      { x: 440, y: 420, speed: 120, distancePct: 0.92 }, // Pit Entry Chicane
    ],
  },

  albertpark_supercars: {
    id: 'albertpark_supercars',
    name: 'Albert Park Circuit (MSS Security Melbourne SuperSprint)',
    location: 'Melbourne, Victoria',
    country: 'Australia',
    lapLengthKm: 5.278,
    turns: 14,
    category: 'SUPERCARS',
    lapRecord: {
      time: '1:46.330',
      driver: 'Chaz Mostert (WAU Mustang)',
      year: 2024,
    },
    surfaceType: 'STREET',
    pathData: 'M 210,410 L 210,240 L 310,180 L 440,150 L 590,160 L 690,230 L 640,340 L 500,410 L 340,430 Z',
    keyCoordinates: [
      { x: 210, y: 410, speed: 285, distancePct: 0 },
      { x: 210, y: 240, speed: 115, distancePct: 0.16 }, // Jones Turn 1
      { x: 440, y: 150, speed: 245, distancePct: 0.45 }, // Lakeside High-Speed Swoop
      { x: 690, y: 230, speed: 265, distancePct: 0.75 }, // Turns 9-10 Flatout Chicanes
      { x: 500, y: 410, speed: 95, distancePct: 0.93 },  // Waite & Prost Corners
    ],
  },

  // ==========================================
  // 8. DTM GT3 SPRINT (Category: 'DTM')
  // ==========================================
  nurburgring_dtm: {
    id: 'nurburgring_dtm',
    name: 'Nürburgring GP Sprint Circuit (DTM Eifel Sprint)',
    location: 'Nürburg, Eifel',
    country: 'Germany',
    lapLengthKm: 3.629,
    turns: 11,
    category: 'DTM',
    lapRecord: {
      time: '1:25.132',
      driver: 'Mirko Bortolotti (Lamborghini Huracán GT3)',
      year: 2024,
    },
    surfaceType: 'ASPHALT',
    pathData: 'M 200,400 L 200,240 L 290,170 L 420,150 L 560,170 L 670,250 L 650,350 L 520,410 L 350,420 Z',
    keyCoordinates: [
      { x: 200, y: 400, speed: 265, distancePct: 0 },
      { x: 200, y: 240, speed: 85, distancePct: 0.16 },  // Yokohama S / Castrol-S
      { x: 420, y: 150, speed: 220, distancePct: 0.45 }, // Ford-Kurve
      { x: 670, y: 250, speed: 240, distancePct: 0.72 }, // Kumho-Kurve
      { x: 520, y: 410, speed: 90, distancePct: 0.92 },  // NGK Chicane
    ],
  },

  norisring: {
    id: 'norisring',
    name: 'Norisring Speedweekend (Franconian Monaco)',
    location: 'Nuremberg, Bavaria',
    country: 'Germany',
    lapLengthKm: 2.300,
    turns: 8,
    category: 'DTM',
    lapRecord: {
      time: '0:48.210',
      driver: 'Kelvin van der Linde (Audi R8 LMS)',
      year: 2024,
    },
    surfaceType: 'STREET',
    pathData: 'M 210,380 L 210,160 C 220,120 270,110 330,120 L 580,120 C 640,120 680,140 690,180 L 690,380 C 680,430 630,440 570,440 L 330,440 C 270,440 220,430 210,380 Z',
    keyCoordinates: [
      { x: 210, y: 380, speed: 270, distancePct: 0 },    // Zeppelinhaupttribüne straight (270 km/h)
      { x: 210, y: 160, speed: 55, distancePct: 0.25 },  // Grundig Hairpin (heavy ABS braking)
      { x: 580, y: 120, speed: 245, distancePct: 0.55 }, // Schöller S (Wall scraping)
      { x: 690, y: 180, speed: 260, distancePct: 0.75 }, // Dutzendteich straight
      { x: 570, y: 440, speed: 60, distancePct: 0.92 },  // Dutzendteich Kehre hairpin
    ],
  },

  hockenheimring_dtm: {
    id: 'hockenheimring_dtm',
    name: 'Hockenheimring Baden-Württemberg (DTM Season Finale)',
    location: 'Hockenheim, Baden-Württemberg',
    country: 'Germany',
    lapLengthKm: 4.574,
    turns: 17,
    category: 'DTM',
    lapRecord: {
      time: '1:28.450',
      driver: 'Thomas Preining (Manthey Porsche 911 GT3 R)',
      year: 2024,
    },
    surfaceType: 'ASPHALT',
    pathData: 'M 200,410 L 200,230 L 320,170 L 460,140 L 600,150 L 690,230 L 640,350 L 510,420 L 330,430 Z',
    keyCoordinates: [
      { x: 200, y: 410, speed: 275, distancePct: 0 },
      { x: 200, y: 230, speed: 190, distancePct: 0.15 }, // Nordkurve
      { x: 460, y: 140, speed: 280, distancePct: 0.45 }, // Parabolika
      { x: 690, y: 230, speed: 65, distancePct: 0.72 },  // Spitzkehre Hairpin
      { x: 510, y: 420, speed: 135, distancePct: 0.93 }, // Motodrom Stadium entry
    ],
  },

  // ==========================================
  // 9. INDYCAR (Category: 'INDYCAR')
  // ==========================================
  indianapolis: {
    id: 'indianapolis',
    name: 'Indianapolis Motor Speedway (The Brickyard 2.5-Mile Oval)',
    location: 'Speedway, Indiana',
    country: 'United States',
    lapLengthKm: 4.023,
    turns: 4,
    category: 'INDYCAR',
    lapRecord: {
      time: '0:37.895 (237.498 MPH)',
      driver: 'Arie Luyendyk (Reynard-Ford)',
      year: 1996,
    },
    surfaceType: 'BANKED_OVAL',
    pathData: 'M 220,400 L 220,160 C 230,120 280,100 340,100 L 580,100 C 640,100 690,120 700,160 L 700,400 C 690,440 640,460 580,460 L 340,460 C 280,460 230,440 220,400 Z',
    keyCoordinates: [
      { x: 220, y: 400, speed: 386, distancePct: 0 },    // Yard of Bricks / Front Straight (240 MPH)
      { x: 220, y: 160, speed: 370, distancePct: 0.25 }, // Turn 1 (9.2° banking) & Short Chute
      { x: 340, y: 100, speed: 382, distancePct: 0.4 },  // Turn 2 onto Backstretch
      { x: 580, y: 100, speed: 386, distancePct: 0.65 }, // Backstretch 5/8-mile (242 MPH)
      { x: 700, y: 160, speed: 372, distancePct: 0.8 },  // Turn 3 & South Short Chute
      { x: 580, y: 460, speed: 375, distancePct: 0.95 }, // Turn 4 onto Front Straight
    ],
  },

  lagunaseca_indy: {
    id: 'lagunaseca_indy',
    name: 'WeatherTech Raceway Laguna Seca (Firestone GP of Monterey)',
    location: 'Monterey, California',
    country: 'United States',
    lapLengthKm: 3.602,
    turns: 11,
    category: 'INDYCAR',
    lapRecord: {
      time: '1:06.461',
      driver: 'Alex Palou (Chip Ganassi Racing)',
      year: 2024,
    },
    surfaceType: 'ASPHALT',
    pathData: 'M 190,400 L 190,220 L 280,160 L 410,140 L 540,150 L 670,200 L 680,310 L 580,360 L 460,420 L 310,430 Z',
    keyCoordinates: [
      { x: 190, y: 400, speed: 290, distancePct: 0 },
      { x: 190, y: 220, speed: 110, distancePct: 0.15 }, // Andretti Hairpin
      { x: 410, y: 140, speed: 240, distancePct: 0.38 }, // Turn 5 & 6 uphill
      { x: 670, y: 200, speed: 115, distancePct: 0.65 }, // The Corkscrew (Turn 8 & 8A 5.5-story drop)
      { x: 580, y: 360, speed: 180, distancePct: 0.82 }, // Rainey Curve
      { x: 460, y: 420, speed: 85, distancePct: 0.95 },  // Turn 11 onto Front Straight
    ],
  },

  roadamerica_indy: {
    id: 'roadamerica_indy',
    name: 'Road America (XPEL Grand Prix at Elkhart Lake)',
    location: 'Elkhart Lake, Wisconsin',
    country: 'United States',
    lapLengthKm: 6.515,
    turns: 14,
    category: 'INDYCAR',
    lapRecord: {
      time: '1:40.119',
      driver: 'Dario Franchitti (Team Green)',
      year: 2000,
    },
    surfaceType: 'ASPHALT',
    pathData: 'M 190,410 L 220,250 L 320,180 L 460,150 L 600,160 L 690,240 L 640,360 L 500,420 L 340,430 Z',
    keyCoordinates: [
      { x: 190, y: 410, speed: 320, distancePct: 0 },    // Frontstretch uphill
      { x: 220, y: 250, speed: 175, distancePct: 0.16 }, // Turn 1 & 3
      { x: 460, y: 150, speed: 120, distancePct: 0.45 }, // Turn 5 Hairpin
      { x: 690, y: 240, speed: 280, distancePct: 0.72 }, // The Kink (180+ MPH blind crest)
      { x: 500, y: 420, speed: 200, distancePct: 0.93 }, // Canada Corner & Turn 14
    ],
  },
};
