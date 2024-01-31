import { create } from 'zustand';

const autoConnectKey = 'mina:isDisconnected';
const autoConnect = {
  isLocked: () => localStorage.getItem(autoConnectKey) === 'true',
  lock: () => localStorage.setItem(autoConnectKey, 'true'),
  unlock: () => localStorage.removeItem(autoConnectKey),
};


export const useMinaAccount = create<{
  account: string | null;
  setAccount: (account: string | null) => void;
  disconnect: () => void;
  connect: () => void;
  isConnecting: boolean;
}>(setState => ({
  isConnecting: false,
  account: autoConnect.isLocked() ? null : window.mina?.getAccounts()[0] ?? null,
  setAccount: (account: string | null) => setState({ account }),
  disconnect: () => {
    autoConnect.lock();
    setState({ account: null });
  },
  connect: async () => {
    autoConnect.unlock();
    setState({ isConnecting: true });
    try {
      const [account] = await window.mina?.requestAccounts() ?? [];
      setState({ account });
    } finally {
      setState({ isConnecting: false });
    }
  },
}));

window.mina?.on('accountsChanged', ([account]) => useMinaAccount.getState().setAccount(account));
