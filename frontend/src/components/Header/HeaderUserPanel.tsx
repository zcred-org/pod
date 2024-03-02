import { addressShort } from '@/util/helpers.ts';
import { Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger, Switch, User } from '@nextui-org/react';
import { Box, CirclePlus, LogOut, Moon, Sun } from 'lucide-react';
import { useDidStore } from '@/hooks/useDid.store.ts';
import { useDisconnect } from '@/hooks/web3/useDisconnect.ts';
import { useWalletStore } from '@/hooks/web3/useWallet.store.ts';
import { useThemeStore } from '@/hooks/useTheme.store.ts';
import { link } from '@/components/factories/link.tsx';
import { compact } from 'lodash-es';

export const HeaderUserPanel = () => {
  const { signOut } = useDisconnect();
  const theme = useThemeStore();
  const subject = useWalletStore(state => state.subjectId);
  const walletType = useWalletStore(state => state.type);
  const did = useDidStore(state => state.did);

  return (
    <Dropdown backdrop="blur">
      <DropdownTrigger>
        <User
          name={(`${addressShort(subject?.key || '')}`)}
          description={`did: ${addressShort(did?.id || '')}`}
          isFocusable
          as="button"
          avatarProps={{
            isBordered: true,
            name: walletType || undefined,
          }}
        />
      </DropdownTrigger>
      <DropdownMenu>
        <DropdownSection showDivider children={compact([
          <DropdownItem
            as={link({ to: '/credentials' })}
            endContent={<Box size={14}/>}
            key='1'
          >Credentials</DropdownItem>,
          import.meta.env.DEV ? <DropdownItem
            as={link({ to: '/credential-issue' })}
            endContent={<CirclePlus size={14}/>}
            key='2'
          >Credential issue</DropdownItem> : null,
        ])}/>
        <DropdownSection showDivider>
          <DropdownItem
            isReadOnly
            onClick={theme.toggle}
            endContent={<Switch
              isSelected={theme.isDark}
              size="sm"
              color="default"
              startContent={<Sun/>}
              endContent={<Moon/>}
              onValueChange={theme.toggle}
              classNames={{ wrapper: 'm-0' }}
            />}
          >Dark mode</DropdownItem>
        </DropdownSection>
        <DropdownItem
          onClick={signOut}
          // className="text-warning"
          color="danger"
          endContent={<LogOut size={14} />}
        >Logout</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};
