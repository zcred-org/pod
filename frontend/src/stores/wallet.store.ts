import { type ReadonlySignal } from '@preact/signals-react';
import type { Identifier, IWalletAdapter } from '@zcredjs/core';
import { EIP1193Adapter } from '@zcredjs/ethereum';
import { AuroWalletAdapter } from '@zcredjs/mina';
import { getConnectorClient } from '@/config/wagmi-config.ts';
import { WalletTypeEnum } from '@/types/wallet-type.enum.ts';
import { signal, computed } from '@/util/signals/signals-dev-tools.ts';

export type WalletStoreState = {
  adapter: IWalletAdapter,
  type: WalletTypeEnum,
  subjectId: Identifier,
  address: string,
  chainId: string,
};

export class WalletStore {
  static #$wallet = signal<WalletStoreState | null>(null, `${WalletStore.name}.wallet`);
  public static $isConnected = computed(() => !!WalletStore.$wallet.value, `${WalletStore.name}.isConnected`);
  static #nextWallet: WalletStoreState | undefined | null;

  static get $wallet(): ReadonlySignal<WalletStoreState | null> {
    return WalletStore.#$wallet;
  }

  /**
   * Change of state if it relates to the same type of wallet:
   * - If wallet is connected now, and (wasn't connected before or was connected the same type),
   * then upsert it.
   * - If was already connected and now connected another wallet type,
   * then ignore it.
   * - If disconnected the same wallet type as it was connected,
   * then clean it.
   */
  static async calcNextWallet(
    {
      maybeWalletType = null,
      isConnected,
    }: { maybeWalletType?: WalletTypeEnum | null, isConnected: boolean },
  ) {
    const state = WalletStore.#$wallet.peek();
    const shouldUpsert = isConnected && [undefined, maybeWalletType].includes(state?.type);
    const shouldClean = !isConnected && state?.type === maybeWalletType;
    if (shouldUpsert || shouldClean) {
      const adapter: IWalletAdapter | null =
        shouldUpsert
          ? maybeWalletType === WalletTypeEnum.Auro ? new AuroWalletAdapter(window.mina!)
            : maybeWalletType === WalletTypeEnum.Ethereum ? new EIP1193Adapter(await getConnectorClient())
              : null
          : shouldClean ? null
            : null;

      WalletStore.#nextWallet = maybeWalletType && adapter ? {
        adapter,
        type: maybeWalletType,
        subjectId: await adapter.getSubjectId(),
        address: await adapter.getAddress(),
        chainId: await adapter.getChainId(),
      } : null;
    }
  }

  static commit() {
    if (WalletStore.#nextWallet !== undefined) {
      WalletStore.#$wallet.value = WalletStore.#nextWallet;
      WalletStore.#nextWallet = undefined;
    }
  }

  static reset() {
    WalletStore.#$wallet.value = null;
  }
}
