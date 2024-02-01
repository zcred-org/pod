import { createRootRouteWithContext, Link, Outlet, useNavigate } from '@tanstack/react-router';
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownMenuProps, DropdownTrigger } from '@nextui-org/react';
import { addressShort } from '../util/helpers.ts';
import { Moon, Plus, Settings, Sun } from 'lucide-react';
import { useAuth } from '../hooks/web3/useAuth.ts';
import { useTheme } from '../hooks/useTheme.ts';
import { TanStackRouterDevtools } from '../components/dev/TanStackRouterDevtools.tsx';
import { useAuroAccountEffect } from '../hooks/web3/auro/useAuroAccountEffect.ts';
import { useAccountEffect } from 'wagmi';
import { Toaster } from 'sonner';

interface AppContext {
  auth: ReturnType<typeof useAuth>;
}

export const Route = createRootRouteWithContext<AppContext>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { isDarkTheme, toggleTheme } = useTheme();
  const onDisconnect = () => navigate({ to: '/' });
  useAuroAccountEffect({ onDisconnect });
  useAccountEffect({ onDisconnect });

  const settingsAction: DropdownMenuProps['onAction'] = async (key) => {
    if (key === 'logout') await auth.signOut();
  };

  return (
    <>
      <header className="p-2 md:px-10 flex gap-2 items-center">
        <p className="text-2xl">zCred</p>
        <div className="grow"/>
        {auth.isAuthorized && auth.address && (<>
          <div className="flex flex-col">
            <p>{auth.provider}{': '}{addressShort(auth.address)}</p>
            <p>{'DID: '}{addressShort(auth.did.did!.id)}</p>
          </div>
          <Button variant="light" radius="full" isIconOnly><Plus className="text-foreground"/></Button>
          <Dropdown>
            <DropdownTrigger>
              <Button variant="light" radius="full" isIconOnly><Settings className="text-foreground"/></Button>
            </DropdownTrigger>
            <DropdownMenu onAction={settingsAction}>
              <DropdownItem className="text-danger" color="danger" key="logout">Logout</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </>)}
        <Button onClick={toggleTheme} variant="light" radius="full" isIconOnly>{isDarkTheme ? <Sun/> : <Moon/>}</Button>
      </header>
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
      <Link to="/"><Button className="mt-6">Go home</Button></Link>
    </div>
  );
}
