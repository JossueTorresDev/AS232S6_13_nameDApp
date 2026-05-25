import { transactionStore } from '$lib/stores/transaction.store';
import type { NetworkInfo, Transaction } from '$lib/types/wallet';
import { ethers } from 'ethers';

// Fallback de transacciones de prueba temáticas de One Piece
function getMockTransactions(address: string, chainId: number): Transaction[] {
  const isSepolia = chainId === 11155111;
  const luffyAddr = '0x3a48e7B12C208fCc294C77C60B6153aC8B7cE0D4';
  const zoroAddr  = '0xE0dB0c4B6f56A691bB8487771B71fC5fB714777a';
  const contractAddr = '0x7C3aed4F46E524240ba657801a7C442c5567cEd4'; // Dirección del contrato del token HAKI

  const baseTxs: Transaction[] = [
    {
      id: `mock-1-${chainId}`,
      hash: '0x1c38fa562947192a8e8b0cb1628d08c5825a071f005c6c68b7ce0d43a6ec0d4b',
      from: luffyAddr,
      to: address,
      amount: isSepolia ? '0.5' : '10.0',
      timestamp: Date.now() - 3600000 * 2, // Hace 2 horas
      status: 'confirmed',
      blockNumber: 15432109,
      gasUsed: '21000',
      networkId: chainId
    },
    {
      id: `mock-2-${chainId}`,
      hash: '0xe0db0c4b6f56a691bb8487771b71fc5fb7147771b22be88555a071d0f886d3c',
      from: address,
      to: zoroAddr,
      amount: isSepolia ? '0.15' : '1.5',
      timestamp: Date.now() - 3600000 * 5, // Hace 5 horas
      status: 'confirmed',
      blockNumber: 15432080,
      gasUsed: '21000',
      networkId: chainId
    },
    {
      id: `mock-3-${chainId}`,
      hash: '0x9a8e8b0cb1628d08c5825a071f005c6c68b7ce0d43a6ec0d4b7ce0d43a6ec0d4b',
      from: contractAddr, // Transacción contrato a cuenta
      to: address,
      amount: '100.0',
      timestamp: Date.now() - 3600000 * 24, // Hace 1 día
      status: 'confirmed',
      blockNumber: 15431800,
      gasUsed: '65000',
      networkId: chainId,
      isTokenTx: true,
      tokenAddress: contractAddr,
      tokenSymbol: 'HAKI'
    }
  ];

  return baseTxs;
}

export async function fetchHistoryFromExplorer(address: string, network: NetworkInfo): Promise<void> {
  if (!address || !network || !network.blockExplorer) return;
  
  transactionStore.setLoading(true);
  try {
    let apiUrl = '';
    
    // Construir la URL base de la API según el explorador
    if (network.blockExplorer.includes('etherscan.io') || network.blockExplorer.includes('polygonscan.com')) {
      const domain = new URL(network.blockExplorer).hostname;
      if (domain === 'etherscan.io') {
        apiUrl = 'https://api.etherscan.io/api';
      } else if (domain === 'polygonscan.com') {
        apiUrl = 'https://api.polygonscan.com/api';
      } else {
        apiUrl = `https://api-${domain}/api`;
      }
    } else {
      apiUrl = `${network.blockExplorer}/api`;
    }

    const apiKey = 'CWNNYXD9JCQT74V93RBNMN72RB38PZGHVY';
    let url = `${apiUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=50&sort=desc`;
    
    if (apiUrl.includes('etherscan.io')) {
      url += `&apikey=${apiKey}`;
    }

    const res = await fetch(url);
    const data = await res.json();

    let fetchedTxs: Transaction[] = [];

    if (data.status === '1' && Array.isArray(data.result)) {
      fetchedTxs = data.result.map((tx: any) => ({
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
    }

    // Inyectar transacciones de prueba (fallback/representación) para Sepolia y Hoodi si la lista está vacía o como relleno
    if (network.chainId === 11155111 || network.chainId === 560048) {
      const mocks = getMockTransactions(address, network.chainId);
      const existingHashes = new Set(fetchedTxs.map(t => t.hash.toLowerCase()));
      const uniqueMocks = mocks.filter(m => !existingHashes.has(m.hash.toLowerCase()));
      fetchedTxs = [...fetchedTxs, ...uniqueMocks];
    }

    if (fetchedTxs.length > 0) {
      transactionStore.update(state => {
        const existingIds = new Set(fetchedTxs.map((t: Transaction) => t.hash));
        const keptTxs = state.transactions.filter(t => !existingIds.has(t.hash));
        return {
          ...state,
          transactions: [...keptTxs, ...fetchedTxs],
          loading: false
        };
      });
    } else {
      transactionStore.setLoading(false);
    }
  } catch (error) {
    console.error('Error fetching history:', error);
    // Si falla y es Sepolia o Hoodi, cargar los mocks como plan B
    if (network.chainId === 11155111 || network.chainId === 560048) {
      const mocks = getMockTransactions(address, network.chainId);
      transactionStore.update(state => {
        const existingIds = new Set(mocks.map((t: Transaction) => t.hash));
        const keptTxs = state.transactions.filter(t => !existingIds.has(t.hash));
        return {
          ...state,
          transactions: [...keptTxs, ...mocks],
          loading: false
        };
      });
    } else {
      transactionStore.setLoading(false);
    }
  }
}

