import { useWeb3ModalTheme } from '@web3modal/wagmi/react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeStore = {
  isDarkTheme: boolean;
  toggleTheme: () => void;
};

const useThemeStore = create<ThemeStore>()(persist((set) => ({
  isDarkTheme: document.body.classList.contains('dark'),
  toggleTheme: () => set({ isDarkTheme: document.body.classList.toggle('dark') }),
}), {
  name: 'theme-storage',
  onRehydrateStorage: (initial) => (persisted) => {
    if (document.body.classList.contains('dark') !== persisted?.isDarkTheme ?? initial.isDarkTheme) {
      document.body.classList.toggle('dark');
    }
  },
}));

export const useTheme = () => {
  const { isDarkTheme, toggleTheme: rawToggleTheme } = useThemeStore();
  const { setThemeMode } = useWeb3ModalTheme();

  const toggleTheme = () => {
    setThemeMode(isDarkTheme ? 'light' : 'dark');
    rawToggleTheme();
  };

  return {
    isDarkTheme,
    toggleTheme,
  };
};
