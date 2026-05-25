import { w as writable } from "./index.js";
const SYSCOIN_MAINNET = {
  name: "Syscoin Mainnet",
  label: "Mainnet",
  chainId: 57,
  rpcUrl: "https://rpc.syscoin.org",
  type: "UTXO",
  currency: "SYS",
  blockExplorer: "https://explorer.syscoin.org"
};
const SYSCOIN_TESTNET = {
  name: "Syscoin Testnet",
  label: "Testnet",
  chainId: 5700,
  rpcUrl: "https://testnet-rpc.syscoin.org",
  type: "UTXO",
  currency: "tSYS",
  blockExplorer: "https://testnet-explorer.syscoin.org"
};
const ROLLUX = {
  name: "Rollux",
  label: "Mainnet",
  chainId: 570,
  rpcUrl: "https://rpc.rollux.com",
  type: "EVM",
  currency: "SYS",
  blockExplorer: "https://explorer.rollux.com"
};
const SYSCOIN_NEVM = {
  name: "Syscoin NEVM",
  label: "NEVM",
  chainId: 5702,
  rpcUrl: "https://rpc.syscoin.org",
  type: "EVM",
  currency: "SYS",
  blockExplorer: "https://explorer.syscoin.org"
};
const ETHEREUM_MAINNET = {
  name: "Ethereum Mainnet",
  label: "Mainnet",
  chainId: 1,
  rpcUrl: "https://eth-mainnet.g.alchemy.com/v2/demo",
  type: "EVM",
  currency: "ETH",
  blockExplorer: "https://etherscan.io"
};
const POLYGON_MAINNET = {
  name: "Polygon Mainnet",
  label: "Mainnet",
  chainId: 137,
  rpcUrl: "https://polygon-rpc.com",
  type: "EVM",
  currency: "MATIC",
  blockExplorer: "https://polygonscan.com"
};
const SYSCOIN_NEVM_TESTNET = {
  name: "Syscoin NEVM Testnet",
  label: "Testnet",
  chainId: 5701,
  rpcUrl: "https://testnet-rpc.syscoin.org",
  type: "EVM",
  currency: "tSYS",
  blockExplorer: "https://testnet-explorer.syscoin.org"
};
const ZKSYS_POB_DEVNET = {
  name: "zkSYS PoB Devnet",
  label: "Devnet",
  chainId: 57042,
  rpcUrl: "https://rpc-pob.dev11.top/",
  type: "EVM",
  currency: "TSYS",
  blockExplorer: "https://explorer-pob.dev11.top"
};
const ZKSYS_TESTNET = {
  name: "zkSYS Testnet",
  label: "Testnet",
  chainId: 57057,
  rpcUrl: "https://rpc-zk.tanenbaum.io/",
  type: "EVM",
  currency: "TSYS",
  blockExplorer: "https://explorer-zk.tanenbaum.io"
};
const ETHEREUM_HOODI = {
  name: "Ethereum Hoodi",
  label: "Testnet",
  chainId: 560048,
  rpcUrl: "https://0xrpc.io/hoodi",
  type: "EVM",
  currency: "ETH",
  blockExplorer: "https://hoodi.etherscan.io/"
};
const ETHEREUM_SEPOLIA = {
  name: "Ethereum Sepolia",
  label: "Testnet",
  chainId: 11155111,
  rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com/",
  type: "EVM",
  currency: "ETH",
  blockExplorer: "https://sepolia.etherscan.io/"
};
const POLYGON_MUMBAI = {
  name: "Polygon Mumbai",
  label: "Testnet",
  chainId: 80001,
  rpcUrl: "https://rpc-mumbai.maticvigil.com",
  type: "EVM",
  currency: "MATIC",
  blockExplorer: "https://mumbai.polygonscan.com"
};
const AVAILABLE_NETWORKS = [
  SYSCOIN_MAINNET,
  SYSCOIN_TESTNET,
  ROLLUX,
  SYSCOIN_NEVM,
  ETHEREUM_MAINNET,
  POLYGON_MAINNET,
  SYSCOIN_NEVM_TESTNET,
  ZKSYS_POB_DEVNET,
  ZKSYS_TESTNET,
  ETHEREUM_HOODI,
  ETHEREUM_SEPOLIA,
  POLYGON_MUMBAI
];
AVAILABLE_NETWORKS.filter((n) => n.type === "UTXO");
AVAILABLE_NETWORKS.filter((n) => n.type === "EVM");
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
    const savedNetwork = localStorage.getItem("selectedNetwork");
    if (savedNetwork) {
      try {
        const network = JSON.parse(savedNetwork);
        set({
          ...initial$1,
          currentNetwork: network
        });
      } catch (e) {
        console.error("Error loading saved network:", e);
      }
    }
  }
  return {
    subscribe,
    update,
    set,
    setNetwork: (network) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("selectedNetwork", JSON.stringify(network));
      }
      update((state) => ({
        ...state,
        currentNetwork: network
      }));
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
export {
  activityStore as a,
  transactionStore as t,
  walletStore as w
};
