import { Button } from '@nextui-org/react';
import { Moon, Sun } from 'lucide-react';
import { useCheckAuth } from '@/hooks/web3/useCheckAuth.ts';
import { useThemeStore } from '@/hooks/useTheme.store.ts';
import { HeaderUserPanel } from './HeaderUserPanel.tsx';
import { Link, useMatches } from '@tanstack/react-router';
import { IconShield } from '@/components/icons.tsx';
import { Helmet } from 'react-helmet-async';

export const Header = () => {
  const auth = useCheckAuth();
  const theme = useThemeStore();
  const matches = useMatches();

  // const breadcrumbs = matches.map((match) => {
  //   return {
  //     title: match.context.title,
  //     path: match.pathname,
  //   };
  // });
  // console.log('breadcrumbs', breadcrumbs);

  const title = matches.at(-1)?.context.title;

  return (
    <>
      <Helmet>
        <title>{`${title} | ZCred App`}</title>
      </Helmet>
      <header className="sticky top-0 backdrop-blur bg-opacity-50 px-4 py-3 md:px-10 flex gap-2 items-center bg-default z-50">
        <Link to={'/'}><IconShield className="w-6 h-6"/></Link>
        <p className="text-2xl">{title}</p>
        <div className="grow"/>
        {auth.isAuthorized ? (
          <HeaderUserPanel/>
        ) : (
          <Button onClick={theme.toggle} variant="light" radius="full" isIconOnly>{theme.isDark ? <Sun/> : <Moon/>}</Button>
        )}
      </header>
    </>
  );
};
