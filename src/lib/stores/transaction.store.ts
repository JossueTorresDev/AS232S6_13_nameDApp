import { writable } from 'svelte/store';
import type { Transaction } from '$lib/types/wallet';

interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  error: string;
}

const STORAGE_KEY = 'boar_hat_transactions';

function loadTransactions(): Transaction[] {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading transactions:', e);
      }
    }
  }
  return [];
}

function persistTransactions(txs: Transaction[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(txs));
    } catch (e) {
      console.error('Error saving transactions:', e);
    }
  }
}

const initial: TransactionState = {
  transactions: [],
  loading: false,
  error: ''
};

function createTransactionStore() {
  const { subscribe, set, update } = writable<TransactionState>({
    ...initial,
    transactions: loadTransactions(),
  });

  return {
    subscribe,
    update,

    setTransactions: (transactions: Transaction[]) => {
      update(state => ({ ...state, transactions }));
    },

    addTransaction: (transaction: Transaction) => {
      update(state => {
        const transactions = [transaction, ...state.transactions];
        persistTransactions(transactions);
        return { ...state, transactions };
      });
    },

    updateTransaction: (hash: string, updates: Partial<Transaction>) => {
      update(state => {
        const transactions = state.transactions.map(tx =>
          tx.hash === hash ? { ...tx, ...updates } : tx
        );
        persistTransactions(transactions);
        return { ...state, transactions };
      });
    },

    setLoading: (loading: boolean) => {
      update(state => ({ ...state, loading }));
    },

    setError: (error: string) => {
      update(state => ({ ...state, error }));
    },

    clearError: () => {
      update(state => ({ ...state, error: '' }));
    },

    clearAll: () => {
      update(state => ({ ...state, transactions: [] }));
    },

    reset: () => set(initial),
  };
}

export const transactionStore = createTransactionStore();
