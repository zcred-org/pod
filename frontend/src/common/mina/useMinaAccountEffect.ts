import { useEffect } from 'react';
import { useMinaAccount } from './useMinaAccount.ts';

export const useMinaAccountEffect = (options: {
  onConnect?: (account: string) => void;
  onDisconnect?: () => void;
}): void => {
  const { account } = useMinaAccount();
  const { onConnect, onDisconnect } = options;

  useEffect(() => {
    account
      ? onConnect?.(account)
      : onDisconnect?.();
  }, [account, onConnect, onDisconnect]);
};
