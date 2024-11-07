import { lazy, type ReactNode, Suspense } from 'react';
import { config } from '@/config';


const DevTools = lazy(() => import('@tanstack/router-devtools')
  .then((res) => ({ default: res.TanStackRouterDevtools })));

const ReactQueryDevtools = lazy(() => import('@tanstack/react-query-devtools/production')
  .then((res) => ({ default: res.ReactQueryDevtools })));

export function Devtools(): ReactNode {
  if (!config.isDev) return null;

  return (
    <Suspense fallback={null}>
      <DevTools />
      <ReactQueryDevtools buttonPosition="bottom-left" />
    </Suspense>
  );
}
