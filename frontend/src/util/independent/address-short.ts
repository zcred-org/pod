export const addressShort = (address: string) => {
  const didKeyBegin = 'did:key:';
  const hexAddressBegin = '0x';
  if (address.startsWith(didKeyBegin)) {
    // did:key:000000000000000000000000000000000000000000000000
    return `${address.slice(didKeyBegin.length, didKeyBegin.length + 4)}...${address.slice(-4)}`;
  } else if (address.startsWith(hexAddressBegin)) {
    // 0x0000000000000000000000000000000000000000
    return `${address.slice(0, hexAddressBegin.length + 4)}...${address.slice(-4)}`;
  } else {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  }
};
