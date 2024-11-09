import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { removeOldestQuery, persistQueryClient } from '@tanstack/react-query-persist-client';
import { toast } from 'sonner';
import { config } from '@/config/index.ts';
import { Ms } from '@/util/independent/ms.ts';


export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: Ms.day(1),
      retry: false,
      throwOnError: error => {
        console.error('Query Error:', error);
        toast.error(`Query Error: ${error.message}`);
        return false;
      },
    },
    mutations: {
      gcTime: 0,
      onError: error => {
        console.error('Mutation Error:', error);
        toast.error(`Mutation Error: ${error.message}`);
      },
    },
  },
});

const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
  retry: removeOldestQuery,
  serialize: client => {
    const ignoreQueryKeyRoots: unknown[] = ['connectorClient'];
    client.clientState.queries = client.clientState.queries.filter(({ queryKey: [root] }) => {
      return root && !ignoreQueryKeyRoots.includes(root);
    });
    return JSON.stringify(client);
  },
});

persistQueryClient({
  queryClient,
  persister: localStoragePersister,
  buster: config.buildId,
});
