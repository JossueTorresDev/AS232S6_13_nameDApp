import { transactionStore } from '$lib/stores/transaction.store';
import type { NetworkInfo, Transaction } from '$lib/types/wallet';
import { ethers } from 'ethers';

export async function fetchHistoryFromExplorer(address: string, network: NetworkInfo): Promise<void> {
  if (!address || !network || !network.blockExplorer) return;
  
  transactionStore.setLoading(true);
  try {
    // Si la red es EVM, casi todos los exploradores soportan la API tipo Etherscan/Blockscout
    // Ej: https://sepolia.etherscan.io/api?module=account&action=txlist&address=0x...
    let apiUrl = '';
    
    // Construir la URL base de la API según el explorador
    if (network.blockExplorer.includes('etherscan.io') || network.blockExplorer.includes('polygonscan.com')) {
      // Etherscan based
      const domain = new URL(network.blockExplorer).hostname;
      apiUrl = `https://api-${domain}/api`;
      if (domain === 'etherscan.io') apiUrl = 'https://api.etherscan.io/api';
    } else {
      // Blockscout o similar (Rollux, zkSYS, etc) usualmente la api está en /api
      apiUrl = `${network.blockExplorer}/api`;
    }

    const res = await fetch(`${apiUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=50&sort=desc`);
    const data = await res.json();

    if (data.status === '1' && Array.isArray(data.result)) {
      // Parsear las transacciones
      const fetchedTxs: Transaction[] = data.result.map((tx: any) => ({
        id: tx.hash,
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        amount: ethers.formatEther(tx.value || '0'),
        timestamp: parseInt(tx.timeStamp) * 1000,
        status: tx.isError === '0' ? 'confirmed' : 'failed',
        blockNumber: parseInt(tx.blockNumber),
        gasUsed: tx.gasUsed,
        networkId: network.chainId
      }));
      
      // Actualizar el store local combinando con las que ya están en RAM (para no perder las recientes)
      transactionStore.update(state => {
        const existingIds = new Set(fetchedTxs.map((t: Transaction) => t.hash));
        const keptTxs = state.transactions.filter(t => !existingIds.has(t.hash));
        return {
          ...state,
          transactions: [...keptTxs, ...fetchedTxs],
          loading: false
        };
      });
    } else if (data.status === '0' && data.result) {
      transactionStore.setLoading(false);
    } else {
      transactionStore.setLoading(false);
    }
  } catch (error) {
    console.error('Error fetching history:', error);
    transactionStore.setLoading(false);
  }
}
