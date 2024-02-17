import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { AuroWalletAdapter } from '@zcredjs/mina';

abstract class AuroAutoConnect {
  private static readonly autoConnectKey = 'mina:isDisconnected';
  static isLocked = () => localStorage.getItem(this.autoConnectKey) === 'true';
  static lock = () => localStorage.setItem(this.autoConnectKey, 'true');
  static unlock = () => localStorage.removeItem(this.autoConnectKey);
}

type State = {
  auroWalletAdapter: AuroWalletAdapter | null;
  address: string | null;
  isConnecting: boolean;
}

type Actions = {
  connect: () => void;
  disconnect: () => void;
}

export const useAuroStore = create<State & Actions>()(devtools((set) => ({
  auroWalletAdapter: null,
  isConnecting: false,
  address: null,
  disconnect: () => {
    AuroAutoConnect.lock();
    setAuroAddress(null);
  },
  connect: async () => {
    if (!window.mina) throw new Error('Can\'t connect mina: window.mina not is undefined');
    set({ isConnecting: true }, false, 'connecting');
    AuroAutoConnect.unlock();
    let address = null;
    try {
      [address] = await window.mina?.getAccounts() || [null];
    } finally {
      setAuroAddress(address, { isConnecting: false });
    }
  },
}), { name: 'app', store: 'auro-account' }));

/**
 * Action for setting the auro address.
 * But it's not for export.
 */
const setAuroAddress = (address: string | null, other?: Partial<State>) => useAuroStore.setState({
  ...other,
  address: address || null,
  auroWalletAdapter: address && window.mina ? new AuroWalletAdapter(window.mina) : null,
});

/** Listen to the accountsChanged event */
window.mina?.on('accountsChanged', ([address]) => setAuroAddress(address));

/** Auto connect if not locked on site load */
if (!AuroAutoConnect.isLocked()) {
  window.mina?.getAccounts()
    .then(([address]) => address && setAuroAddress(address));
}
