/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link, type LinkProps, type RegisteredRouter, type AnyRouter } from '@tanstack/react-router';
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
  TComp = 'a',
  TRouter extends AnyRouter = RegisteredRouter,
  TFrom extends string = string,
  TTo extends string | undefined = '.',
  TMaskFrom extends string = TFrom,
  TMaskTo extends string = '.',
>(props0: LinkProps<TComp, TRouter, TFrom, TTo, TMaskFrom, TMaskTo>) => {
  return forwardRef<typeof Link, typeof props0>(({ ...props }, ref) => {
    return <Link ref={ref} {...props} {...props0 as any} />;
  });
};
