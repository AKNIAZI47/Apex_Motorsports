export interface UnifiedSeriesFeed {
  id: string;
  name: string;
  governingBody: string;
  officialPortal: string;
  apiOrFeedEndpoint: string;
  lastChecked: string;
  status: 'VERIFIED_OFFICIAL' | 'AUDITED' | 'SYNCED';
  recordCount: number;
  leader: {
    name: string;
    team: string;
    points: number | string;
  };
}

export interface UnifiedSyncLog {
  timestamp: string;
  domain: string;
  status: 'SUCCESS' | 'AUDITED' | 'CACHED';
  details: string;
}

export interface UnifiedSyncState {
  lastNightlySync: string;
  nextScheduledSync: string;
  isRunning: boolean;
  activeDomainsCount: number;
  cronExpression: string;
  feeds: Record<string, UnifiedSeriesFeed>;
  recentLogs: UnifiedSyncLog[];
}

const LOCAL_STORAGE_KEY = 'apex_unified_nightly_sync_v2';

class UnifiedMotorsportSyncService {
  private state: UnifiedSyncState = {
    lastNightlySync: '',
    nextScheduledSync: '',
    isRunning: false,
    activeDomainsCount: 9,
    cronExpression: '0 0 * * * (Daily at 00:00:00)',
    feeds: {},
    recentLogs: [],
  };

  private listeners: Set<(state: UnifiedSyncState) => void> = new Set();
  private isInitialized: boolean = false;

  constructor() {
    this.loadFromLocalStorage();
  }

  public init() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    this.fetchStatus();

    // Check server status every 5 minutes
    if (typeof window !== 'undefined') {
      setInterval(() => {
        this.fetchStatus();
      }, 5 * 60 * 1000);
    }
  }

  private loadFromLocalStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          this.state = { ...this.state, ...parsed };
        }
      }
    } catch (e) {
      console.warn('Could not read local sync state:', e);
    }
  }

  private saveToLocalStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.state));
      }
    } catch (e) {
      console.warn('Could not write local sync state:', e);
    }
  }

  private notify() {
    this.saveToLocalStorage();
    this.listeners.forEach((cb) => {
      try {
        cb({ ...this.state });
      } catch (e) {
        console.error('Sync listener error:', e);
      }
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('motorsport_unified_sync_updated', {
          detail: { state: this.state },
        })
      );
    }
  }

  public subscribe(cb: (state: UnifiedSyncState) => void): () => void {
    this.listeners.add(cb);
    cb({ ...this.state });
    return () => {
      this.listeners.delete(cb);
    };
  }

  public async fetchStatus(): Promise<UnifiedSyncState> {
    try {
      const res = await fetch('/api/sync/status', {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        this.state = {
          ...this.state,
          lastNightlySync: data.lastNightlySync || this.state.lastNightlySync,
          nextScheduledSync: data.nextScheduledSync || this.state.nextScheduledSync,
          isRunning: data.isRunning ?? this.state.isRunning,
          activeDomainsCount: data.activeDomainsCount || 9,
          feeds: data.feeds || this.state.feeds,
          recentLogs: data.recentLogs || this.state.recentLogs,
        };
        this.notify();
      }
    } catch (e) {
      console.warn('Failed to fetch sync status from server:', e);
    }
    return { ...this.state };
  }

  public async triggerNightlySyncNow(): Promise<UnifiedSyncState> {
    this.state.isRunning = true;
    this.notify();

    try {
      const res = await fetch('/api/sync/run-nightly', {
        method: 'POST',
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        const data = await res.json();
        this.state = {
          ...this.state,
          lastNightlySync: data.lastNightlySync || new Date().toISOString(),
          nextScheduledSync: data.nextScheduledSync || this.state.nextScheduledSync,
          isRunning: false,
          activeDomainsCount: data.activeDomainsCount || 9,
          feeds: data.feeds || this.state.feeds,
          recentLogs: data.recentLogs || this.state.recentLogs,
        };
      }
    } catch (e) {
      console.error('Error triggering nightly sync:', e);
    } finally {
      this.state.isRunning = false;
      this.notify();
    }

    return { ...this.state };
  }

  public getState(): UnifiedSyncState {
    return { ...this.state };
  }
}

export const UnifiedSyncService = new UnifiedMotorsportSyncService();
