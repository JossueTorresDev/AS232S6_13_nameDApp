/** Acorta una dirección: 0x1234...abcd */
export function shortAddress(addr: string): string {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

/** Formatea balance con N decimales */
export function formatBalance(balance: string, decimals = 4): string {
  return parseFloat(balance).toFixed(decimals);
}
