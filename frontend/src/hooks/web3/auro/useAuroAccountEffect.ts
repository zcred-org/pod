import { useEffect } from 'react';
import { useAuroStore } from './useAuro.store.ts';
import { usePrevious } from '../../usePrevious.ts';
import { toast } from 'sonner';

export const useAuroAccountEffect = (options: {
  onConnect?: (account: string) => void;
  onDisconnect?: () => void;
}): void => {
  const { address } = useAuroStore();
  const prevAddress = usePrevious(address, address);
  const { onConnect, onDisconnect } = options;

  useEffect(() => {
    if (address === prevAddress) return;
    toast.info(`Address changed ${prevAddress} -> ${address}`);
    address
      ? onConnect?.(address)
      : onDisconnect?.();
  }, [address, prevAddress, onConnect, onDisconnect]);
};
