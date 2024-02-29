import { useDisconnect as useWagmiDisconnect } from 'wagmi';
import { useAuroStore } from './auro/useAuro.store.ts';
import { WalletTypeEnum } from './useWalletType.store.ts';
import { useNavigate } from '@tanstack/react-router';
import { useCallback } from 'react';
import { useByWalletType } from './useByWalletType.ts';
import { useDidStore } from '../useDid.store.ts';

export const useDisconnect = () => {
  const navigate = useNavigate();
  const { disconnect: ethDisconnect } = useWagmiDisconnect();
  const auroDisconnect = useAuroStore(state => state.disconnect);
  const didReset = useDidStore(state => state.reset);

  const walletDisconnect = useByWalletType({
    [WalletTypeEnum.Ethereum]: ethDisconnect,
    [WalletTypeEnum.Auro]: auroDisconnect,
  });

  const signOutBase = useCallback(async () => {
    didReset();
    walletDisconnect?.();
  }, [didReset, walletDisconnect]);

  const signOut = useCallback(async () => {
    await navigate({ to: '/' });
    await signOutBase();
    await navigate({ to: '/' });
  }, [navigate, signOutBase]);

  return { signOut, signOutBase };
};
