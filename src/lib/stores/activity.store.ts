import { writable } from 'svelte/store';

export type ActivityType =
  | 'connect'
  | 'disconnect'
  | 'network_change'
  | 'tx_sent'
  | 'tx_confirmed'
  | 'tx_failed'
  | 'balance_refresh'
  | 'account_change'
  | 'error';

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  message: string;
  timestamp: number;
  meta?: Record<string, string | number | boolean>;
}

const MAX_ENTRIES = 100;
const STORAGE_KEY = 'paliwallet_activity';

function createActivityStore() {
  let saved: ActivityEntry[] = [];

  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        saved = JSON.parse(raw);
      } catch (e) {
        console.error('Error loading activity:', e);
      }
    }
  }

  const { subscribe, update } = writable<ActivityEntry[]>(saved);

  function persist(entries: ActivityEntry[]) {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      } catch (e) {
        console.error('Error saving activity:', e);
      }
    }
  }

  function log(type: ActivityType, message: string, meta?: ActivityEntry['meta']) {
    const entry: ActivityEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      message,
      timestamp: Date.now(),
      meta,
    };
    update(entries => {
      const next = [entry, ...entries].slice(0, MAX_ENTRIES);
      persist(next);
      return next;
    });
  }

  function clear() {
    update(() => []);
  }

  return { subscribe, log, clear };
}

export const activityStore = createActivityStore();
