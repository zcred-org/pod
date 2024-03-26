/* eslint-disable @typescript-eslint/no-explicit-any */
import { type AnyRoute, Link, type LinkProps, type RegisteredRouter, type RoutePaths } from '@tanstack/react-router';
import { forwardRef } from 'react';

/**
 * A function for passing TanstackRouter Link together with type-safe props to the "as" props of another component.
 * @example Solution:
 * <Button as={link({ to: '/home' })}>Home</Button>
 *                         ^ strict type for TanstackRouter path and other params
 * @example Problem:
 * <Button as={Link} to="/123">Home</Button>
 *                       ^ type is "any" and without checking
 */
export const link = <
  TRouteTree extends AnyRoute = RegisteredRouter['routeTree'],
  TFrom extends RoutePaths<TRouteTree> | string = string,
  TTo extends string = '',
  TMaskFrom extends RoutePaths<TRouteTree> | string = TFrom,
  TMaskTo extends string = '',
>(props0: LinkProps<TRouteTree, TFrom, TTo, TMaskFrom, TMaskTo>) => {
  return forwardRef<typeof Link, typeof props0>(({ ...props }, ref) => {
    return <Link ref={ref} {...props} {...props0 as any} />;
  });
};
