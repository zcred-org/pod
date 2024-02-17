import { useWeb3ModalTheme } from '@web3modal/wagmi/react';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

const useThemeStore = create<{
  isDarkTheme: boolean;
  toggleTheme: () => void;
}>()(devtools(persist((set) => ({
  isDarkTheme: document.body.classList.contains('dark'),
  toggleTheme: () => set({ isDarkTheme: document.body.classList.toggle('dark') }, false, 'toggleTheme'),
}), {
  name: 'theme-storage',
  onRehydrateStorage: (initial) => (persisted) => {
    if (document.body.classList.contains('dark') !== (persisted?.isDarkTheme ?? initial.isDarkTheme)) {
      document.body.classList.toggle('dark');
    }
  },
}), { name: 'app', store: 'theme' }));

export const useTheme = () => {
  const store = useThemeStore();
  const web3ModalTheme = useWeb3ModalTheme();

  const toggleTheme = () => {
    web3ModalTheme.setThemeMode(store.isDarkTheme ? 'light' : 'dark');
    store.toggleTheme();
  };

  return {
    isDarkTheme: store.isDarkTheme,
    toggleTheme,
  };
};
