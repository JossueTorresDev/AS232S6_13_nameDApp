// Re-exports para compatibilidad con imports existentes
export type { NetworkInfo }      from './network';
export type { Transaction, TransactionRequest } from './transaction';

export interface WalletState {
  address: string;
  balance: string;
  connected: boolean;
  loading: boolean;
  error: string;
  currentNetwork?: import('./network').NetworkInfo;
}
