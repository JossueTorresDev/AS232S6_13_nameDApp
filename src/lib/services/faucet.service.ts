import type { NetworkInfo } from '$lib/types/network';

export interface FaucetInfo {
  label: string;
  url: string;
  supportsAddress: boolean;
  title?: string;
  description?: string;
}

const FAUCET_INFO: Record<number, FaucetInfo> = {
  560048: {
    label: 'Google Cloud Web3 Faucet',
    title: 'Ethereum Hoodi Faucet',
    description: 'Get free Hoodi ETH sent directly to your wallet. Brought to you by Google Cloud for Web3.',
    url: 'https://cloud.google.com/application/web3/faucet/ethereum/hoodi',
    supportsAddress: false,
  },
  11155111: {
    label: 'Google Cloud Web3 Faucet',
    title: 'Ethereum Sepolia Faucet',
    description: 'Get free Sepolia ETH sent directly to your wallet. Brought to you by Google Cloud for Web3.',
    url: 'https://cloud.google.com/application/web3/faucet/ethereum/sepolia',
    supportsAddress: false,
  },
  80001: {
    label: 'Google Cloud Web3 Faucet',
    description: 'Get free Mumbai MATIC from Google Cloud Web3.',
    url: 'https://cloud.google.com/web3',
    supportsAddress: false,
  },
  5700: {
    label: 'Google Cloud Web3 Faucet',
    description: 'Get free Syscoin Testnet funds from Google Cloud Web3.',
    url: 'https://cloud.google.com/web3',
    supportsAddress: false,
  },
};

export function getFaucetInfoForNetwork(network: NetworkInfo): FaucetInfo | undefined {
  return FAUCET_INFO[network.chainId];
}

export function buildFaucetUrl(network: NetworkInfo, address?: string): string | undefined {
  const faucet = getFaucetInfoForNetwork(network);
  if (!faucet) return undefined;

  if (!address || !faucet.supportsAddress) {
    return faucet.url;
  }

  if (faucet.url.includes('{address}')) {
    return faucet.url.replace('{address}', encodeURIComponent(address));
  }

  return `${faucet.url}${faucet.url.includes('?') ? '&' : '?'}address=${encodeURIComponent(address)}`;
}
