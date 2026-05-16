function shortAddress(addr) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
function formatBalance(balance, decimals = 4) {
  return parseFloat(balance).toFixed(decimals);
}
export {
  formatBalance as f,
  shortAddress as s
};
