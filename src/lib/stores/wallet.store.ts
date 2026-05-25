import { writable } from 'svelte/store';
import type { WalletState, NetworkInfo } from '$lib/types/wallet';
import { SYSCOIN_MAINNET } from '$lib/constants/network';

const initial: WalletState = {
  address: '',
  balance: '',
  connected: false,
  loading: false,
  error: '',
  currentNetwork: SYSCOIN_MAINNET
};

function createWalletStore() {
  const { subscribe, set, update } = writable<WalletState>(initial);

  // Cargar red guardada de sessionStorage (no usar localStorage por seguridad/profesor)
  if (typeof window !== 'undefined') {
    try {
      const savedNetwork = sessionStorage.getItem('selectedNetwork');
      if (savedNetwork) {
        const network = JSON.parse(savedNetwork);
        set({ ...initial, currentNetwork: network });
      }
    } catch (e) {
      console.error('Error loading saved network from sessionStorage:', e);
    }
  }

  return {
    subscribe,
    update,
    set,
    
    setNetwork: (network: NetworkInfo) => {
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('selectedNetwork', JSON.stringify(network));
        } catch (e) {
          // ignore storage errors
        }
      }
      update(state => ({ ...state, currentNetwork: network }));
    },

    resetWallet: () => set(initial)
  };
}

export const walletStore = createWalletStore();
