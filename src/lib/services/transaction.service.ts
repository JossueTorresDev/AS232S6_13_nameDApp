import { ethers } from 'ethers';
import type { Transaction, NetworkInfo } from '$lib/types/wallet';
import { walletStore } from '$lib/stores/wallet.store';
import { transactionStore } from '$lib/stores/transaction.store';
import { activityStore }    from '$lib/stores/activity.store';
import { WALLET_ERRORS } from '$lib/constants/network';

declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider & { 
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on?: (event: string, callback: (args: unknown[]) => void) => void;
    };
  }
}

export async function sendTransaction(
  to: string,
  amount: string,
  network: NetworkInfo
): Promise<string> {
  try {
    if (!window.ethereum) {
      throw new Error(WALLET_ERRORS.NOT_DETECTED);
    }

    // Validar dirección
    if (!ethers.isAddress(to)) {
      throw new Error(WALLET_ERRORS.INVALID_ADDRESS);
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const fromAddress = await signer.getAddress();

    // Validar que no sea la misma dirección
    if (fromAddress.toLowerCase() === to.toLowerCase()) {
      throw new Error('No puedes enviar fondos a tu propia dirección');
    }

    // Obtener balance
    const balance = await provider.getBalance(fromAddress);
    const amountWei = ethers.parseEther(amount);

    if (balance < amountWei) {
      throw new Error(WALLET_ERRORS.INSUFFICIENT_BALANCE);
    }

    // Crear transacción
    const tx = await signer.sendTransaction({
      to,
      value: amountWei
    });

    // Guardar transacción en el store
    const transaction: Transaction = {
      id: `${Date.now()}`,
      hash: tx.hash,
      from: fromAddress,
      to,
      amount,
      timestamp: Date.now(),
      status: 'pending',
      networkId: network.chainId
    };

    transactionStore.addTransaction(transaction);
    activityStore.log('tx_sent', `Tx enviada: ${amount} → ${to}`, { hash: tx.hash, amount, to });

    // Esperar confirmación con timeout de 90s
    const receiptPromise = tx.wait();
    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT')), 90_000)
    );

    let receipt: Awaited<typeof receiptPromise> | null = null;
    try {
      receipt = await Promise.race([receiptPromise, timeoutPromise]) as Awaited<typeof receiptPromise>;
    } catch (timeoutErr: unknown) {
      if (timeoutErr instanceof Error && timeoutErr.message === 'TIMEOUT') {
        // La tx sigue pendiente — no es un error, solo tardó mucho
        return tx.hash;
      }
      throw timeoutErr;
    }

    if (receipt) {
      transactionStore.updateTransaction(tx.hash, {
        status: 'confirmed',
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      });
      activityStore.log('tx_confirmed', `Tx confirmada en bloque #${receipt.blockNumber}`, { hash: tx.hash, block: receipt.blockNumber });
      // Actualizar el saldo después de la confirmación
      await updateBalance(network);
    }

    return tx.hash;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : WALLET_ERRORS.TRANSACTION_FAILED;
    throw new Error(message);
  }
}

export async function switchNetwork(network: NetworkInfo): Promise<void> {
  // NOTA SENIOR: Actualmente toda la conmutación de red está ruteada bajo la interfaz EVM (window.ethereum).
  // Para soportar de forma nativa redes de tipo UTXO en producción con Pali Wallet, se debe implementar 
  // una bifurcación lógica para invocar el objeto global `window.pali` (Pali UTXO Provider) y utilizar 
  // sus métodos de comunicación específicos de cadena UTXO, evitando enviar RPCs de Ethereum a redes no-EVM.
  try {
    if (!window.ethereum) {
      throw new Error(WALLET_ERRORS.NOT_DETECTED);
    }

    const chainIdHex = `0x${network.chainId.toString(16)}`;

    try {
      // Intentar cambiar a la red
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }]
      });
    } catch (switchError: unknown) {
      // Si la red no existe, agregarla
      if ((switchError as { code?: number }).code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: chainIdHex,
              chainName: network.name,
              rpcUrls: [network.rpcUrl],
              nativeCurrency: {
                name: network.currency,
                symbol: network.currency,
                decimals: 18
              },
              blockExplorerUrls: network.blockExplorer ? [network.blockExplorer] : []
            }
          ]
        });
      } else {
        throw switchError;
      }
    }

    // Actualizar el balance después de cambiar de red
    await updateBalance(network);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : WALLET_ERRORS.NETWORK_SWITCH_FAILED;
    throw new Error(message);
  }
}

export async function updateBalance(network: NetworkInfo): Promise<void> {
  try {
    if (!window.ethereum) {
      throw new Error(WALLET_ERRORS.NOT_DETECTED);
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const rawBalance = await provider.getBalance(address);
    const balance = ethers.formatEther(rawBalance);

    walletStore.update(state => ({
      ...state,
      balance,
      address
    }));
  } catch (err: unknown) {
    console.error('Error updating balance:', err);
  }
}

export async function getTransactionDetails(hash: string, network: NetworkInfo): Promise<Transaction | null> {
  try {
    const provider = new ethers.JsonRpcProvider(network.rpcUrl);
    const tx = await provider.getTransaction(hash);
    const receipt = await provider.getTransactionReceipt(hash);

    if (!tx) return null;

    return {
      id: hash,
      hash: tx.hash,
      from: tx.from,
      to: tx.to || '',
      amount: ethers.formatEther(tx.value),
      timestamp: 0,
      status: receipt ? (receipt.status === 1 ? 'confirmed' : 'failed') : 'pending',
      blockNumber: receipt?.blockNumber,
      gasUsed: receipt?.gasUsed.toString(),
      networkId: network.chainId
    };
  } catch (err: unknown) {
    console.error('Error fetching transaction details:', err);
    return null;
  }
}
