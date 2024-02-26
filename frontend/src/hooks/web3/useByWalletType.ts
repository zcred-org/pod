/* eslint-disable no-prototype-builtins */
import { useWalletTypeStore, WalletTypeEnum } from './useWalletType.store.ts';

// TODO: Need to ensure "Exact" type for args, because ts doesn't validate keys not in WalletTypeEnum
export const useByWalletType = <
  T extends Record<WalletTypeEnum, unknown>,
>(args: T) => {
  const walletType = useWalletTypeStore(state => state.walletType);
  return walletType && args.hasOwnProperty(walletType)
    ? args[walletType] as T[WalletTypeEnum]
    : null;
};
