import { batch, type ReadonlySignal } from '@preact/signals-react';
import { WalletStore } from '@/stores/wallet.store.ts';
import { WalletTypeEnum } from '@/types/wallet-type.enum.ts';
import { signal } from '@/util/signals-dev-tools.ts';

abstract class AuroAutoConnect {
  private static readonly autoConnectKey = 'mina:isAutoConnect';
  static isEnabled = () => localStorage.getItem(this.autoConnectKey) !== 'false';
  static disable = () => localStorage.setItem(this.autoConnectKey, 'false');
  static enable = () => localStorage.removeItem(this.autoConnectKey);
}

const _$address = signal<string | null>(null, 'AuroStore.address');
const _$isConnecting = signal(true, 'AuroStore.isConnecting');

export class AuroStore {
  static get $isConnecting(): ReadonlySignal<boolean> {
    return _$isConnecting;
  }

  static get address(): ReadonlySignal<string | null> {
    return _$address;
  }

  static async connect() {
    if (!window.mina) throw new Error('Can\'t connect mina: window.mina is undefined');
    _$isConnecting.value = true;
    AuroAutoConnect.enable();
    try {
      const [address] = await window.mina.requestAccounts() || [];
      await setAddress(address);
    } catch {
      await setAddress(null);
    }
  }

  static disconnect() {
    AuroAutoConnect.disable();
    _$address.value = null;
  }
}

const setAddress = async (address: string | null) => {
  try {
    await WalletStore.calcNextWallet({ maybeWalletType: WalletTypeEnum.Auro, isConnected: !!address });
  } finally {
    batch(() => {
      WalletStore.commit();
      _$address.value = address || null;
      _$isConnecting.value = false;
    });
  }
};

/** Listen Auro.accountsChanged event */
window.mina?.on('accountsChanged', ([address]) => AuroAutoConnect.isEnabled() && setAddress(address));

/** Auto connect on site load if auto connect allowed */
window.mina && AuroAutoConnect.isEnabled()
  ? window.mina.getAccounts().then(([address = null]) => setAddress(address))
  : _$isConnecting.value = false;
