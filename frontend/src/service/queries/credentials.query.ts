import { batch } from '@preact/signals-react';
import {
  infiniteQueryOptions,
  type QueryFunctionContext,
  type InfiniteData,
  type GetNextPageParamFunction,
  type InfiniteQueryObserverResult,
  InfiniteQueryObserver,
} from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { queryClient } from '@/config/query-client.ts';
import { zCredStore } from '@/service/external/zcred-store';
import { CREDENTIALS_GET_DEFAULT_LIMIT } from '@/service/external/zcred-store/constants.ts';
import type {
  CredentialsApiGetManyPaginationRequiredArgs,
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

const getNextPageParam: GetNextPageParamFunction<CredentialsApiGetManyPaginationRequiredArgs, CredentialsDecodedDto> = (
  lastPage, _/*allPages*/, lastPageParam,/*, allPageParams*/
) => {
  const offsetNext = lastPageParam.offset + lastPageParam.limit;
  return lastPage.countTotal > offsetNext
    ? { offset: offsetNext, limit: lastPageParam.limit }
    : null;
};

export function credentialsInfiniteQuery(args?: CredentialsGetManySearchArgs) {
  return infiniteQueryOptions({
    queryKey: queryKey.credentials.get(args),
    queryFn,
    staleTime: Ms.minute(10),
    initialPageParam: { offset: 0, limit: CREDENTIALS_GET_DEFAULT_LIMIT },
    getNextPageParam,
  });
}

credentialsInfiniteQuery.$signal = deepSignal<Partial<CredentialsInfiniteQueryObserverResult>>({}, 'credentialsInfiniteQuery');

credentialsInfiniteQuery.signalSub = function (...args: Parameters<typeof credentialsInfiniteQuery>): VoidFunction {
  const observer = new InfiniteQueryObserver(queryClient, credentialsInfiniteQuery(...args));
  return observer.subscribe(result => batch(() => Object.assign(credentialsInfiniteQuery.$signal, result)));
};

credentialsInfiniteQuery.invalidateROOT = async function () {
  await queryClient.invalidateQueries({ queryKey: queryKey.credentials.ROOT });
};

credentialsInfiniteQuery.resetROOT = async function () {
  await queryClient.resetQueries({ queryKey: queryKey.credentials.ROOT });
};

credentialsInfiniteQuery.prefetch = function (...args: Parameters<typeof credentialsInfiniteQuery>) {
  return queryClient.prefetchInfiniteQuery(credentialsInfiniteQuery(...args));
};

credentialsInfiniteQuery.getData = function (): InfiniteData<CredentialsDecodedDto, CredentialsApiGetManyPaginationRequiredArgs> | undefined {
  return queryClient.getQueryData(credentialsInfiniteQuery().queryKey);
};

export type CredentialsInfiniteQueryObserverResult = InfiniteQueryObserverResult<
  InfiniteData<CredentialsDecodedDto, CredentialsApiGetManyPaginationRequiredArgs>,
  AxiosError
>;
