import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { WalletAddressEventEmitter, WalletAddressEventsEnum } from '../../service/events/wallet-address-event.emitter.ts';

export enum WalletTypeEnum {
  Ethereum = 'Ethereum',
  Auro = 'Auro',
}

type State = {
  walletType: WalletTypeEnum | null,
}

type Actions = {
  /* Reset wallet type to null or force to set new value */
  reset: (next?: WalletTypeEnum | null) => void;
  /* Try to set wallet type if it's not set yet */
  trySet: (maybeNext: WalletTypeEnum) => void;
  /* Reset wallet type if it's the same as current */
  resetIf: (current: WalletTypeEnum) => void;
}

/**
 * Used to determine by which wallet type user is authorized
 */
export const useWalletTypeStore = create<State & Actions>()(devtools(persist((set, get) => ({
  walletType: null,
  reset: (next = null) => set({ walletType: next }, false, `reset`),
  trySet: (maybeNext) => !get().walletType && set({ walletType: maybeNext }, false, `trySet:${maybeNext}`),
  resetIf: (current) => current === get().walletType && set({ walletType: null }, false, `resetIf:${current}`),
}), {
  name: 'wallet-type-store',
}), { name: 'app', store: 'wallet-type-store' }));

/**
 * Subscribe to wallet type events
 */
WalletAddressEventEmitter.subscribe(WalletAddressEventsEnum.WalletChanged, function walletTypeStoreListener(walletType, address) {
  const walletTypeState = useWalletTypeStore.getState();
  address ? walletTypeState.trySet(walletType) : walletTypeState.resetIf(walletType);
});
