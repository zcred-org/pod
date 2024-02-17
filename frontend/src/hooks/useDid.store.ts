import { create } from 'zustand';
import { Ed25519Provider } from 'key-did-provider-ed25519';
import KeyResolver from 'key-did-resolver';
import { hash as sha256 } from '@stablelib/sha256';
import { DID } from 'dids';
import * as u8a from 'uint8arrays';
import { devtools } from 'zustand/middleware';
import type { Identifier } from '@zcredjs/core';

type State = {
  seedFromSubjectId: Identifier | null;
  did: DID | null;
}

type Actions = {
  authenticate: (seed: string, subjectId: Identifier) => Promise<void>;
  reset: () => void;
}

const initialState: State = {
  did: null,
  seedFromSubjectId: null,
};

export const useDidStore = create<State & Actions>()(devtools((set) => ({
  ...initialState,
  authenticate: async (seed: string, subjectId: Identifier) => {
    const hash = sha256(u8a.fromString(seed.slice(2))); // TODO: убирать slice или нет
    const provider = new Ed25519Provider(hash);
    const did = new DID({ provider, resolver: KeyResolver.getResolver() });
    await did.authenticate();
    set({ did, seedFromSubjectId: subjectId }, false, 'authenticate');
  },
  reset: () => set(initialState, false, 'reset'),
}), { name: 'app', store: 'did' }));
