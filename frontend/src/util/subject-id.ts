import type { Identifier } from '@zcredjs/core';
import { WalletTypeEnum } from '@/types/wallet-type.enum.ts';


export function subjectTypeToWalletEnum(subjectType: string): WalletTypeEnum {
  if (subjectType === 'ethereum:address') {
    return WalletTypeEnum.Ethereum;
  }
  if (subjectType === 'mina:publickey') {
    return WalletTypeEnum.Auro;
  }
  throw new Error(`Unknown subject type: ${subjectType}`);
}

export function isSubjectIdsEqual(a: Identifier, b: Identifier): boolean {
  return !!a && !!b && a.type === b.type && a.key === b.key;
}

export function subjectIdToString(subjectId: Identifier): string {
  return `${subjectId.type}:${subjectId.key}`;
}
