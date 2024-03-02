import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { useWalletStore } from '@/hooks/web3/useWallet.store.ts';

export const useSignMessage = ({ onError, onSuccess }: {
  onSuccess?: (signature: string) => void;
  onError?: (error: Error) => void;
}) => {
  const walletAdapter = useWalletStore(state => state.adapter);

  const onNoAdapterConnected = async () => {
    toast.error('No wallet connected');
    return Promise.reject(new Error('No wallet connected'));
  };

  return useMutation({
    onSuccess,
    onError,
    mutationFn: walletAdapter?.sign || onNoAdapterConnected,
  });
};
