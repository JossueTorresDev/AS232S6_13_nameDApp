/**
 * Configuración del contrato PublicFaucet desplegado en cada red.
 * Para añadir una red nueva: despliega PublicFaucet.sol y agrega su
 * dirección aquí con el chainId correspondiente.
 */
export const FAUCET_CONTRACT = {
  method: 'requestFunds',
  abi: [
    // requestFunds(address payable recipient)
    {
      inputs: [{ internalType: 'address payable', name: 'recipient', type: 'address' }],
      name: 'requestFunds',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    // cooldownRemaining(address) → uint256
    {
      inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
      name: 'cooldownRemaining',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function'
    },
    // dripAmount() → uint256
    {
      inputs: [],
      name: 'dripAmount',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function'
    },
    // getBalance() → uint256
    {
      inputs: [],
      name: 'getBalance',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function'
    },
    // totalRequests() → uint256
    {
      inputs: [],
      name: 'totalRequests',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function'
    },
    // totalDripped() → uint256
    {
      inputs: [],
      name: 'totalDripped',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function'
    },
    // totalFunded() → uint256
    {
      inputs: [],
      name: 'totalFunded',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function'
    },
    // fund() — recarga pública payable
    {
      inputs: [],
      name: 'fund',
      outputs: [],
      stateMutability: 'payable',
      type: 'function'
    },
    // Event FaucetDrip
    {
      anonymous: false,
      inputs: [
        { indexed: true,  internalType: 'address', name: 'recipient',    type: 'address' },
        { indexed: false, internalType: 'uint256', name: 'amount',       type: 'uint256' },
        { indexed: false, internalType: 'uint256', name: 'timestamp',    type: 'uint256' },
        { indexed: false, internalType: 'uint256', name: 'requestIndex', type: 'uint256' }
      ],
      name: 'FaucetDrip',
      type: 'event'
    },
    // Event FaucetFunded
    {
      anonymous: false,
      inputs: [
        { indexed: true,  internalType: 'address', name: 'funder', type: 'address' },
        { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' }
      ],
      name: 'FaucetFunded',
      type: 'event'
    }
  ] as const,

  /** chainId → dirección del contrato desplegado */
  addresses: {
    11155111: '0x34ebC75feE889806e27b07Abd7636249d3a18810', // Sepolia  ✅ desplegado
    560048:   '0xe8c923FaB7C919A7B66963e9eD8A90a33A8D6600', // Hoodi    ✅ desplegado
  } as Record<number, string>
};

export function getFaucetContractAddress(chainId: number): string {
  return FAUCET_CONTRACT.addresses[chainId] ?? '';
}

/** Redes en las que el faucet on-chain está configurado */
export function isFaucetContractAvailable(chainId: number): boolean {
  const addr = getFaucetContractAddress(chainId);
  return !!addr && addr !== '0x0000000000000000000000000000000000000000';
}
