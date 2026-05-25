export const DEFAULT_CONTRACT = {
  method: 'sendFromContract',
  payable: false,
  addresses: {
    // Hoodi: contrato fondeable recientemente desplegado.
    560048: '0x7c3F23f10C901c969fBb5B0d8C62403cc862168B'
  } as Record<number, string>,
  abi: [
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'from',
          type: 'address'
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'to',
          type: 'address'
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256'
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'timestamp',
          type: 'uint256'
        }
      ],
      name: 'Funded',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'from',
          type: 'address'
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'to',
          type: 'address'
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256'
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'timestamp',
          type: 'uint256'
        }
      ],
      name: 'Transferred',
      type: 'event'
    },
    {
      inputs: [
        {
          internalType: 'address payable',
          name: 'recipient',
          type: 'address'
        },
        {
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256'
        }
      ],
      name: 'sendFromContract',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      stateMutability: 'payable',
      type: 'function',
      name: 'fundContract',
      inputs: [],
      outputs: []
    },
    {
      stateMutability: 'payable',
      type: 'receive'
    },
    {
      stateMutability: 'payable',
      type: 'fallback'
    }
  ] as const
};

export function getDefaultContractAddress(chainId: number): string {
  return DEFAULT_CONTRACT.addresses[chainId] ?? '';
}