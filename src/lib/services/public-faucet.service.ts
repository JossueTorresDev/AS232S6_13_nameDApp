/**
 * public-faucet.service.ts
 * Lógica de interacción con el contrato PublicFaucet y consulta masiva de saldo.
 */

import { ethers }                from 'ethers';
import type { NetworkInfo }      from '$lib/types/network';
import { AVAILABLE_NETWORKS }    from '$lib/constants/network';
import { FAUCET_CONTRACT, getFaucetContractAddress, isFaucetContractAvailable } from '$lib/constants/faucet-contract';
import { faucetStore }           from '$lib/stores/faucet.store';
import type { FaucetRequest }    from '$lib/stores/faucet.store';

// ── Multi-network balance ─────────────────────────────────────────────────────

export interface NetworkBalance {
  network: NetworkInfo;
  balance: string;       // formateado en ETH/SYS
  rawBalance: bigint;
  status: 'ok' | 'error' | 'loading';
  error?: string;
}

/**
 * Consulta el saldo nativo de una dirección en todas las redes EVM disponibles.
 * Las consultas se ejecutan en paralelo para minimizar el tiempo de espera.
 */
export async function fetchBalanceAllNetworks(
  address: string
): Promise<NetworkBalance[]> {
  if (!ethers.isAddress(address)) {
    throw new Error('Dirección inválida');
  }

  const evmNetworks = AVAILABLE_NETWORKS.filter(n => n.type === 'EVM');

  const results = await Promise.allSettled(
    evmNetworks.map(async (network): Promise<NetworkBalance> => {
      const provider = new ethers.JsonRpcProvider(network.rpcUrl);
      // timeout de 8s por red para no bloquear indefinidamente
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')), 8_000)
      );
      const balancePromise = provider.getBalance(address);
      const rawBalance = await Promise.race([balancePromise, timeoutPromise]);
      return {
        network,
        balance: ethers.formatEther(rawBalance),
        rawBalance,
        status: 'ok'
      };
    })
  );

  return results.map((result, i) => {
    if (result.status === 'fulfilled') return result.value;
    const errMsg = result.reason instanceof Error ? result.reason.message : 'Error de red';
    return {
      network:    evmNetworks[i],
      balance:    '0',
      rawBalance: 0n,
      status:     'error',
      error:      errMsg === 'TIMEOUT' ? 'Tiempo de espera agotado' : errMsg
    };
  });
}

// ── Faucet on-chain ───────────────────────────────────────────────────────────

export interface FaucetContractInfo {
  available:     boolean;
  balance:       string;    // balance del contrato formateado
  dripAmount:    string;    // monto por drip formateado
  totalRequests: number;
  totalDripped:  string;    // total distribuido formateado
  cooldownSecs:  number;    // cooldown configurado (segundos)
  remainingSecs: number;    // segundos restantes para este recipient (0 = disponible)
}

/**
 * Consulta el estado actual del contrato faucet en una red.
 * No requiere wallet conectada — usa JsonRpcProvider (solo lectura).
 */
export async function getFaucetContractInfo(
  network: NetworkInfo,
  recipientAddress?: string
): Promise<FaucetContractInfo> {
  const contractAddress = getFaucetContractAddress(network.chainId);
  const available       = isFaucetContractAvailable(network.chainId);

  if (!available) {
    return { available: false, balance: '0', dripAmount: '0', totalRequests: 0, totalDripped: '0', cooldownSecs: 0, remainingSecs: 0 };
  }

  try {
    const provider = new ethers.JsonRpcProvider(network.rpcUrl);
    const contract = new ethers.Contract(contractAddress, FAUCET_CONTRACT.abi, provider);

    const calls: Promise<unknown>[] = [
      contract.getBalance(),
      contract.dripAmount(),
      contract.totalRequests(),
      contract.totalDripped(),
      contract.cooldown?.() ?? Promise.resolve(86400n) // fallback 24h
    ];
    if (recipientAddress && ethers.isAddress(recipientAddress)) {
      calls.push(contract.cooldownRemaining(recipientAddress));
    }

    const [bal, drip, totalReqs, totalDrp, cooldownVal, remaining] =
      await Promise.all(calls) as [bigint, bigint, bigint, bigint, bigint, bigint | undefined];

    return {
      available:     true,
      balance:       ethers.formatEther(bal),
      dripAmount:    ethers.formatEther(drip),
      totalRequests: Number(totalReqs),
      totalDripped:  ethers.formatEther(totalDrp),
      cooldownSecs:  Number(cooldownVal),
      remainingSecs: remaining !== undefined ? Number(remaining) : 0
    };
  } catch {
    return { available: false, balance: '0', dripAmount: '0', totalRequests: 0, totalDripped: '0', cooldownSecs: 0, remainingSecs: 0 };
  }
}

/**
 * Solicita fondos del faucet on-chain vía window.ethereum.
 * Puede ser llamado sin una sesión de wallet activa siempre que el usuario
 * apruebe la tx en su extension (MetaMask / Pali Wallet).
 */
export async function requestFaucetFunds(
  recipient: string,
  network: NetworkInfo
): Promise<string> {
  if (!ethers.isAddress(recipient)) throw new Error('Dirección inválida');

  const contractAddress = getFaucetContractAddress(network.chainId);
  if (!isFaucetContractAvailable(network.chainId)) {
    throw new Error(`El faucet on-chain no está disponible en ${network.name}`);
  }

  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No se detectó una wallet en el navegador. Instala Pali Wallet o MetaMask.');
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer   = await provider.getSigner();

  const contract = new ethers.Contract(contractAddress, FAUCET_CONTRACT.abi, signer);
  const tx       = await (contract as any).requestFunds(recipient);

  // Registrar en el store como pendiente
  const pendingReq: FaucetRequest = {
    id:          `${Date.now()}`,
    recipient,
    amount:      '',                // se llenará al confirmar
    txHash:      tx.hash as string,
    networkId:   network.chainId,
    networkName: network.name,
    currency:    network.currency,
    timestamp:   Date.now(),
    status:      'pending'
  };
  faucetStore.addRequest(pendingReq);

  // Esperar confirmación con timeout de 90s
  const receiptPromise  = (tx as ethers.ContractTransactionResponse).wait();
  const timeoutPromise  = new Promise<null>((_, rej) =>
    setTimeout(() => rej(new Error('TIMEOUT')), 90_000)
  );

  try {
    const receipt = await Promise.race([receiptPromise, timeoutPromise]) as ethers.ContractTransactionReceipt | null;
    if (receipt) {
      // Leer dripAmount del contrato para saber cuánto se envió
      const readProvider = new ethers.JsonRpcProvider(network.rpcUrl);
      const readContract = new ethers.Contract(contractAddress, FAUCET_CONTRACT.abi, readProvider);
      let dripFormatted  = '';
      try {
        const drip: bigint = await readContract.dripAmount();
        dripFormatted = ethers.formatEther(drip);
      } catch { /* ignore */ }

      faucetStore.updateRequest(tx.hash as string, {
        status:      'confirmed',
        amount:      dripFormatted,
        blockNumber: receipt.blockNumber
      });
    }
  } catch (err) {
    if (err instanceof Error && err.message === 'TIMEOUT') {
      // La tx sigue pendiente — no es un error crítico
      return tx.hash as string;
    }
    faucetStore.updateRequest(tx.hash as string, { status: 'failed' });
    throw err;
  }

  return tx.hash as string;
}

/**
 * Obtiene el historial de eventos FaucetDrip de un contrato en una red.
 * Útil para el historial público del faucet sin necesidad de wallet.
 */
export interface FaucetDripEvent {
  recipient:    string;
  amount:       string;
  timestamp:    number;
  requestIndex: number;
  txHash:       string;
  blockNumber:  number;
}

export async function fetchFaucetHistory(
  network: NetworkInfo,
  limit = 50
): Promise<FaucetDripEvent[]> {
  const contractAddress = getFaucetContractAddress(network.chainId);
  if (!isFaucetContractAvailable(network.chainId)) return [];

  try {
    const provider  = new ethers.JsonRpcProvider(network.rpcUrl);
    const contract  = new ethers.Contract(contractAddress, FAUCET_CONTRACT.abi, provider);
    const currentBlock = await provider.getBlockNumber();
    // Buscar en los últimos 50 000 bloques
    const fromBlock = Math.max(0, currentBlock - 50_000);

    const filter = contract.filters['FaucetDrip']();
    const events = await contract.queryFilter(filter, fromBlock, 'latest') as ethers.EventLog[];

    return events
      .slice(-limit)
      .reverse()
      .map(e => ({
        recipient:    e.args[0] as string,
        amount:       ethers.formatEther(e.args[1] as bigint),
        timestamp:    Number(e.args[2] as bigint) * 1000,
        requestIndex: Number(e.args[3] as bigint),
        txHash:       e.transactionHash,
        blockNumber:  e.blockNumber
      }));
  } catch {
    return [];
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Formatea segundos en hh:mm:ss legible */
export function formatCooldown(seconds: number): string {
  if (seconds <= 0) return 'Disponible';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
