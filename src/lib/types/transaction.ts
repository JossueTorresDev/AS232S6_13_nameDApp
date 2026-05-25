export interface Transaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  amount: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  gasUsed?: string;
  networkId: number;
  isTokenTx?: boolean;
  tokenAddress?: string;
  tokenSymbol?: string;
  viaContract?: boolean;
  contractAddress?: string;
  contractMethod?: string;
}

export interface TransactionRequest {
  to: string;
  amount: string;
  gasLimit?: string;
  gasPrice?: string;
}

