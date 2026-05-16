import { writable, get } from 'svelte/store';

export interface FavoriteAddress {
  id: string;
  alias: string;
  address: string;
  addedAt: number;
}

const STORAGE_KEY = 'paliwallet_favorites';

function loadFromStorage(): FavoriteAddress[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function persist(items: FavoriteAddress[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch { /* ignore */ }
}

function createFavoritesStore() {
  const { subscribe, update } = writable<FavoriteAddress[]>(loadFromStorage());

  function add(alias: string, address: string) {
    const entry: FavoriteAddress = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      alias: alias.trim(),
      address: address.toLowerCase(),
      addedAt: Date.now(),
    };
    update(items => {
      const next = [...items, entry];
      persist(next);
      return next;
    });
  }

  function remove(id: string) {
    update(items => {
      const next = items.filter(i => i.id !== id);
      persist(next);
      return next;
    });
  }

  function has(address: string): boolean {
    return get({ subscribe }).some(i => i.address === address.toLowerCase());
  }

  return { subscribe, add, remove, has };
}

export const favoritesStore = createFavoritesStore();
