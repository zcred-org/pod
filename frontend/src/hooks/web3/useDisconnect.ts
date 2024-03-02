import { disconnect as wagmiDisconnect } from 'wagmi/actions';
import { useAuroStore } from './auro/useAuro.store.ts';
import { useNavigate } from '@tanstack/react-router';
import { useCallback } from 'react';
import { useDidStore } from '../useDid.store.ts';
import { useWalletStore } from '@/hooks/web3/useWallet.store.ts';
import { wagmiConfig } from '@/config/wagmi-config.ts';
import { queryClient } from '@/config/query-client.ts';

const signOutBase = async () => {
  await wagmiDisconnect(wagmiConfig);
  useAuroStore.getState().disconnect();
  useWalletStore.getState().update({ isForce: true, isConnected: false });
  useDidStore.getState().reset();
  queryClient.clear();
};

export const useDisconnect = () => {
  const navigate = useNavigate();

  const signOut = useCallback(async () => {
    await navigate({ to: '/' });
    await signOutBase();
    await navigate({ to: '/' });
  }, [navigate]);
  return { signOut, signOutBase };

};

useDisconnect.signOutBase = signOutBase;
