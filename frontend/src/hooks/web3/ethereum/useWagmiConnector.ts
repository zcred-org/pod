import { useAccount, useConnectorClient } from 'wagmi';

export const useWagmiConnector = () => {
  const account = useAccount();
  const connector = useConnectorClient({
    query: {
      enabled: !!account.address,
      throwOnError: false,
      retry: true,
    },
  });
  return {
    account,
    connector,
  };
};
