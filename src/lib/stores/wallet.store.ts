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

  // Cargar red guardada del localStorage
  if (typeof window !== 'undefined') {
    const savedNetwork = localStorage.getItem('selectedNetwork');
    if (savedNetwork) {
      try {
        const network = JSON.parse(savedNetwork);
        set({
          ...initial,
          currentNetwork: network
        });
      } catch (e) {
        console.error('Error loading saved network:', e);
      }
    }
  }

  return {
    subscribe,
    update,
    set,
    
    setNetwork: (network: NetworkInfo) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedNetwork', JSON.stringify(network));
      }
      update(state => ({
        ...state,
        currentNetwork: network
      }));
    },

    resetWallet: () => set(initial)
  };
}

export const walletStore = createWalletStore();
