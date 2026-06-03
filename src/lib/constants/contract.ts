export const DEFAULT_CONTRACT = {
  method: 'routeTransfer',
  payable: true,
  addresses: {
    // Hoodi: contrato fondeable recientemente desplegado.
    560048: '0x132bDd8827B1dFB98f47b1dF547e4199e1840902',
    // Sepolia (testnet)
    11155111: '0x132bDd8827B1dFB98f47b1dF547e4199e1840902'
  } as Record<number, string>,
  abi: [
    {
      inputs: [
        {
          internalType: 'address payable',
          name: 'recipient',
          type: 'address'
        }
      ],
      name: 'routeTransfer',
      outputs: [],
      stateMutability: 'payable',
      type: 'function'
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
      name: 'TransferredThroughContract',
      type: 'event'
    },
    {
      stateMutability: 'payable',
      type: 'receive'
    }
  ] as const
};

export function getDefaultContractAddress(chainId: number): string {
  return DEFAULT_CONTRACT.addresses[chainId] ?? '';
}