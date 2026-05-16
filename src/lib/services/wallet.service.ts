import { ethers }           from 'ethers';
import { walletStore }      from '$lib/stores/wallet.store';
import { toastStore }       from '$lib/stores/toast.store';
import { activityStore }    from '$lib/stores/activity.store';
import { WALLET_ERRORS, AVAILABLE_NETWORKS } from '$lib/constants/network';
import { startIncomingTxPolling, stopIncomingTxPolling } from '$lib/services/onchain.service';
import { fetchHistoryFromExplorer } from '$lib/services/history.service';

// ── Listener refs (para poder removerlos) ────────────────────────────────────
let chainChangeListener:   ((chainId: unknown) => void)    | null = null;
let accountChangeListener: ((accounts: unknown[]) => void) | null = null;

// ── Connect ──────────────────────────────────────────────────────────────────
export async function connectWallet(): Promise<void> {
  walletStore.update(s => ({ ...s, loading: true, error: '' }));

  try {
    if (!window.ethereum) {
      walletStore.update(s => ({ ...s, error: WALLET_ERRORS.NOT_DETECTED, loading: false }));
      return;
    }

    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer   = await provider.getSigner();
    const address  = await signer.getAddress();
    const rawBal   = await provider.getBalance(address);
    const balance  = ethers.formatEther(rawBal);

    walletStore.update(s => ({ ...s, address, balance, connected: true, loading: false }));

    setupListeners();
    activityStore.log('connect', `Wallet conectada: ${address}`, { address });
    toastStore.success('Wallet conectada correctamente');

    const state = Object.fromEntries(Object.entries(walletStore).filter(([k]) => k !== 'subscribe'));
    let currentNetwork: import('$lib/types/network').NetworkInfo | undefined;
    walletStore.subscribe(s => { currentNetwork = s.currentNetwork; })();
    if (currentNetwork) fetchHistoryFromExplorer(address, currentNetwork);

  } catch (err: unknown) {
    const friendlyMessage = parseWalletError(err);
    walletStore.update(s => ({ ...s, error: friendlyMessage, loading: false }));
  }
}

// ── Disconnect ───────────────────────────────────────────────────────────────
export function disconnectWallet(): void {
  removeListeners();
  stopIncomingTxPolling();
  activityStore.log('disconnect', 'Wallet desconectada');
  walletStore.resetWallet();

  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
}

// ── Auto-reconnect (llamar en onMount del layout) ────────────────────────────
export async function tryAutoReconnect(): Promise<void> {
  if (!window.ethereum) return;

  try {
    // eth_accounts no pide permiso — solo devuelve cuentas ya autorizadas
    const accounts = await (window.ethereum as any).request({ method: 'eth_accounts' }) as string[];
    if (!accounts || accounts.length === 0) return;

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer   = await provider.getSigner();
    const address  = await signer.getAddress();
    const rawBal   = await provider.getBalance(address);
    const balance  = ethers.formatEther(rawBal);

    walletStore.update(s => ({ ...s, address, balance, connected: true }));
    setupListeners();

    // Iniciar polling de txs entrantes
    let currentNetwork: import('$lib/types/network').NetworkInfo | undefined;
    walletStore.subscribe(s => { currentNetwork = s.currentNetwork; })();
    if (currentNetwork) {
      startIncomingTxPolling(address, currentNetwork);
      fetchHistoryFromExplorer(address, currentNetwork);
    }

    activityStore.log('connect', `Reconexión automática: ${address}`, { address });
  } catch {
    // Silencioso — si falla no hay sesión previa
  }
}

// ── Refresh balance ──────────────────────────────────────────────────────────
export async function refreshBalance(silent = false): Promise<void> {
  if (!window.ethereum) return;

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer   = await provider.getSigner();
    const address  = await signer.getAddress();
    const rawBal   = await provider.getBalance(address);
    const balance  = ethers.formatEther(rawBal);

    walletStore.update(s => ({ ...s, balance }));
    if (!silent) {
      activityStore.log('balance_refresh', 'Saldo actualizado manualmente');
      toastStore.success('Saldo actualizado');
    }
  } catch {
    if (!silent) toastStore.error('No se pudo actualizar el saldo');
  }
}

// ── Listeners ────────────────────────────────────────────────────────────────
function setupListeners(): void {
  if (!window.ethereum) return;
  removeListeners();

  // chainChanged
  chainChangeListener = (chainIdHex: unknown) => {
    try {
      const chainId = typeof chainIdHex === 'string'
        ? parseInt(chainIdHex, 16)
        : (chainIdHex as number);

      const network = AVAILABLE_NETWORKS.find(n => n.chainId === chainId);
      if (network) {
        walletStore.setNetwork(network);
        activityStore.log('network_change', `Red cambiada a ${network.name}`, { chainId: network.chainId });
        toastStore.info(`Red cambiada a ${network.name}`);
        
        let addr = '';
        walletStore.subscribe(s => { addr = s.address; })();
        if (addr) fetchHistoryFromExplorer(addr, network);
      } else {
        toastStore.info(`Red no soportada (chainId: ${chainId})`);
      }
    } catch {
      // ignore
    }
  };

  // accountsChanged
  accountChangeListener = (accounts: unknown[]) => {
    if (!accounts || accounts.length === 0) {
      // El usuario desconectó desde la wallet
      toastStore.info('Wallet desconectada desde el navegador');
      disconnectWallet();
    } else {
      // Cambió de cuenta
      const newAddress = accounts[0] as string;
      walletStore.update(s => ({ ...s, address: newAddress, balance: '' }));
      activityStore.log('account_change', `Cuenta cambiada a ${newAddress}`, { address: newAddress });
      toastStore.info('Cuenta cambiada — actualizando saldo...');

      // Actualizar balance de la nueva cuenta
      (async () => {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum!);
          const rawBal   = await provider.getBalance(newAddress);
          const balance  = ethers.formatEther(rawBal);
          walletStore.update(s => ({ ...s, balance }));

          let currentNetwork: import('$lib/types/network').NetworkInfo | undefined;
          walletStore.subscribe(s => { currentNetwork = s.currentNetwork; })();
          if (currentNetwork) fetchHistoryFromExplorer(newAddress, currentNetwork);
        } catch { /* ignore */ }
      })();
    }
  };

  (window.ethereum as any).on?.('chainChanged',    chainChangeListener);
  (window.ethereum as any).on?.('accountsChanged', accountChangeListener);
}

function removeListeners(): void {
  if (!window.ethereum) return;
  if (chainChangeListener)   (window.ethereum as any).removeListener?.('chainChanged',    chainChangeListener);
  if (accountChangeListener) (window.ethereum as any).removeListener?.('accountsChanged', accountChangeListener);
  chainChangeListener   = null;
  accountChangeListener = null;
}

// ── Error parser — mensajes amigables ────────────────────────────────────────
function parseWalletError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  const code = (err as { code?: number | string })?.code;

  // Wallet bloqueada
  if (code === -32002 || raw.includes('already pending')) {
    return 'Ya hay una solicitud pendiente en tu wallet. Ábrela y acéptala.';
  }
  if (code === -32603 || raw.toLowerCase().includes('locked') || raw.toLowerCase().includes('unlock')) {
    return 'Tu wallet está bloqueada. Desbloquéala primero.';
  }
  // Usuario rechazó
  if (code === 4001 || raw.includes('User rejected') || raw.includes('user rejected')) {
    return 'Conexión rechazada por el usuario.';
  }
  // Wallet no instalada
  if (raw.includes('NOT_DETECTED') || raw.includes('not detected')) {
    return WALLET_ERRORS.NOT_DETECTED;
  }

  return raw || WALLET_ERRORS.CONNECTION_FAILED;
}
