import { QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      throwOnError: error => {
        console.error('Query Error:', error);
        toast.error(`Query Error: ${error.message}`);
        return false;
      },
    },
    mutations: {
      throwOnError: error => {
        console.error('Mutation Error:', error);
        toast.error(`Mutation Error: ${error.message}`);
        return false;
      },
    }
  },
});
