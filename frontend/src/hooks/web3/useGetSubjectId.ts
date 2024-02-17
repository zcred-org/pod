import { useEIP1193Adapter } from './ethereum/useEIP1193Adapter.ts';
import { useAccount } from 'wagmi';
import { useAuroStore } from './auro/useAuro.store.ts';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import type { Identifier } from '@zcredjs/core';
import { toast } from 'sonner';

export const useGetSubjectId = (): UseQueryResult<Identifier> => {
  const eth = useAccount();
  const auro = useAuroStore();
  const ethAdapter = useEIP1193Adapter();
  const auroAdapter = useAuroStore(state => state.auroWalletAdapter);

  if (eth.address && !ethAdapter) {
    console.warn('useGetSubjectId', 'Ethereum account is connected but no adapter is available');
  }
  if (auro.address && !auroAdapter) {
    console.warn('useGetSubjectId', 'Auro account is connected but no adapter is available');
  }

  if (eth.address && auro.address) {
    toast.warning('ETH and AURO are both connected!');
  }

  const onNoAdapterConnected = async () => {
    toast.error('No wallet connected');
    return Promise.reject(new Error('No wallet connected'));
  };

  return useQuery({
    queryKey: ['getSubjectId', eth.address, auro.address],
    enabled: !!(eth.address && ethAdapter || auro.address && auroAdapter),
    queryFn: async () => eth.address ? await ethAdapter!.getSubjectId()
      : auro.address ? auroAdapter!.getSubjectId()
        : onNoAdapterConnected,
  });
};
