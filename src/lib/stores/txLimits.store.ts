import { writable } from 'svelte/store';

export interface TxLimitsState {
  maxAmountEnabled: boolean;
  maxAmount: string;           // en ETH/SYS
  whitelistEnabled: boolean;
  whitelist: string[];         // direcciones en minúsculas
}

const STORAGE_KEY = 'paliwallet_txlimits';

const DEFAULT: TxLimitsState = {
  maxAmountEnabled: false,
  maxAmount: '1',
  whitelistEnabled: false,
  whitelist: [],
};

function load(): TxLimitsState {
  if (typeof window === 'undefined') return DEFAULT;
  try {
    return { ...DEFAULT, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') };
  } catch { return DEFAULT; }
}

function createTxLimitsStore() {
  const { subscribe, update, set } = writable<TxLimitsState>(load());

  function persist(state: TxLimitsState) {
    if (typeof window !== 'undefined') {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
    }
  }

  function save(patch: Partial<TxLimitsState>) {
    update(s => {
      const next = { ...s, ...patch };
      persist(next);
      return next;
    });
  }

  function addToWhitelist(address: string) {
    update(s => {
      const addr = address.toLowerCase();
      if (s.whitelist.includes(addr)) return s;
      const next = { ...s, whitelist: [...s.whitelist, addr] };
      persist(next);
      return next;
    });
  }

  function removeFromWhitelist(address: string) {
    update(s => {
      const next = { ...s, whitelist: s.whitelist.filter(a => a !== address.toLowerCase()) };
      persist(next);
      return next;
    });
  }

  /** Valida una tx contra los límites. Devuelve null si OK, string de error si falla. */
  function validate(to: string, amount: string): string | null {
    let state!: TxLimitsState;
    subscribe(s => { state = s; })();

    if (state.maxAmountEnabled) {
      const max = parseFloat(state.maxAmount);
      const val = parseFloat(amount);
      if (!isNaN(max) && !isNaN(val) && val > max) {
        return `Monto excede el límite configurado (máx. ${state.maxAmount})`;
      }
    }

    if (state.whitelistEnabled && state.whitelist.length > 0) {
      if (!state.whitelist.includes(to.toLowerCase())) {
        return 'Dirección no está en la lista de confianza';
      }
    }

    return null;
  }

  function reset() {
    set(DEFAULT);
    persist(DEFAULT);
  }

  return { subscribe, save, addToWhitelist, removeFromWhitelist, validate, reset };
}

export const txLimitsStore = createTxLimitsStore();
