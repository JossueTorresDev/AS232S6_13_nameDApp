import { w as writable } from './index-bDjIV28w.js';

const STORAGE_KEY = "paliwallet_faucet_history";
function loadRequests() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function persist(reqs) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reqs));
  } catch {
  }
}
function createFaucetStore() {
  const { subscribe, update, set } = writable({
    requests: loadRequests(),
    loading: false,
    error: ""
  });
  return {
    subscribe,
    update,
    addRequest(req) {
      update((s) => {
        const requests = [req, ...s.requests];
        persist(requests);
        return { ...s, requests };
      });
    },
    updateRequest(txHash, changes) {
      update((s) => {
        const requests = s.requests.map(
          (r) => r.txHash === txHash ? { ...r, ...changes } : r
        );
        persist(requests);
        return { ...s, requests };
      });
    },
    setLoading(loading) {
      update((s) => ({ ...s, loading }));
    },
    setError(error) {
      update((s) => ({ ...s, error }));
    },
    clearError() {
      update((s) => ({ ...s, error: "" }));
    },
    clearAll() {
      persist([]);
      update((s) => ({ ...s, requests: [] }));
    },
    reset() {
      set({ requests: loadRequests(), loading: false, error: "" });
    }
  };
}
createFaucetStore();
//# sourceMappingURL=faucet.store-CTcPaLiL.js.map
