/* eslint-disable react-refresh/only-export-components */
import { lazy, type ReactNode, Suspense } from 'react';

const DevTools = lazy(() => import('@tanstack/router-devtools')
  .then((res) => ({ default: res.TanStackRouterDevtools })));

const ReactQueryDevtools = lazy(() => import('@tanstack/react-query-devtools/build/modern/production.js')
  .then((res) => ({ default: res.ReactQueryDevtools })));

export function TanStackRouterDevtools(): ReactNode {
  return import.meta.env.PROD ? null : (
    <Suspense fallback={null}>
      <DevTools />
      <ReactQueryDevtools buttonPosition="bottom-left" />
    </Suspense>
  );
}
