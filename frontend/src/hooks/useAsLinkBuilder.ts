/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from '@nextui-org/react';
import { useRouter, type ToOptions, type RegisteredRouter, type RoutePaths, type AnyRouter } from '@tanstack/react-router';

export function useAsLinkBuilder() {
  const router = useRouter();

  return <
    TRouter extends AnyRouter = RegisteredRouter,
    TFrom extends RoutePaths<TRouter['routeTree']> | string = string,
    TTo extends string = '',
    TMaskFrom extends RoutePaths<TRouter['routeTree']> | string = TFrom,
    TMaskTo extends string = '',
  >(opts: ToOptions<TRouter, TFrom, TTo, TMaskFrom, TMaskTo> & {
    leaveParams?: boolean
  }) => {
    let isMouseOn = false;
    return {
      href: router.buildLocation(opts as any).href,
      onMouseLeave: () => isMouseOn = false,
      async onMouseEnter() {
        isMouseOn = true;
        const delay = router.options.defaultPreloadDelay;
        if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
        if (isMouseOn) router.preloadRoute(opts as any).then();
      },
      as: Link,
    };
  };
}
