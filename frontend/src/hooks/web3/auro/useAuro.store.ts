import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { WalletAddressEventEmitter, WalletAddressEventsEnum } from '@/service/events/wallet-address-event.emitter.ts';
import { WalletTypeEnum } from '@/types/wallet-type.enum.ts';

abstract class AuroAutoConnect {
  private static readonly autoConnectKey = 'mina:isDisconnected';
  static isLocked = () => localStorage.getItem(this.autoConnectKey) === 'true';
  static lock = () => localStorage.setItem(this.autoConnectKey, 'true');
  static unlock = () => localStorage.removeItem(this.autoConnectKey);
}

type State = {
  address: string | null;
  isConnecting: boolean;
}

type Actions = {
  connect: () => void;
  disconnect: () => void;
}

export const useAuroStore = create<State & Actions>()(devtools((set) => ({
  isConnecting: false,
  address: null,
  connect: async () => {
    if (!window.mina) throw new Error('Can\'t connect mina: window.mina is undefined');
    set({ isConnecting: true }, false, 'connecting');
    AuroAutoConnect.unlock();
    let address = null;
    try {
      [address] = await window.mina?.requestAccounts() || [null];
    } finally {
      setAuroAddress(address, { isConnecting: false });
    }
  },
  disconnect: () => {
    AuroAutoConnect.lock();
    setAuroAddress(null);
  },
}), { name: 'app', store: 'auro-store' }));

/**
 * Private action for setting the auro address.
 * But it's not for export.
 */
const setAuroAddress = (address: string | null, other?: Partial<State>) => {
  if (useAuroStore.getState().address === address) return;
  useAuroStore.setState({
    ...other,
    address: address || null,
  }, false, `setAuroAddress:${address || 'null'}`);
  WalletAddressEventEmitter.emit(WalletAddressEventsEnum.WalletChanged, WalletTypeEnum.Auro, address || null);
};

/** Listen to the accountsChanged event */
window.mina?.on('accountsChanged', ([address]) => setAuroAddress(address || null));

/** Auto connect if not locked on site load */
if (!AuroAutoConnect.isLocked()) {
  window.mina?.getAccounts()
    .then(([address]) => address && setAuroAddress(address));
}
