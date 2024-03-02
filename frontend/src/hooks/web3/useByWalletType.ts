/* eslint-disable no-prototype-builtins */
import { useWalletStore } from './useWallet.store.ts';
import type { Exact } from 'type-fest';
import type { WalletTypeEnum } from '@/types/wallet-type.enum.ts';

export const useByWalletType = <
  T extends Exact<Record<WalletTypeEnum, unknown>, T>,
>(args: T) => {
  const walletType = useWalletStore(state => state.type);
  return walletType && args.hasOwnProperty(walletType)
    ? args[walletType] as T[WalletTypeEnum]
    : null;
};
