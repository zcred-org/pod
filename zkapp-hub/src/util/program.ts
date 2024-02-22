import { JalProgram } from "@jaljs/core";
import * as u8a from "uint8arrays";
import sortKeys from "sort-keys";
import { hash as sha256 } from "@stablelib/sha256";

export function toProgramId(jal: JalProgram) {
  const sorted = sortKeys(jal, { deep: true });
  const bytes = u8a.fromString(JSON.stringify(sorted));
  const postfix = u8a.toString(uint32ToBytes(bytes.length), "base64url");
  const hash = u8a.toString(sha256(bytes), "base64url");
  return hash + postfix;
}

function uint32ToBytes(num: number): Uint8Array {
  const maxUint32 = (2 ** 32) - 1;
  const _number = num % maxUint32;
  const bytes = new Uint8Array(4);
  bytes[0] = (_number >> 24) & 0xFF;
  bytes[1] = (_number >> 16) & 0xFF;
  bytes[2] = (_number >> 8) & 0xFF;
  bytes[3] = _number & 0xFF;
  return bytes;
}