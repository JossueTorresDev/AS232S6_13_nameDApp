/**
 * onchain.service.ts
 * Servicios para historial on-chain, tokens ERC-20 y notificaciones de tx recibida.
 * Usa el RPC de la red actual + APIs de block explorers cuando están disponibles.
 */

import { ethers }           from 'ethers';
import type { NetworkInfo } from '$lib/types/network';
import type { Transaction } from '$lib/types/transaction';
import { toastStore }       from '$lib/stores/toast.store';
import { activityStore }    from '$lib/stores/activity.store';

// ── ERC-20 minimal ABI ────────────────────────────────────────────────────────
const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint256)',
];

export interface TokenBalance {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  balance: string;       // formateado
  rawBalance: bigint;
}

// ── Known ERC-20 tokens per chainId ──────────────────────────────────────────
// Agrega aquí los tokens que quieras mostrar por defecto
const KNOWN_TOKENS: Record<number, string[]> = {
  1: [   // Ethereum Mainnet
    '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
    '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
  ],
  137: [ // Polygon
    '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // USDT
    '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC
  ],
  11155111: [], // Sepolia — sin tokens por defecto
};

// ── Fetch ERC-20 balances ─────────────────────────────────────────────────────
export async function fetchTokenBalances(
  address: string,
  network: NetworkInfo
): Promise<TokenBalance[]> {
  const tokenAddresses = KNOWN_TOKENS[network.chainId] ?? [];
  if (!tokenAddresses.length || network.type === 'UTXO') return [];

  try {
    const provider = new ethers.JsonRpcProvider(network.rpcUrl);
    const results: TokenBalance[] = [];

    await Promise.allSettled(
      tokenAddresses.map(async (tokenAddr) => {
        try {
          const contract  = new ethers.Contract(tokenAddr, ERC20_ABI, provider);
          const [name, symbol, decimals, rawBalance] = await Promise.all([
            contract.name(),
            contract.symbol(),
            contract.decimals(),
            contract.balanceOf(address),
          ]);

          if (rawBalance > 0n) {
            results.push({
              address: tokenAddr,
              name,
              symbol,
              decimals: Number(decimals),
              balance: ethers.formatUnits(rawBalance, decimals),
              rawBalance,
            });
          }
        } catch { /* token no disponible en esta red */ }
      })
    );

    return results;
  } catch {
    return [];
  }
}

// ── Fetch on-chain tx history via block explorer API ─────────────────────────
export interface OnChainTx {
  hash: string;
  from: string;
  to: string;
  value: string;       // en ETH/SYS
  timestamp: number;
  status: 'confirmed' | 'failed';
  blockNumber: number;
  gasUsed: string;
  isIncoming: boolean;
}

/** Etherscan-compatible API (Etherscan, Polygonscan, etc.) */
async function fetchFromEtherscanAPI(
  address: string,
  apiBase: string
): Promise<OnChainTx[]> {
  const url = `${apiBase}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&offset=20&page=1`;

  const res  = await fetch(url);
  const data = await res.json() as { status: string; result: unknown[] };

  if (data.status !== '1' || !Array.isArray(data.result)) return [];

  return data.result.slice(0, 20).map((tx: any) => ({
    hash:        tx.hash,
    from:        tx.from,
    to:          tx.to,
    value:       ethers.formatEther(BigInt(tx.value)),
    timestamp:   Number(tx.timeStamp) * 1000,
    status:      tx.isError === '0' ? 'confirmed' : 'failed',
    blockNumber: Number(tx.blockNumber),
    gasUsed:     tx.gasUsed,
    isIncoming:  tx.to?.toLowerCase() === address.toLowerCase(),
  }));
}

/** Mapa de chainId → URL base de la API del explorer */
const EXPLORER_APIS: Record<number, string> = {
  1:        'https://api.etherscan.io/api',
  137:      'https://api.polygonscan.com/api',
  11155111: 'https://api-sepolia.etherscan.io/api',
  80001:    'https://api-testnet.polygonscan.com/api',
};

export async function fetchOnChainHistory(
  address: string,
  network: NetworkInfo
): Promise<OnChainTx[]> {
  if (network.type === 'UTXO') return []; // UTXO no soportado aún

  const apiBase = EXPLORER_APIS[network.chainId];
  if (!apiBase) return [];

  try {
    return await fetchFromEtherscanAPI(address, apiBase);
  } catch {
    return [];
  }
}

// ── Incoming tx polling ───────────────────────────────────────────────────────
// NOTA SENIOR: En entornos de producción de gran escala, se aconseja reemplazar este mecanismo 
// de polling periódico (setInterval) por suscripciones activas vía WebSockets (wss://) o integrando 
// webhooks de infraestructura de nodos (como Alchemy/QuickNode). Esto reduce a cero el desperdicio 
// de ancho de banda y elimina el riesgo de bloqueos de IP por rebasar los límites de peticiones (Rate Limit).
let lastKnownBlock = 0;
let incomingPollInterval: ReturnType<typeof setInterval> | null = null;

export function startIncomingTxPolling(address: string, network: NetworkInfo) {
  stopIncomingTxPolling();
  if (network.type === 'UTXO') return;

  const provider = new ethers.JsonRpcProvider(network.rpcUrl);

  // Inicializar con el bloque actual
  provider.getBlockNumber().then(n => { lastKnownBlock = n; }).catch(() => {});

  incomingPollInterval = setInterval(async () => {
    try {
      const currentBlock = await provider.getBlockNumber();
      if (currentBlock <= lastKnownBlock) return;

      // Revisar bloques nuevos buscando txs hacia nuestra dirección
      for (let b = lastKnownBlock + 1; b <= Math.min(currentBlock, lastKnownBlock + 5); b++) {
        const block = await provider.getBlock(b, true);
        if (!block?.transactions) continue;

        for (const tx of block.transactions as ethers.TransactionResponse[]) {
          if (tx.to?.toLowerCase() === address.toLowerCase() && tx.value > 0n) {
            const amount = ethers.formatEther(tx.value);
            toastStore.success(`💰 Recibiste ${parseFloat(amount).toFixed(6)} ${network.currency}`);
            activityStore.log('tx_confirmed', `Tx recibida: ${amount} ${network.currency}`, {
              hash: tx.hash, from: tx.from,
            });
          }
        }
      }

      lastKnownBlock = currentBlock;
    } catch { /* RPC error — silencioso */ }
  }, 15_000); // cada 15s
}

export function stopIncomingTxPolling() {
  if (incomingPollInterval) {
    clearInterval(incomingPollInterval);
    incomingPollInterval = null;
  }
  lastKnownBlock = 0;
}
