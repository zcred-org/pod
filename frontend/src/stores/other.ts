import { DidStore } from '@/stores/did.store.ts';
import { WalletStore } from '@/stores/wallet.store.ts';
import { computed } from '@/util/signals/signals-dev-tools.ts';


export const $isWalletConnected = computed(
  () => !!WalletStore.$wallet.value, 'computed.isWalletConnected',
);
export const $isWalletAndDidConnected = computed(
  () => $isWalletConnected.value && !!DidStore.$did.value, 'computed.isWalletAndDidConnected',
);
