import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { useWalletAdapter } from './useWalletAdapter.ts';

export const useSignMessage = ({ onError, onSuccess }: {
  onSuccess?: (signature: string) => void;
  onError?: (error: Error) => void;
}) => {
  const walletAdapter = useWalletAdapter();

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
