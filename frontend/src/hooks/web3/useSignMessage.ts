import { useAccount, useSignMessage as useWagmiSignMessage, useWalletClient } from 'wagmi';
import { toast } from 'sonner';
import { useAuroAccount } from './auro/useAuroAccount.ts';
import { useMutation } from '@tanstack/react-query';
import { auroWalletAdapter } from '../../common/api/wallet-adapter-auro.ts';
import { useMemo } from 'react';
// import { useEffect } from 'react';
import { EIP1193Adapter, IEIP1193Provider } from '@zcredjs/ethereum';

export const useSignMessage = ({ onError, onSuccess }: {
  onSuccess?: (signature: string) => void;
  onError?: (error: Error) => void;
}) => {
  const eth = useAccount();
  const auro = useAuroAccount();
  // const { mutate: signMessageEth, isPending: isPendingEth } = useMutation({
  //   mutationFn: new EIP1193Adapter(publicClient!).sign,
  //   onSuccess, onError,
  // });
  // TODO: Доделать подпись
  // const res = useClient();
  const res2 = useWalletClient();

  const adapter = useMemo(() => {
    if (!res2.data) return;
    return new EIP1193Adapter(res2.data as IEIP1193Provider);
  }, [res2.data]);

  // useEffect(() => {
  //   console.log('res2', res2.data);
  //   if (!res2.data) return;
  //   const adapter = new EIP1193Adapter(res2.data as IEIP1193Provider);
  //   adapter.getSubjectId().then((id) => console.log('id', id));
  //   adapter.sign({ message: 'test' }).then((sig) => console.log('sig', sig));
  // }, [res2.data]);

  // const {} = useMutation({
  //   mutationFn: /*new EIP1193Adapter(res2.data as IEIP1193Provider).sign*/,
  //   onSuccess, onError,
  // })
  const { signMessage: signMessageEth, isPending: isPendingEth } = useWagmiSignMessage({
    mutation: {
      onSuccess,
      onError,
    },
  });
  const { mutate: signMessageAuro, isPending: isPendingMina } = useMutation({
    mutationFn: auroWalletAdapter!.sign,
    onSuccess, onError,
  });

  const signMessage = (message: string) =>
    auro.address ? signMessageAuro({ message })
      : eth.address ? signMessageEth({ message })
        : toast.error('No wallet connected');

  return {
    signMessage,
    isPending: isPendingEth || isPendingMina,
  };
};
