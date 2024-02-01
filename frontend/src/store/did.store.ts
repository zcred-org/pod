import { create } from 'zustand';
import { Ed25519Provider } from 'key-did-provider-ed25519';
import KeyResolver from 'key-did-resolver';
import { hash as sha256 } from '@stablelib/sha256';
import { DID } from 'dids';
import { fromString } from 'uint8arrays';
import { devtools } from 'zustand/middleware';

export const useDidStore = create<{
  did: DID | null;
  authenticate: (seed: string) => Promise<void>;
  reset: () => void;
}>()(devtools((set) => ({
  did: null as DID | null,
  authenticate: async (seed: string) => {
    const hash = sha256(fromString(seed.slice(2)));
    const provider = new Ed25519Provider(hash);
    const did = new DID({ provider, resolver: KeyResolver.getResolver() });
    await did.authenticate();
    set({ did }, false, 'authenticate');
  },
  reset: () => set({ did: null }, false, 'reset'),
}), { name: 'app', store: 'did' }));
