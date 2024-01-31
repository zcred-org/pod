import { useMinaSignMessage } from '../common/mina/useMinaSignMessage.ts';
import { useAccount, useSignMessage as useWagmiSignMessage } from 'wagmi';
import { toast } from 'sonner';
import { useMinaAccount } from '../common/mina/useMinaAccount.ts';

export const useSignMessage = (options: {
  onSuccess?: (signature: string) => void;
  onError?: (error: Error) => void;
}) => {
  const eth = useAccount();
  const mina = useMinaAccount();
  const { signMessage: signMessageEth, isPending: isPengingEth } = useWagmiSignMessage({
    mutation: {
      onSuccess: options.onSuccess,
      onError: options.onError,
    },
  });
  const { mutate: signMessageMina, isPending: isPendingMina } = useMinaSignMessage({
    // TODO: Что делать с "signature":{"field":string;"scalar":string} ?
    onSuccess: (data) => options.onSuccess?.(JSON.stringify(data!.signature)),
    onError: options.onError,
  });

  const signMessage = (message: string) => eth.address
    ? signMessageEth({ message })
    : mina.account
      ? signMessageMina(message)
      : toast.error('No wallet connected');

  return {
    signMessage,
    isPending: isPengingEth || isPendingMina,
  };
};
