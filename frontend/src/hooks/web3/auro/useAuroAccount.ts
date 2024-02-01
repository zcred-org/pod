import { create } from 'zustand';
import { auroWalletAdapter } from '../../../common/api/wallet-adapter-auro.ts';
import { devtools } from 'zustand/middleware';

const autoConnectKey = 'mina:isDisconnected';
const autoConnect = {
  isLocked: () => localStorage.getItem(autoConnectKey) === 'true',
  lock: () => localStorage.setItem(autoConnectKey, 'true'),
  unlock: () => localStorage.removeItem(autoConnectKey),
};

export const useAuroAccount = create<{
  address: string | null;
  isConnecting: boolean;
  setAddress: (address: string | null) => void;
  connect: () => void;
  disconnect: () => void;
}>()(devtools((set, get) => ({
  isConnecting: false,
  address: null,
  setAddress: (address: string | null) => {
    if (address === get().address) return;
    set({ address: address || null }, false, `setAddress:${address}`);
  },
  disconnect: () => {
    autoConnect.lock();
    set({ address: null }, false, 'disconnect');
  },
  connect: async () => {
    set({ isConnecting: true }, false, 'connect');
    autoConnect.unlock();
    let address = null;
    try {
      address = await auroWalletAdapter?.getAddress();
    } finally {
      set({ isConnecting: false, address }, false, 'connect');
    }
  },
}), { name: 'app', store: 'auro-account' }));

window.mina?.on('accountsChanged', ([address]) => {
  useAuroAccount.getState().setAddress(address);
});

if (!autoConnect.isLocked()) {
  auroWalletAdapter?.getAddress()
    .then(address => address && useAuroAccount.getState().setAddress(address));
}
