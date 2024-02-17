import { useAccount } from 'wagmi';
import { toast } from 'sonner';
import { useAuroStore } from './auro/useAuro.store.ts';
import { useMutation } from '@tanstack/react-query';
import { useEIP1193Adapter } from './ethereum/useEIP1193Adapter.ts';

export const useSignMessage = ({ onError, onSuccess }: {
  onSuccess?: (signature: string) => void;
  onError?: (error: Error) => void;
}) => {
  const eth = useAccount();
  const auro = useAuroStore();
  const ethAdapter = useEIP1193Adapter();

  const onNoAdapterConnected = async () => {
    toast.error('No wallet connected');
    return Promise.reject(new Error('No wallet connected'));
  };

  const { mutate: signMessage, isPending } = useMutation({
    onSuccess: (signature) => onSuccess?.(signature),
    onError,
    mutationFn: eth.address ? ethAdapter?.sign
      : auro.address ? auro.auroWalletAdapter?.sign
        : onNoAdapterConnected,
  });

  return {
    signMessage,
    isPending,
  };
};
