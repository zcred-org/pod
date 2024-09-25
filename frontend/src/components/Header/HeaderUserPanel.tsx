import { Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger, Switch, User } from '@nextui-org/react';
import { compact } from 'lodash-es';
import { Box, CirclePlus, LogOut, Moon, Sun } from 'lucide-react';
import type { ReactNode } from 'react';
import { config } from '@/config';
import { useAsLinkBuilder } from '@/hooks/useAsLinkBuilder.ts';
import { useDisconnect } from '@/hooks/web3/useDisconnect.ts';
import { DidStore } from '@/stores/did.store.ts';
import { ThemeStore } from '@/stores/theme.store.ts';
import { WalletStore } from '@/stores/wallet.store.ts';
import { addressShort } from '@/util/helpers.ts';


export function HeaderUserPanel(): ReactNode {
  const { signOut } = useDisconnect();
  const linkBuilder = useAsLinkBuilder();

  return (
    <Dropdown backdrop="blur">
      <DropdownTrigger>
        <User
          name={(`${addressShort(WalletStore.$wallet.value?.address || '')}`)}
          description={`did: ${addressShort(DidStore.$did.value?.id || '')}`}
          isFocusable
          as="button"
          avatarProps={{
            isBordered: true,
            name: WalletStore.$wallet.value?.type,
          }}
        />
      </DropdownTrigger>
      <DropdownMenu>
        <DropdownSection showDivider children={compact([
          <DropdownItem
            {...linkBuilder({ to: '/credentials' })}
            className={'text-foreground'}
            endContent={<Box size={14} />}
            key="1"
          >Credentials</DropdownItem>,
          config.isDev ? <DropdownItem
            {...linkBuilder({ to: '/credential-issue' })}
            className={'text-foreground'}
            endContent={<CirclePlus size={14} />}
            key="2"
          >Credential issue</DropdownItem> : null,
        ])} />
        <DropdownSection showDivider>
          <DropdownItem
            closeOnSelect={false}
            onClick={ThemeStore.toggle}
            endContent={<Switch
              isSelected={ThemeStore.$isDark.value}
              size="sm"
              color="default"
              startContent={<Sun />}
              endContent={<Moon />}
              onValueChange={ThemeStore.toggle}
              classNames={{ wrapper: 'm-0' }}
            />}
          >Dark mode</DropdownItem>
        </DropdownSection>
        <DropdownItem
          onClick={signOut}
          color="danger"
          endContent={<LogOut size={14} />}
        >Logout</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
