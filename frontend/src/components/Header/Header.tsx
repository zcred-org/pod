import { Button } from '@nextui-org/react';
import { Moon, Sun } from 'lucide-react';
import { useAuth } from '../../hooks/web3/useAuth.ts';
import { useTheme } from '../../hooks/useTheme.ts';
import { HeaderUserPanel } from './HeaderUserPanel.tsx';

export const Header = () => {
  const auth = useAuth();
  const { isDarkTheme, toggleTheme } = useTheme();

  return (
    <header className="p-2 md:px-10 flex gap-2 items-center">
      <p className="text-2xl">zCred</p>
      <div className="grow"/>
      {auth.isAuthorized && <HeaderUserPanel/>}
      <Button onClick={toggleTheme} variant="light" radius="full" isIconOnly>{isDarkTheme ? <Sun/> : <Moon/>}</Button>
    </header>
  );
};
