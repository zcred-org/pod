import { Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger, Switch, User } from '@nextui-org/react';
import BoringAvatar from 'boring-avatars';
import { compact } from 'lodash-es';
import { Box, CirclePlus, LogOut, Moon, Sun } from 'lucide-react';
import type { ReactNode } from 'react';
import { IconByWalletType } from '@/components/icons/icons.tsx';
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

  const userIcon = (
    <div className="relative w-10 h-10">
      <IconByWalletType
        className="absolute fill-white m-0 left-1/2 -translate-x-1/2 top-1/2 -ml-[1px] -translate-y-1/2"
        width={24}
        height={24}
        walletType={WalletStore.$wallet.value?.type}
      />
      <BoringAvatar
        name={WalletStore.$wallet.value?.address + '' + DidStore.$did.value?.id}
        variant="marble"
        size={40}
      />
    </div>
  );

  return (
    <Dropdown backdrop="blur">
      <DropdownTrigger>
        <User
          name={`${addressShort(WalletStore.$wallet.value?.address || '')}`}
          description={`did: ${addressShort(DidStore.$did.value?.id || '')}`}
          isFocusable
          as="button"
          avatarProps={{ icon: userIcon }}
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
