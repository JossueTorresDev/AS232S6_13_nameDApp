import { writable } from 'svelte/store';

export interface FaucetRequest {
  id: string;
  recipient: string;
  amount: string;       // en ETH/SYS formateado
  txHash: string;
  networkId: number;
  networkName: string;
  currency: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
}

interface FaucetState {
  requests: FaucetRequest[];
  loading: boolean;
  error: string;
}

const STORAGE_KEY = 'paliwallet_faucet_history';

function loadRequests(): FaucetRequest[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FaucetRequest[]) : [];
  } catch {
    return [];
  }
}

function persist(reqs: FaucetRequest[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reqs));
  } catch { /* ignore quota errors */ }
}

function createFaucetStore() {
  const { subscribe, update, set } = writable<FaucetState>({
    requests: loadRequests(),
    loading: false,
    error: ''
  });

  return {
    subscribe,
    update,

    addRequest(req: FaucetRequest) {
      update(s => {
        const requests = [req, ...s.requests];
        persist(requests);
        return { ...s, requests };
      });
    },

    updateRequest(txHash: string, changes: Partial<FaucetRequest>) {
      update(s => {
        const requests = s.requests.map(r =>
          r.txHash === txHash ? { ...r, ...changes } : r
        );
        persist(requests);
        return { ...s, requests };
      });
    },

    setLoading(loading: boolean) {
      update(s => ({ ...s, loading }));
    },

    setError(error: string) {
      update(s => ({ ...s, error }));
    },

    clearError() {
      update(s => ({ ...s, error: '' }));
    },

    clearAll() {
      persist([]);
      update(s => ({ ...s, requests: [] }));
    },

    reset() {
      set({ requests: loadRequests(), loading: false, error: '' });
    }
  };
}

export const faucetStore = createFaucetStore();
