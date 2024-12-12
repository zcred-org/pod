import * as u8a from 'uint8arrays';


export function base64UrlEncode(string: string): string {
  return u8a.toString(u8a.fromString(string, 'utf-8'), 'base64url');
}

export function base64UrlDecode(base64string: string) {
  return u8a.toString(u8a.fromString(base64string, 'base64url'), 'utf-8');
}

export const Base58Btc = {
  encode: (hex: string) => {
    const signature = hex.startsWith('0x') ? hex.slice(2) : hex;
    return u8a.toString(u8a.fromString(signature.toLowerCase(), 'hex'), 'base58btc');
  },
  decode: (base58: string) => '0x' + u8a.toString(u8a.fromString(base58, 'base58btc'), 'hex'),
};
