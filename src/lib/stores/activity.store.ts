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

  const { subscribe, update } = writable<ActivityEntry[]>(saved);

  function persist(entries: ActivityEntry[]) {
    // Ya no usamos localStorage
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
