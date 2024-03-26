import { batch } from '@preact/signals-react';
import { useNavigate } from '@tanstack/react-router';
import { useCallback } from 'react';
import { disconnect as wagmiDisconnect } from 'wagmi/actions';
import { queryClient } from '@/config/query-client.ts';
import { wagmiConfig } from '@/config/wagmi-config.ts';
import { AuroStore } from '@/stores/auro.store';
import { DidStore } from '@/stores/did.store.ts';
import { WalletStore } from '@/stores/wallet.store';


const signOutBase = async () => {
  batch(() => {
    WalletStore.reset();
    AuroStore.disconnect();
    DidStore.reset();
  });
  await wagmiDisconnect(wagmiConfig);
};

export const useDisconnect = () => {
  const navigate = useNavigate();

  const signOut = useCallback(async () => {
    await signOutBase();
    queryClient.clear();
    await navigate({ to: '/' });
  }, [navigate]);

  return { signOut, signOutBase };
};

useDisconnect.signOutBase = signOutBase;
