import { web3modal } from '@/config/wagmi-config.ts';
import { signal } from '@/util/signals-dev-tools.ts';

export class ThemeStore {
  static $isDark = signal(
    localStorage.getItem('theme')?.includes('dark')
    ?? window.matchMedia('(prefers-color-scheme: dark)').matches,
    'ThemeStore.isDark',
  );

  static toggle() {
    return ThemeStore.$isDark.value = !ThemeStore.$isDark.value;
  }
}

ThemeStore.$isDark.subscribe(isDark => {
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  document.body.classList.toggle('dark', isDark);
  web3modal.setThemeMode(isDark ? 'dark' : 'light');
});
