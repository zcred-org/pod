import { useAccount, useConnectorClient } from 'wagmi';
import { EIP1193Adapter } from '@zcredjs/ethereum';

export const useEIP1193Adapter = () => {
  const account = useAccount();
  // TODO: is it caches the client?
  return useConnectorClient({
    query: {
      enabled: !!account.address,
      select: (client) => client && account.address ? new EIP1193Adapter(client) : undefined,
    },
  });
};
