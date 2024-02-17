import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { Button } from '@nextui-org/react';
import { useTheme } from '../hooks/useTheme.ts';
import { TanStackRouterDevtools } from '../components/dev/TanStackRouterDevtools.tsx';
import { Toaster } from 'sonner';
import { Header } from '../components/Header/Header.tsx';

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  const { isDarkTheme } = useTheme();

  return (
    <>
      <Header/>
      <Outlet/>
      <TanStackRouterDevtools/>
      <Toaster
        richColors
        theme={isDarkTheme ? 'dark' : 'light'}
        position="top-center"
        closeButton
      />
    </>
  );
}

function NotFoundComponent() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <h1 className="text-4xl">404</h1>
      <p>Page not found</p>
      <Link to={'/'}><Button className="mt-6">Go home</Button></Link>
    </div>
  );
}
