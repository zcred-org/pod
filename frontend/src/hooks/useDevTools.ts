import { useRef } from 'react';
import { config } from '@/config';
import { Ms } from '@/util/independent/ms.ts';


export function useDevTools() {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>();

  const devtoolsToggle = () => {
    const wasDev = config.isDev;
    const url = new URL(window.location.href);

    if (wasDev) {
      localStorage.removeItem('isDev');
      url.searchParams.delete('dev');
    }
    else localStorage.setItem('isDev', 'true');

    alert(`App will be reloaded with ${wasDev ? 'PROD' : 'DEV'} mode`);
    window.location.replace(url.href);
  };

  return {
    devtoolsToggle,
    onPressStart: () => {
      timeoutRef.current ??= setTimeout(devtoolsToggle, Ms.second(3));
    },
    onPressEnd: () => {
      if (!timeoutRef.current) return;
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    },
  };
}
