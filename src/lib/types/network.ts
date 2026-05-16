export interface NetworkInfo {
  name: string;
  label: string;
  chainId: number;
  rpcUrl: string;
  type: 'UTXO' | 'EVM';
  currency: string;
  blockExplorer?: string;
}
