import { QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      throwOnError: error => {
        console.error('Error', error);
        toast.error(`Error: ${error.message}`);
        return true;
      },
    },
  },
});
