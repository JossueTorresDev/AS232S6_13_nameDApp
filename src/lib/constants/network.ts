import type { NetworkInfo } from '$lib/types/wallet';

export const SYSCOIN_MAINNET: NetworkInfo = {
  name: 'Syscoin Mainnet',
  label: 'Mainnet',
  chainId: 57,
  rpcUrl: 'https://rpc.syscoin.org',
  type: 'UTXO',
  currency: 'SYS',
  blockExplorer: 'https://explorer.syscoin.org'
};

export const SYSCOIN_TESTNET: NetworkInfo = {
  name: 'Syscoin Testnet',
  label: 'Testnet',
  chainId: 5700,
  rpcUrl: 'https://testnet-rpc.syscoin.org',
  type: 'UTXO',
  currency: 'tSYS',
  blockExplorer: 'https://testnet-explorer.syscoin.org'
};

export const ROLLUX: NetworkInfo = {
  name: 'Rollux',
  label: 'Mainnet',
  chainId: 570,
  rpcUrl: 'https://rpc.rollux.com',
  type: 'EVM',
  currency: 'SYS',
  blockExplorer: 'https://explorer.rollux.com'
};

export const SYSCOIN_NEVM: NetworkInfo = {
  name: 'Syscoin NEVM',
  label: 'NEVM',
  chainId: 5702,
  rpcUrl: 'https://rpc.syscoin.org',
  type: 'EVM',
  currency: 'SYS',
  blockExplorer: 'https://explorer.syscoin.org'
};

export const ETHEREUM_MAINNET: NetworkInfo = {
  name: 'Ethereum Mainnet',
  label: 'Mainnet',
  chainId: 1,
  rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/demo',
  type: 'EVM',
  currency: 'ETH',
  blockExplorer: 'https://etherscan.io'
};

export const POLYGON_MAINNET: NetworkInfo = {
  name: 'Polygon Mainnet',
  label: 'Mainnet',
  chainId: 137,
  rpcUrl: 'https://polygon-rpc.com',
  type: 'EVM',
  currency: 'MATIC',
  blockExplorer: 'https://polygonscan.com'
};

export const SYSCOIN_NEVM_TESTNET: NetworkInfo = {
  name: 'Syscoin NEVM Testnet',
  label: 'Testnet',
  chainId: 5701,
  rpcUrl: 'https://testnet-rpc.syscoin.org',
  type: 'EVM',
  currency: 'tSYS',
  blockExplorer: 'https://testnet-explorer.syscoin.org'
};

export const ZKSYS_POB_DEVNET: NetworkInfo = {
  name: 'zkSYS PoB Devnet',
  label: 'Devnet',
  chainId: 57042,
  rpcUrl: 'https://rpc-pob.dev11.top/',
  type: 'EVM',
  currency: 'TSYS',
  blockExplorer: 'https://explorer-pob.dev11.top'
};

export const ZKSYS_TESTNET: NetworkInfo = {
  name: 'zkSYS Testnet',
  label: 'Testnet',
  chainId: 57057,
  rpcUrl: 'https://rpc-zk.tanenbaum.io/',
  type: 'EVM',
  currency: 'TSYS',
  blockExplorer: 'https://explorer-zk.tanenbaum.io'
};

export const ETHEREUM_HOODI: NetworkInfo = {
  name: 'Ethereum Hoodi',
  label: 'Testnet',
  chainId: 560048,
  rpcUrl: 'https://0xrpc.io/hoodi',
  type: 'EVM',
  currency: 'ETH',
  blockExplorer: 'https://hoodi.etherscan.io/'
};

export const ETHEREUM_SEPOLIA: NetworkInfo = {
  name: 'Ethereum Sepolia',
  label: 'Testnet',
  chainId: 11155111,
  rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com/',
  type: 'EVM',
  currency: 'ETH',
  blockExplorer: 'https://sepolia.etherscan.io/'
};

export const POLYGON_MUMBAI: NetworkInfo = {
  name: 'Polygon Mumbai',
  label: 'Testnet',
  chainId: 80001,
  rpcUrl: 'https://rpc-mumbai.maticvigil.com',
  type: 'EVM',
  currency: 'MATIC',
  blockExplorer: 'https://mumbai.polygonscan.com'
};

export const AVAILABLE_NETWORKS: NetworkInfo[] = [
  SYSCOIN_MAINNET,
  SYSCOIN_TESTNET,
  ROLLUX,
  SYSCOIN_NEVM,
  ETHEREUM_MAINNET,
  POLYGON_MAINNET,
  SYSCOIN_NEVM_TESTNET,
  ZKSYS_POB_DEVNET,
  ZKSYS_TESTNET,
  ETHEREUM_HOODI,
  ETHEREUM_SEPOLIA,
  POLYGON_MUMBAI
];

export const UTXO_NETWORKS = AVAILABLE_NETWORKS.filter(n => n.type === 'UTXO');
export const EVM_NETWORKS = AVAILABLE_NETWORKS.filter(n => n.type === 'EVM');

/**
 * Redes EVM con RPC públicos estables.
 * Usadas exclusivamente para la consulta masiva de saldo (multi-network balance).
 * Se excluyen las redes con RPCs caídos, con API key requerida o deprecadas.
 */
export const MULTIBALANCE_NETWORKS: NetworkInfo[] = [
  ROLLUX,
  SYSCOIN_NEVM,
  ZKSYS_TESTNET,
  ETHEREUM_HOODI,
  ETHEREUM_SEPOLIA,
];

export const WALLET_ERRORS = {
  NOT_DETECTED: 'Pali Wallet no detectada. Instálala como extensión del navegador.',
  CONNECTION_FAILED: 'Error al conectar la wallet',
  INVALID_ADDRESS: 'Dirección inválida',
  INSUFFICIENT_BALANCE: 'Saldo insuficiente',
  TRANSACTION_FAILED: 'Error al enviar la transacción',
  NETWORK_SWITCH_FAILED: 'Error al cambiar de red'
} as const;
