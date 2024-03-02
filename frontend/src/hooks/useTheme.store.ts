import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { web3modal } from '@/config/wagmi-config.ts';

export const useThemeStore = create<{
  isDark: boolean;
  toggle: () => void;
}>()(devtools(persist((set) => ({
  isDark: window.matchMedia('(prefers-color-scheme: dark)').matches, // document.body.classList.contains('dark'),
  toggle: () => {
    const isDark = document.body.classList.toggle('dark');
    web3modal.setThemeMode(isDark ? 'dark' : 'light');
    set({ isDark }, false, 'toggle');
  },
}), {
  name: 'theme-store',
  onRehydrateStorage: (initial) => (persisted) => {
    const isDark = persisted?.isDark ?? initial.isDark;
    if (document.body.classList.contains('dark') !== isDark) {
      document.body.classList.toggle('dark');
    }
    if ((web3modal.getThemeMode() === 'dark') !== isDark) {
      web3modal.setThemeMode(isDark ? 'dark' : 'light');
    }
  },
}), { name: 'app', store: 'theme-store' }));
