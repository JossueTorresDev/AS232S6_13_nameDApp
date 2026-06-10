import { w as writable } from './index-bDjIV28w.js';
import { f as get_store_value } from './ssr-DYi-8xyJ.js';

const STORAGE_KEY$1 = "paliwallet_txlimits";
const DEFAULT = {
  maxAmountEnabled: false,
  maxAmount: "1",
  whitelistEnabled: false,
  whitelist: []
};
function load() {
  if (typeof window === "undefined") return DEFAULT;
  try {
    return { ...DEFAULT, ...JSON.parse(localStorage.getItem(STORAGE_KEY$1) ?? "{}") };
  } catch {
    return DEFAULT;
  }
}
function createTxLimitsStore() {
  const { subscribe, update, set } = writable(load());
  function persist2(state) {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY$1, JSON.stringify(state));
      } catch {
      }
    }
  }
  function save(patch) {
    update((s) => {
      const next = { ...s, ...patch };
      persist2(next);
      return next;
    });
  }
  function addToWhitelist(address) {
    update((s) => {
      const addr = address.toLowerCase();
      if (s.whitelist.includes(addr)) return s;
      const next = { ...s, whitelist: [...s.whitelist, addr] };
      persist2(next);
      return next;
    });
  }
  function removeFromWhitelist(address) {
    update((s) => {
      const next = { ...s, whitelist: s.whitelist.filter((a) => a !== address.toLowerCase()) };
      persist2(next);
      return next;
    });
  }
  function validate(to, amount) {
    let state;
    subscribe((s) => {
      state = s;
    })();
    if (state.maxAmountEnabled) {
      const max = parseFloat(state.maxAmount);
      const val = parseFloat(amount);
      if (!isNaN(max) && !isNaN(val) && val > max) {
        return `Monto excede el límite configurado (máx. ${state.maxAmount})`;
      }
    }
    if (state.whitelistEnabled && state.whitelist.length > 0) {
      if (!state.whitelist.includes(to.toLowerCase())) {
        return "Dirección no está en la lista de confianza";
      }
    }
    return null;
  }
  function reset() {
    set(DEFAULT);
    persist2(DEFAULT);
  }
  return { subscribe, save, addToWhitelist, removeFromWhitelist, validate, reset };
}
const txLimitsStore = createTxLimitsStore();
const STORAGE_KEY = "paliwallet_favorites";
function loadFromStorage() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}
function persist(items) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
  }
}
function createFavoritesStore() {
  const { subscribe, update } = writable(loadFromStorage());
  function add(alias, address) {
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      alias: alias.trim(),
      address: address.toLowerCase(),
      addedAt: Date.now()
    };
    update((items) => {
      const next = [...items, entry];
      persist(next);
      return next;
    });
  }
  function remove(id) {
    update((items) => {
      const next = items.filter((i) => i.id !== id);
      persist(next);
      return next;
    });
  }
  function has(address) {
    return get_store_value({ subscribe }).some((i) => i.address === address.toLowerCase());
  }
  return { subscribe, add, remove, has };
}
const favoritesStore = createFavoritesStore();

export { favoritesStore as f, txLimitsStore as t };
//# sourceMappingURL=favorites.store-BXo1miwR.js.map
