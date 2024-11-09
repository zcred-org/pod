import { batch } from '@preact/signals-react';
import {
  infiniteQueryOptions,
  type QueryFunctionContext,
  type InfiniteData,
  type GetNextPageParamFunction,
  type InfiniteQueryObserverResult,
  InfiniteQueryObserver,
  type QueryState,
} from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { queryClient } from '@/config/query-client.ts';
import { zCredStore } from '@/service/external/zcred-store';
import { CREDENTIALS_GET_DEFAULT_LIMIT } from '@/service/external/zcred-store/constants.ts';
import type {
  CredentialsGetManyPaginationRequiredArgs,
  CredentialsGetManyPaginationArgs,
  CredentialsGetManySearchArgs,
} from '@/service/external/zcred-store/types/credentials-api.types.ts';
import type { CredentialsDecodedDto } from '@/service/external/zcred-store/types/credentials.types.ts';
import { queryKey, type CredentialsQueryKey } from '@/service/queries/query-key.ts';
import { Ms } from '@/util/independent/ms.ts';
import { deepSignal } from '@/util/independent/signals/signals-dev-tools.ts';


async function queryFn(ctx: QueryFunctionContext<CredentialsQueryKey, CredentialsGetManyPaginationArgs>) {
  const { signal, queryKey: { 2: search }, pageParam: pagination } = ctx;
  return await zCredStore.credential.credentials({ search, pagination, signal });
}

const getNextPageParam: GetNextPageParamFunction<CredentialsGetManyPaginationRequiredArgs, CredentialsDecodedDto> = (
  lastPage, _/*allPages*/, lastPageParam,/*, allPageParams*/
) => {
  const offsetNext = lastPageParam.offset + lastPageParam.limit;
  return lastPage.countTotal > offsetNext
    ? { offset: offsetNext, limit: lastPageParam.limit }
    : null;
};


queryClient.setQueryDefaults(queryKey.credentials.ROOT, {
  staleTime: Ms.minute(10),
});

type Args = [CredentialsGetManySearchArgs] | [];

export function credentialsInfiniteQuery(...args: Args) {
  return infiniteQueryOptions({
    queryKey: queryKey.credentials.get(...args),
    queryFn,
    initialPageParam: { offset: 0, limit: CREDENTIALS_GET_DEFAULT_LIMIT },
    getNextPageParam,
  });
}

credentialsInfiniteQuery.$signal = deepSignal<Partial<CredentialsInfiniteQueryObserverResult>>({}, 'credentialsInfiniteQuery');

credentialsInfiniteQuery.signalSub = function (...args: Args): VoidFunction {
  const observer = new InfiniteQueryObserver(queryClient, credentialsInfiniteQuery(...args));
  const update = (state: unknown) => state && batch(() => Object.assign(credentialsInfiniteQuery.$signal, state));
  update(credentialsInfiniteQuery.getState(...args));
  return observer.subscribe(update);
};

credentialsInfiniteQuery.invalidateROOT = function () {
  return queryClient.invalidateQueries({ queryKey: queryKey.credentials.ROOT });
};

credentialsInfiniteQuery.resetROOT = function () {
  return queryClient.resetQueries({ queryKey: queryKey.credentials.ROOT });
};

credentialsInfiniteQuery.prefetch = function (...args: Args) {
  return queryClient.prefetchInfiniteQuery(credentialsInfiniteQuery(...args));
};

credentialsInfiniteQuery.getData = function (...args: Args): InfiniteData<CredentialsDecodedDto, CredentialsGetManyPaginationRequiredArgs> | undefined {
  return queryClient.getQueryData(credentialsInfiniteQuery(...args).queryKey);
};

credentialsInfiniteQuery.getState = function (...args: Args): QueryState<CredentialsDecodedDto> | undefined {
  return queryClient.getQueryState(credentialsInfiniteQuery(...args).queryKey);
};

type CredentialsInfiniteQueryObserverResult = InfiniteQueryObserverResult<
  InfiniteData<CredentialsDecodedDto, CredentialsGetManyPaginationRequiredArgs>,
  AxiosError
>;
