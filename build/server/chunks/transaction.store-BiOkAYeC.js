import { w as writable } from './index-bDjIV28w.js';
import { S as SYSCOIN_MAINNET } from './network-aqCDF7b6.js';

const initial$1 = {
  address: "",
  balance: "",
  connected: false,
  loading: false,
  error: "",
  currentNetwork: SYSCOIN_MAINNET
};
function createWalletStore() {
  const { subscribe, set, update } = writable(initial$1);
  if (typeof window !== "undefined") {
    try {
      const savedNetwork = sessionStorage.getItem("selectedNetwork");
      if (savedNetwork) {
        const network = JSON.parse(savedNetwork);
        set({ ...initial$1, currentNetwork: network });
      }
    } catch (e) {
      console.error("Error loading saved network from sessionStorage:", e);
    }
  }
  return {
    subscribe,
    update,
    set,
    setNetwork: (network) => {
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem("selectedNetwork", JSON.stringify(network));
        } catch (e) {
        }
      }
      update((state) => ({ ...state, currentNetwork: network }));
    },
    resetWallet: () => set(initial$1)
  };
}
const walletStore = createWalletStore();
const MAX_ENTRIES = 100;
const STORAGE_KEY$1 = "paliwallet_activity";
function createActivityStore() {
  let saved = [];
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem(STORAGE_KEY$1);
    if (raw) {
      try {
        saved = JSON.parse(raw);
      } catch (e) {
        console.error("Error loading activity:", e);
      }
    }
  }
  const { subscribe, update } = writable(saved);
  function persist(entries) {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY$1, JSON.stringify(entries));
      } catch (e) {
        console.error("Error saving activity:", e);
      }
    }
  }
  function log(type, message, meta) {
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      message,
      timestamp: Date.now(),
      meta
    };
    update((entries) => {
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
const activityStore = createActivityStore();
const STORAGE_KEY = "boar_hat_transactions";
function loadTransactions() {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading transactions:", e);
      }
    }
  }
  return [];
}
function persistTransactions(txs) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(txs));
    } catch (e) {
      console.error("Error saving transactions:", e);
    }
  }
}
const initial = {
  transactions: [],
  loading: false,
  error: ""
};
function createTransactionStore() {
  const { subscribe, set, update } = writable({
    ...initial,
    transactions: loadTransactions()
  });
  return {
    subscribe,
    update,
    setTransactions: (transactions) => {
      update((state) => ({ ...state, transactions }));
    },
    addTransaction: (transaction) => {
      update((state) => {
        const transactions = [transaction, ...state.transactions];
        persistTransactions(transactions);
        return { ...state, transactions };
      });
    },
    updateTransaction: (hash, updates) => {
      update((state) => {
        const transactions = state.transactions.map(
          (tx) => tx.hash === hash ? { ...tx, ...updates } : tx
        );
        persistTransactions(transactions);
        return { ...state, transactions };
      });
    },
    setLoading: (loading) => {
      update((state) => ({ ...state, loading }));
    },
    setError: (error) => {
      update((state) => ({ ...state, error }));
    },
    clearError: () => {
      update((state) => ({ ...state, error: "" }));
    },
    clearAll: () => {
      update((state) => ({ ...state, transactions: [] }));
    },
    reset: () => set(initial)
  };
}
const transactionStore = createTransactionStore();

export { activityStore as a, transactionStore as t, walletStore as w };
//# sourceMappingURL=transaction.store-BiOkAYeC.js.map
