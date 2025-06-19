export const formatTxnHash = (hash: string) => {
  if (!hash) return '';
  return `${hash.slice(0, 10)}...${hash.slice(-10)}`;
};
