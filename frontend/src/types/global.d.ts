import type { ReduxDevtoolsExtensionCompose } from '@redux-devtools/extension';
import type { UseQueryOptions, DefaultError, QueryKey, DataTag } from '@tanstack/react-query';
import type { IEIP1193Provider } from '@zcredjs/ethereum';
import type { IAuroWallet } from '@zcredjs/mina';

declare module '@zcredjs/mina' {
  interface IAuroEventHandlers {
    accountsChanged: (accounts: string[]) => void;
    chainChanged: (chainInfo: { chainId: string, name: string }) => void;
  }

  interface IAuroWallet {
    on: <K extends keyof IAuroEventHandlers>(event: K, handler: IAuroEventHandlers[K]) => void;
  }
}

declare global {
  interface Window {
    mina?: IAuroWallet;
    ethereum?: IEIP1193Provider;
    __REDUX_DEVTOOLS_EXTENSION__?: ReduxDevtoolsExtensionCompose;
  }
}

declare module '@tanstack/react-query' {
  /**
   * `useQuery()` has 3 types, one of them with `options: UseQueryOptions`:
   * `@tanstack/react-query/src/useQuery.ts`.
   *
   * But `queryOptions()` has only 2 types,
   * where options is `DefinedInitialDataOptions` or `UndefinedInitialDataOptions`:
   * "@tanstack/react-query/src/queryOptions.ts".
   *
   * This is a workaround to add the 3rd type of `useQuery()` to `queryOptions()`,
   * which allow optional `initialData` in the options.
   */
  export function queryOptions<
    TQueryFnData = unknown,
    TError = DefaultError,
    TData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
  >(
    options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  ): UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> & {
    queryKey: DataTag<TQueryKey, TQueryFnData>
  }
}
