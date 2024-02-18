import * as u8a from 'uint8arrays';

const didKeyBegin = 'did:key:';
const hexAddressBegin = '0x';

export const addressShort = (address: string) => {
  // 0x0000000000000000000000000000000000000000
  // did:key:000000000000000000000000000000000000000000000000
  const from = address.startsWith(didKeyBegin) ? didKeyBegin.length
    : address.startsWith(hexAddressBegin) ? hexAddressBegin.length
      : 0;
  return `${address.slice(from, from + 4)}...${address.slice(-4)}`;
};

export const base64UrlDecode = (base64string: string) => {
  return u8a.toString(u8a.fromString(base64string, 'base64url'), 'utf-8');
};
