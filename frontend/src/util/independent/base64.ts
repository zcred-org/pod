import * as u8a from 'uint8arrays';


export function base64UrlEncode(string: string): string {
  return u8a.toString(u8a.fromString(string, 'utf-8'), 'base64url');
}

export function base64UrlDecode(base64string: string) {
  return u8a.toString(u8a.fromString(base64string, 'base64url'), 'utf-8');
}
