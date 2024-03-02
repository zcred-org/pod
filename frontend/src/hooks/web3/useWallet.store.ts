import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { WalletAddressEventEmitter, WalletAddressEventsEnum } from '@/service/events/wallet-address-event.emitter.ts';
import { EIP1193Adapter } from '@zcredjs/ethereum';
import { AuroWalletAdapter } from '@zcredjs/mina';
import type { IWalletAdapter, Identifier } from '@zcredjs/core';
import { getConnectorClient } from '@wagmi/core';
import { wagmiConfig } from '@/config/wagmi-config.ts';
import { WalletTypeEnum } from '@/types/wallet-type.enum.ts';
import { queryClient } from '@/config/query-client.ts';

type State = {
  adapter: IWalletAdapter,
  type: WalletTypeEnum,
  subjectId: Identifier,
  address: string,
  chainId: string,
} | {
  adapter: null,
  type: null,
  subjectId: null,
  address: null,
  chainId: null,
}

type Actions = {
  /**
   * Change of state if it relates to the same type of wallet:
   * - If wallet is connected now, and (wasn't connected before or was connected the same type),
   * then upsert it.
   * - If was already connected and now connected another wallet type,
   * then ignore it.
   * - If disconnected the same wallet type as it was connected,
   * then clean it.
   */
  update: (args: { maybeWalletType?: WalletTypeEnum | null, isConnected: boolean, isForce?: boolean }) => void;
}

/**
 * Stores the wallet type and the adapter for that wallet
 */
export const useWalletStore = create<State & Actions>()(devtools((set, get) => ({
  adapter: null,
  type: null,
  subjectId: null,
  address: null,
  chainId: null,
  update: async ({ isConnected, maybeWalletType = null, isForce = false }) => {
    const state = get();
    const shouldUpsert = isConnected && (isForce || [null, maybeWalletType].includes(state.type));
    const shouldClean = !isConnected && (isForce || state.type === maybeWalletType);
    if (shouldClean) {
      queryClient.clear();
    }
    if (shouldUpsert || shouldClean) {
      const adapter = shouldUpsert
        ? maybeWalletType === WalletTypeEnum.Auro ? new AuroWalletAdapter(window.mina!)
          : maybeWalletType === WalletTypeEnum.Ethereum ? new EIP1193Adapter(await getConnectorClient(wagmiConfig))
            : null
        : shouldClean ? null
          : undefined;
      set({
        type: shouldUpsert ? maybeWalletType
          : shouldClean ? null
            : undefined,
        adapter: adapter,
        address: adapter ? await adapter.getAddress() : null,
        chainId: adapter ? await adapter.getChainId() : null,
        subjectId: adapter ? await adapter.getSubjectId() : null,
      } as Partial<State>, false, `update:${maybeWalletType}:${isConnected}${isForce ? ':force' : ''}`);
    }
  },
}), { name: 'app', store: 'wallet-store' }));

/**
 * Subscribe to wallet type events
 */
WalletAddressEventEmitter.subscribe(
  WalletAddressEventsEnum.WalletChanged,
  async function walletTypeStoreListener(walletType, address) {
    useWalletStore.getState().update({ maybeWalletType: walletType, isConnected: !!address });
  },
);
