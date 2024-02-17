import React, { FC, Suspense } from 'react';

const DevTools: FC = React.lazy(() =>
  import('@tanstack/router-devtools').then((res) => ({
    default: res.TanStackRouterDevtools,
    // default: res.TanStackRouterDevtoolsPanel
  })),
);

const ReactQueryDevtools = React.lazy(() =>
  import('@tanstack/react-query-devtools/build/modern/production.js').then((res) => ({
    default: res.ReactQueryDevtools,
  })),
);

export const TanStackRouterDevtools = import.meta.env.PROD ? () => null : () => (
  <Suspense>
    <DevTools/>
    <ReactQueryDevtools buttonPosition="bottom-left"/>
  </Suspense>
);
