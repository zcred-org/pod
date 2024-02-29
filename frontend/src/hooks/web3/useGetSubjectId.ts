import { useQuery, UseQueryResult } from '@tanstack/react-query';
import type { Identifier } from '@zcredjs/core';
import { useAddress } from './useAddress.ts';
import { useWalletAdapter } from './useWalletAdapter.ts';

export const useGetSubjectId = (): UseQueryResult<Identifier> => {
  const address = useAddress();
  const walletAdapter = useWalletAdapter();

  return useQuery({
    queryKey: ['getSubjectId', address],
    enabled: !!walletAdapter?.getSubjectId,
    queryFn: walletAdapter?.getSubjectId,
  });
};
