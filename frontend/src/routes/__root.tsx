import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router';
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownMenuProps, DropdownTrigger } from '@nextui-org/react';
import { addressShort } from '../common/helpers.ts';
import { Moon, Plus, Settings, Sun } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.ts';
import { useTheme } from '../store/theme.store.ts';

interface AppContext {
  auth: ReturnType<typeof useAuth>;
}

export const Route = createRootRouteWithContext<AppContext>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  const auth = useAuth();
  const { isDarkTheme, toggleTheme } = useTheme();

  const settingsAction: DropdownMenuProps['onAction'] = async (key) => {
    if (key === 'logout') await auth.signOut();
  };

  return (
    <>
      <header className="p-2 md:px-10 flex gap-2 items-center">
        <p className="text-2xl">zCred</p>
        <div className="grow"/>
        <Button onClick={toggleTheme} radius="full" isIconOnly>{isDarkTheme ? <Sun/> : <Moon/>}</Button>
        {auth.isAuthorized && auth.address && (<>
          <div className='flex flex-col'>
            <p>{auth.type}{': '}{addressShort(auth.address)}</p>
            <p>{'DID: '}{addressShort(auth.did.did!.id)}</p>
          </div>
          <Dropdown>
            <DropdownTrigger>
              <Button radius="full" isIconOnly><Settings className="text-foreground"/></Button>
            </DropdownTrigger>
            <DropdownMenu onAction={settingsAction}>
              <DropdownItem className="text-danger" color="danger" key="logout">Logout</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <Button radius="full" isIconOnly><Plus className="text-foreground"/></Button>
        </>)}
      </header>
      <Outlet/>
      {/*<TanStackRouterDevtools/>*/}
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
