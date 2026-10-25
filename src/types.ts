export type MotorsportCategory = 
  | 'F1' 
  | 'WEC' 
  | 'WRC' 
  | 'DRIFT' 
  | 'DTM' 
  | 'MOTOGP' 
  | 'WSBK' 
  | 'INDYCAR' 
  | 'SUPERCARS'
  | 'GTWORLD';

export interface MotorsportCategoryInfo {
  id: MotorsportCategory;
  name: string;
  shortCode: string;
  tagline: string;
  governingBody: string;
  badgeColor: string;
  flagshipEvent: string;
  machineryType: string;
  powerOutput: string;
  topSpeed: string;
  championshipLeader: {
    name: string;
    team: string;
    points: number | string;
    vehicle: string;
  };
  constructorLeader: {
    name: string;
    points: number | string;
  };
  keyRegulations: string[];
  signatureCircuits: string[];
  description: string;
  imageUrl: string;
}

export interface Driver {
  driverId: string;
  code?: string;
  driverNumber?: number | string;
  permanentNumber?: string;
  givenName: string;
  familyName: string;
  fullName: string;
  nationality: string;
  dateOfBirth?: string;
  url?: string;
  headshotUrl?: string;
  constructorId?: string;
  constructorName?: string;
  teamColor?: string;
  accentColor?: string;
  biography?: string;
  podiums?: number;
  careerWins?: number;
  championships?: number;
  category?: MotorsportCategory;
  racingClass?: string; // 'GT3' | 'GT4' | 'Pro' | 'Silver' | 'Pro-Am' | 'Am'
  driverRating?: 'Platinum' | 'Gold' | 'Silver' | 'Bronze' | string;
}

export interface Constructor {
  constructorId: string;
  name: string;
  nationality: string;
  url?: string;
  color: string;
  secondaryColor?: string;
  powerUnit?: string;
  teamPrincipal?: string;
  championships?: number;
  headquarters?: string;
  carModel?: string;
  category?: MotorsportCategory;
  racingClass?: string;
}

export interface Race {
  season: string | number;
  round: number;
  url?: string;
  raceName: string;
  circuitName: string;
  circuitId: string;
  locality?: string;
  country?: string;
  date: string;
  time?: string;
  category?: MotorsportCategory;
  winner?: {
    driverId: string;
    fullName: string;
    constructorName: string;
    time?: string;
  };
  fastestLap?: {
    driverName: string;
    lapTime: string;
    lapNumber: number;
  };
  totalLaps?: number;
  isCompleted?: boolean;
}

export interface RaceResult {
  number: string | number;
  position: number | string;
  positionText: string;
  points: number;
  driver: Driver;
  constructor: Constructor;
  grid: number | string;
  laps: number;
  status: string;
  time?: {
    millis?: string;
    time?: string;
  };
  fastestLap?: {
    rank?: string;
    lap?: string;
    time?: {
      time: string;
    };
    averageSpeed?: {
      units: string;
      speed: string;
    };
  };
}

export interface DriverStanding {
  position: number;
  positionText: string;
  points: number;
  wins: number;
  driver: Driver;
  constructors: Constructor[];
  racingClass?: string;
  driverRating?: string;
}

export interface ConstructorStanding {
  position: number;
  positionText: string;
  points: number;
  wins: number;
  constructor: Constructor;
}

export interface SeasonMetrics {
  year: number;
  totalRaces: number;
  completedRaces: number;
  championDriver?: string;
  championConstructor?: string;
  mostWinsDriver?: { name: string; count: number };
  mostPolesDriver?: { name: string; count: number };
  leadingTeam?: string;
}

export interface CategorySeasonData {
  category: MotorsportCategory;
  year: number;
  driverStandings: DriverStanding[];
  constructorStandings: ConstructorStanding[];
  races: Race[];
  metrics: SeasonMetrics;
  dataAvailability?: 'live' | 'snapshot' | 'unavailable';
  dataSource?: string;
  lastUpdated?: string;
}

export interface TrackCoordinate {
  x: number;
  y: number;
  speed?: number;
  distancePct?: number;
  leanAngle?: number; // For MotoGP
  driftAngle?: number; // For Formula Drift
}

export interface CircuitInfo {
  id: string;
  name: string;
  location: string;
  country: string;
  lapLengthKm: number;
  turns: number;
  category?: MotorsportCategory | 'ALL';
  lapRecord?: {
    time: string;
    driver: string;
    year: number;
  };
  pathData: string; // SVG path string
  keyCoordinates: TrackCoordinate[];
  drsZones?: number;
  elevationMeters?: number;
  surfaceType?: 'ASPHALT' | 'GRAVEL' | 'SNOW' | 'STREET' | 'BANKED_OVAL';
  isPointToPoint?: boolean;
  stageType?: 'CIRCUIT' | 'SPECIAL_STAGE' | 'DRIFT_ARENA' | 'OVAL';
  startLabel?: string;
  finishLabel?: string;
  splits?: { name: string; distancePct: number; label: string; x: number; y: number }[];
  clippingZones?: { id: string; name: string; type: 'OUTER_ZONE' | 'INNER_CLIP' | 'TOUCH_AND_GO'; x: number; y: number; radius?: number }[];
}

export interface CarTelemetryState {
  driverId: string;
  code: string;
  number: number | string;
  name: string;
  team: string;
  color: string;
  position: number;
  lap: number;
  x: number;
  y: number;
  speedKmh: number;
  gear: number;
  throttlePct: number;
  brakePct: number;
  drsActive: boolean;
  tireCompound: 'SOFT' | 'MEDIUM' | 'HARD' | 'INTERMEDIATE' | 'WET';
  gapToLeader: string;
  interval: string;
  lastLapTime: string;
  status: 'TRACK' | 'PIT' | 'OUT';
  category?: MotorsportCategory;
  // Specific specialized sensors
  driftAngleDeg?: number;
  leanAngleDeg?: number;
  stintEnergyMJ?: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  body?: string;
  publishedAt: string;
  source: string;
  url: string;
  category: 'TECH' | 'RACE' | 'FIA' | 'TRANSFERS' | 'INTERVIEW' | 'ENDURANCE' | 'DRIFT' | 'RALLY' | 'BIKES' | string;
  discipline: MotorsportCategory;
  imageUrl?: string;
}

export interface RaceIncident {
  id: string;
  lap: number;
  type: 'YELLOW_FLAG' | 'SAFETY_CAR' | 'VIRTUAL_SAFETY_CAR' | 'RED_FLAG' | 'INVESTIGATION' | 'PENALTY';
  driver?: string;
  description: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}
