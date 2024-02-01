import React, { FC, Suspense } from 'react';

const DevTools: FC = React.lazy(() =>
  import('@tanstack/router-devtools').then((res) => ({
    default: res.TanStackRouterDevtools,
    // default: res.TanStackRouterDevtoolsPanel
  })),
);

export const TanStackRouterDevtools = import.meta.env.PROD
  ? () => null
  : () => <Suspense><DevTools/></Suspense>;
