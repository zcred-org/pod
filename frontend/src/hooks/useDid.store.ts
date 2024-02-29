import { create } from 'zustand';
import { Ed25519Provider } from 'key-did-provider-ed25519';
import KeyResolver from 'key-did-resolver';
import { hash as sha256 } from '@stablelib/sha256';
import { DID } from 'dids';
import * as u8a from 'uint8arrays';
import { devtools } from 'zustand/middleware';

type State = {
  addressOfOwner: string | null;
  did: DID | null;
}

type Actions = {
  authenticate: (seed: string, addressOfOwner: string) => Promise<void>;
  reset: () => void;
  encrypt: <T>(data: T) => Promise<string>;
  decrypt: <T>(data: string) => Promise<T>;
}

const initialState: State = {
  did: null,
  addressOfOwner: null,
};

export const useDidStore = create<State & Actions>()(devtools((set, get) => ({
  ...initialState,
  authenticate: async (seed, addressOfOwner) => {
    const hash = sha256(u8a.fromString(seed.slice(2))); // TODO: убирать slice или нет
    const provider = new Ed25519Provider(hash);
    const did = new DID({ provider, resolver: KeyResolver.getResolver() });
    await did.authenticate();
    set({ did, addressOfOwner }, false, `authenticate:${addressOfOwner}`);
  },
  reset: () => set(initialState, false, 'reset'),
  encrypt: async (data) => {
    const did = get().did;
    if (!did) throw new Error('Cannot encrypt without a DID');
    const binary = u8a.fromString(JSON.stringify(data));
    const jwe = await did.createJWE(binary, [did.id]);
    return JSON.stringify(jwe);
  },
  decrypt: async (data) => {
    const did = get().did;
    if (!did) throw new Error('Cannot decrypt without a DID');
    const decrypted = await did.decryptJWE(JSON.parse(data));
    return JSON.parse(u8a.toString(decrypted));
  },
}), { name: 'app', store: 'did' }));
