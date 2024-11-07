import { DidStore } from '@/stores/did-store/did.store.ts';
import { WalletStore } from '@/stores/wallet.store.ts';
import { computed } from '@/util/independent/signals/signals-dev-tools.ts';


export const $isWalletAndDidConnected = computed(
  () => WalletStore.$isConnected.value && !!DidStore.$did.value, 'computed.isWalletAndDidConnected',
);
