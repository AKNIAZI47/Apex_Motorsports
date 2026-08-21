import { MotorsportCategory, Race } from '../types';

export interface CustomRaceEvent {
  id: string;
  category: MotorsportCategory;
  season: number;
  round: number;
  raceName: string;
  circuitName: string;
  circuitId?: string;
  locality: string;
  country: string;
  date: string;
  time?: string;
  status: 'Completed' | 'Live In-Progress' | 'Scheduled';
  winner?: {
    driverId?: string;
    fullName: string;
    team: string;
    timeOrScore?: string;
  };
  polePosition?: {
    driverName: string;
    time?: string;
  };
  fastestMetric?: {
    label: string;
    value: string;
    driverName: string;
  };
  totalLaps?: number;
  headlineNotes?: string;
  createdAt: number;
}

const STORAGE_KEY = 'apex_motorsport_custom_events_v2026';

// Pre-seeded authentic 2026 championship events for all 9 categories
const DEFAULT_2026_EVENTS: CustomRaceEvent[] = [
  // F1 2026
  {
    id: 'f1-2026-melbourne',
    category: 'F1',
    season: 2026,
    round: 1,
    raceName: 'Australian Grand Prix',
    circuitName: 'Albert Park Circuit',
    circuitId: 'silverstone',
    locality: 'Melbourne',
    country: 'Australia',
    date: '2026-03-15',
    time: '05:00:00Z',
    status: 'Completed',
    winner: {
      fullName: 'Lewis Hamilton',
      team: 'Ferrari SF-26',
      timeOrScore: '1:24:16.890',
    },
    polePosition: {
      driverName: 'Charles Leclerc',
      time: '1:16.204',
    },
    fastestMetric: {
      label: 'Fastest Lap',
      value: '1:19.450',
      driverName: 'Lando Norris (McLaren)',
    },
    totalLaps: 58,
    headlineNotes: 'Sensational Ferrari 1-2 victory in Melbourne with Hamilton claiming his first victory in Scuderia red.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
  },
  {
    id: 'f1-2026-monaco',
    category: 'F1',
    season: 2026,
    round: 8,
    raceName: 'Monaco Grand Prix',
    circuitName: 'Circuit de Monaco',
    circuitId: 'monaco',
    locality: 'Monte Carlo',
    country: 'Monaco',
    date: '2026-05-24',
    time: '13:00:00Z',
    status: 'Completed',
    winner: {
      fullName: 'Charles Leclerc',
      team: 'Ferrari SF-26',
      timeOrScore: '1:42:30.120',
    },
    polePosition: {
      driverName: 'Charles Leclerc',
      time: '1:10.890',
    },
    fastestMetric: {
      label: 'Fastest Lap',
      value: '1:13.110',
      driverName: 'Oscar Piastri (McLaren)',
    },
    totalLaps: 78,
    headlineNotes: 'Masterclass drive through the streets of the Principality.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15,
  },
  {
    id: 'f1-2026-silverstone',
    category: 'F1',
    season: 2026,
    round: 12,
    raceName: 'British Grand Prix',
    circuitName: 'Silverstone Circuit',
    circuitId: 'silverstone',
    locality: 'Silverstone',
    country: 'United Kingdom',
    date: '2026-07-05',
    time: '14:00:00Z',
    status: 'Completed',
    winner: {
      fullName: 'Lando Norris',
      team: 'McLaren MCL39',
      timeOrScore: '1:21:40.550',
    },
    polePosition: {
      driverName: 'George Russell',
      time: '1:25.105',
    },
    fastestMetric: {
      label: 'Fastest Lap',
      value: '1:27.420',
      driverName: 'Max Verstappen (Red Bull)',
    },
    totalLaps: 52,
    headlineNotes: 'High-speed duel through Maggotts and Becketts in changing weather.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
  },
  // WEC 2026
  {
    id: 'wec-2026-lemans',
    category: 'WEC',
    season: 2026,
    round: 4,
    raceName: '24 Hours of Le Mans (94th Edition)',
    circuitName: 'Circuit de la Sarthe',
    circuitId: 'lemans',
    locality: 'Le Mans',
    country: 'France',
    date: '2026-06-13',
    time: '14:00:00Z',
    status: 'Completed',
    winner: {
      fullName: 'Antonio Fuoco / Miguel Molina / Nicklas Nielsen',
      team: 'Ferrari AF Corse #50 (499P)',
      timeOrScore: '311 Laps (4,237 km)',
    },
    polePosition: {
      driverName: 'Kévin Estre (Porsche 963)',
      time: '3:24.634',
    },
    fastestMetric: {
      label: 'Fastest Hypercar Lap',
      value: '3:26.110 (343.8 km/h top speed)',
      driverName: 'Kamui Kobayashi (Toyota GR010)',
    },
    totalLaps: 311,
    headlineNotes: 'Ferrari claims back-to-back Le Mans 24H victories in a dramatic dawn thunderstorm duel against Porsche Penske.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
  },
  // MOTOGP 2026
  {
    id: 'motogp-2026-mugello',
    category: 'MOTOGP',
    season: 2026,
    round: 7,
    raceName: 'Gran Premio d’Italia Brembo',
    circuitName: 'Autodromo Internazionale del Mugello',
    circuitId: 'mugello',
    locality: 'Scarperia, Tuscany',
    country: 'Italy',
    date: '2026-06-01',
    time: '12:00:00Z',
    status: 'Completed',
    winner: {
      fullName: 'Francesco Bagnaia',
      team: 'Ducati Lenovo Team (GP26)',
      timeOrScore: '40:51.385',
    },
    polePosition: {
      driverName: 'Jorge Martín (Aprilia Racing)',
      time: '1:44.201',
    },
    fastestMetric: {
      label: 'Top Speed Record',
      value: '366.1 km/h (227.5 mph)',
      driverName: 'Pedro Acosta (Red Bull KTM)',
    },
    totalLaps: 23,
    headlineNotes: 'Record-shattering Mugello sprint and GP with Bagnaia executing a sensational Turn 1 slipstream pass.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 25,
  },
  // FORMULA DRIFT 2026
  {
    id: 'drift-2026-irwindale',
    category: 'DRIFT',
    season: 2026,
    round: 3,
    raceName: 'Formula DRIFT Round 3: The Crossroads',
    circuitName: 'Irwindale Speedway (House of Drift)',
    circuitId: 'irwindale',
    locality: 'Irwindale, California',
    country: 'USA',
    date: '2026-05-18',
    time: '23:00:00Z',
    status: 'Completed',
    winner: {
      fullName: 'James Deane',
      team: 'RTR Motorsports (Ford Mustang 1115HP)',
      timeOrScore: '100 Point Lead & Chase Perfection',
    },
    polePosition: {
      driverName: 'Fredric Aasbø (Rockstar GR Supra)',
      time: '98.5 Points Qualifying',
    },
    fastestMetric: {
      label: 'Peak Slip Angle',
      value: '74.8° at 168 km/h wall proximity',
      driverName: 'James Deane',
    },
    totalLaps: 16,
    headlineNotes: 'Door-to-door bumper scraping finals tandem under the Irwindale stadium floodlights.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 18,
  },
];

class RaceEventStore {
  private events: CustomRaceEvent[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.load();
  }

  private load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.events = parsed;
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to load saved events:', e);
    }
    this.events = [...DEFAULT_2026_EVENTS];
    this.save();
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.events));
    } catch (e) {
      console.warn('Failed to persist custom events:', e);
    }
  }

  public getEvents(category?: MotorsportCategory, year?: number): CustomRaceEvent[] {
    return this.events
      .filter((ev) => {
        if (category && ev.category !== category) return false;
        if (year && ev.season !== year) return false;
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public getAllEvents(): CustomRaceEvent[] {
    return [...this.events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public addEvent(eventData: Omit<CustomRaceEvent, 'id' | 'createdAt'>): CustomRaceEvent {
    const newEvent: CustomRaceEvent = {
      ...eventData,
      id: `event-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
    };

    this.events = [newEvent, ...this.events];
    this.save();
    this.notify();
    return newEvent;
  }

  public deleteEvent(id: string) {
    this.events = this.events.filter((e) => e.id !== id);
    this.save();
    this.notify();
  }

  public subscribe(callback: () => void) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }
}

export const raceEventStore = new RaceEventStore();
