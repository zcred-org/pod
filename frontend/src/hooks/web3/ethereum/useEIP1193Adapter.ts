import { useAccount } from 'wagmi';
import { useMemo } from 'react';
import { EIP1193Adapter, IEIP1193Provider } from '@zcredjs/ethereum';
import { getConnectorClient } from '@wagmi/core';
import { wagmiConfig } from '../../../config/wagmi-config.ts';
import { useQuery } from '@tanstack/react-query';

export const useEIP1193Adapter = (): EIP1193Adapter | null => {
  const account = useAccount();
  const { data: connectorClient } = useQuery({
    queryKey: ['ethConnectorClient', account.address],
    queryFn: () => account.address ? getConnectorClient(wagmiConfig) : null,
    networkMode: 'always',
  });
  // const prevAccount = usePrevious(account, account);

  // useEffect(() => {
  //   if (!account.address) {
  //     queryClient.removeQueries({ queryKey: ['ethConnectorClient', prevAccount] });
  //   }
  // }, [account.address, prevAccount]);

  // WARN: useConnectorClient() crashes the app after ~5sec if account is not connected
  // const { data: connectorClient1 } = useConnectorClient();

  const eip1193Adapter = useMemo(() => connectorClient
      ? new EIP1193Adapter(connectorClient as IEIP1193Provider)
      : null,
    [connectorClient],
  );

  return eip1193Adapter;
};
