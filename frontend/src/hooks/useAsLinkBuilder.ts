/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from '@nextui-org/react';
import { useRouter, type ToOptions, type RegisteredRouter, type RoutePaths } from '@tanstack/react-router';
import { useRef } from 'react';


export function useAsLinkBuilder() {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  const buildPropsFn = <
    // Types copy from "router.buildLocation()"
    TRouter extends RegisteredRouter,
    TTo extends string | undefined,
    TFrom extends RoutePaths<TRouter['routeTree']> | string = string,
    TMaskFrom extends RoutePaths<TRouter['routeTree']> | string = TFrom,
    TMaskTo extends string = '',
  >(opts: ToOptions<TRouter, TFrom, TTo, TMaskFrom, TMaskTo>) => {
    return {
      href: router.buildLocation(opts as any).href,
      onMouseLeave: () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      },
      async onMouseEnter() {
        const delay = router.options.defaultPreloadDelay;
        if (delay) await new Promise((resolve) => {
          timeoutRef.current = setTimeout(resolve, delay);
        });
        if (timeoutRef.current) router.preloadRoute(opts as any).then();
      },
      as: Link,
    };
  };

  return buildPropsFn;
}
