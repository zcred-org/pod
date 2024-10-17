import { batch, type ReadonlySignal } from '@preact/signals-react';
import { hash as sha256 } from '@stablelib/sha256';
import { DID } from 'dids';
import { Ed25519Provider } from 'key-did-provider-ed25519';
import { getResolver } from 'key-did-resolver';
import * as u8a from 'uint8arrays';
import { SessionPersistedStore } from '@/stores/session-persisted.store.ts';
import { WalletStore } from '@/stores/wallet.store.ts';
import { signal } from '@/util/signals/signals-dev-tools.ts';


const _$addressOfOwner = signal<string | null>(null, 'DidStore.addressOfOwner');

export class DidStore {
  static seed: string | null = null;
  static #$did = signal<DID | null>(null, 'DidStore.did');

  static get $did(): ReadonlySignal<DID | null> {
    return DidStore.#$did;
  }

  static async authenticate(seed: string, addressOfOwner: string) {
    const hash = sha256(u8a.fromString(seed));
    const provider = new Ed25519Provider(hash);
    const did = new DID({ provider, resolver: getResolver() });
    await did.authenticate();
    batch(() => {
      DidStore.seed = seed;
      DidStore.#$did.value = did;
      _$addressOfOwner.value = addressOfOwner;
    });
  }

  static reset() {
    batch(() => {
      DidStore.seed = null;
      DidStore.#$did.value = null;
      _$addressOfOwner.value = null;
    });
  }

  static async encrypt<T>(data: T) {
    const did = DidStore.#$did.peek();
    if (!did) throw new Error('Cannot encrypt without a DID');
    const binary = u8a.fromString(JSON.stringify(data));
    const jwe = await did.createJWE(binary, [did.id]);
    return JSON.stringify(jwe);
  }

  static async decrypt<T>(data: string): Promise<T> {
    const did = DidStore.#$did.peek();
    if (!did) throw new Error('Cannot decrypt without a DID');
    const decrypted = await did.decryptJWE(JSON.parse(data));
    return JSON.parse(u8a.toString(decrypted));
  }
}

WalletStore.$wallet.subscribe(wallet => {
  const session = SessionPersistedStore.session.peek();
  if (session && session.subjectId.key === wallet?.address) {
    return void DidStore.authenticate(session.didPrivateKey, session.subjectId.key).then();
  }

  const addressOfOwner = _$addressOfOwner.peek();
  if (addressOfOwner && addressOfOwner !== wallet?.address) {
    DidStore.reset();
  }
});
