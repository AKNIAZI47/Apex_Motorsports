export const STRUCTURED_SERIES_IDS = [
  'MOTOGP',
  'WEC',
  'WSBK',
  'WRC',
  'INDYCAR',
  'SUPERCARS',
  'DTM',
  'GTWORLD',
] as const;

export type StructuredSeriesId = (typeof STRUCTURED_SERIES_IDS)[number];

export interface NormalizedSeriesEntry {
  id: string;
  name: string;
  team?: string;
  points: number;
  wins?: number;
  position?: number;
}

export interface NormalizedSeriesSnapshot {
  series: StructuredSeriesId;
  season: number;
  fetchedAt: string;
  source: string;
  standings: NormalizedSeriesEntry[];
  races: Array<{
    round: number;
    name: string;
    date: string;
    completed: boolean;
    winner?: string;
  }>;
}

export interface StructuredAdapterResult {
  status: 'SYNCED' | 'UNAVAILABLE' | 'INVALID' | 'FAILED';
  snapshot?: NormalizedSeriesSnapshot;
  reason?: string;
}

const adapterEnvironmentNames: Record<StructuredSeriesId, string> = {
  MOTOGP: 'APEX_MOTOGP_FEED_URL',
  WEC: 'APEX_WEC_FEED_URL',
  WSBK: 'APEX_WSBK_FEED_URL',
  WRC: 'APEX_WRC_FEED_URL',
  INDYCAR: 'APEX_INDYCAR_FEED_URL',
  SUPERCARS: 'APEX_SUPERCARS_FEED_URL',
  DTM: 'APEX_DTM_FEED_URL',
  GTWORLD: 'APEX_GTWORLD_FEED_URL',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validateSnapshot(value: unknown, series: StructuredSeriesId, source: string): NormalizedSeriesSnapshot {
  if (!isRecord(value) || value.series !== series || !Number.isInteger(value.season)) {
    throw new Error('Payload must include the expected series and integer season');
  }

  if (!Array.isArray(value.standings) || value.standings.length === 0) {
    throw new Error('Payload must include a non-empty standings array');
  }

  const ids = new Set<string>();
  const standings = value.standings.map((entry, index) => {
    if (!isRecord(entry) || typeof entry.id !== 'string' || typeof entry.name !== 'string' || typeof entry.points !== 'number' || !Number.isFinite(entry.points)) {
      throw new Error(`Invalid standings entry at index ${index}`);
    }
    if (ids.has(entry.id)) {
      throw new Error(`Duplicate standings id: ${entry.id}`);
    }
    ids.add(entry.id);
    return {
      id: entry.id,
      name: entry.name,
      team: typeof entry.team === 'string' ? entry.team : undefined,
      points: entry.points,
      wins: typeof entry.wins === 'number' ? entry.wins : undefined,
      position: typeof entry.position === 'number' ? entry.position : index + 1,
    };
  });

  const races = Array.isArray(value.races)
    ? value.races.map((race, index) => {
        if (!isRecord(race) || !Number.isInteger(race.round) || typeof race.name !== 'string' || typeof race.date !== 'string' || typeof race.completed !== 'boolean') {
          throw new Error(`Invalid race entry at index ${index}`);
        }
        return {
          round: race.round,
          name: race.name,
          date: race.date,
          completed: race.completed,
          winner: typeof race.winner === 'string' ? race.winner : undefined,
        };
      })
    : [];

  return {
    series,
    season: value.season,
    fetchedAt: new Date().toISOString(),
    source,
    standings,
    races,
  };
}

export async function fetchStructuredSeriesSnapshot(series: StructuredSeriesId, signal?: AbortSignal): Promise<StructuredAdapterResult> {
  const environmentName = adapterEnvironmentNames[series];
  const endpoint = process.env[environmentName];
  if (!endpoint) {
    return { status: 'UNAVAILABLE', reason: `${environmentName} is not configured` };
  }

  try {
    const response = await fetch(endpoint, {
      headers: { Accept: 'application/json' },
      signal: signal || AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      return { status: 'FAILED', reason: `Structured feed returned HTTP ${response.status}` };
    }

    const payload: unknown = await response.json();
    return { status: 'SYNCED', snapshot: validateSnapshot(payload, series, endpoint) };
  } catch (error) {
    return {
      status: 'INVALID',
      reason: error instanceof Error ? error.message : 'Structured feed could not be read',
    };
  }
}
