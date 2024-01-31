import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { ProviderError, SignedData } from './auro-wallet.ts';

type Options = Omit<UseMutationOptions<SignedData | undefined, Error, string, unknown>, 'mutationFn'>

export const useMinaSignMessage = (options: Options) => useMutation<SignedData | undefined, ProviderError, string>({
  ...options,
  mutationFn: async (message: string) => window.mina?.signMessage({ message }),
});
