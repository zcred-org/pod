import { batch, type ReadonlySignal, effect } from '@preact/signals-react';
import { hash as sha256 } from '@stablelib/sha256';
import type { Identifier } from '@zcredjs/core';
import { DID } from 'dids';
import { Ed25519Provider } from 'key-did-provider-ed25519';
import { getResolver } from 'key-did-resolver';
import * as u8a from 'uint8arrays';
import { ZCredDidSessionStore } from '@/stores/did-store/zcred-did-session.store.ts';
import { VerificationStore } from '@/stores/verification-store/verification-store.ts';
import { WalletStore } from '@/stores/wallet.store.ts';
import { signal, computed } from '@/util/independent/signals/signals-dev-tools.ts';


let _subjectIdOfOwner: Identifier | null = null;

export class DidStore {
  static seed: string | null = null;
  static #$did = signal<DID | null>(null, `DidStore.did`);
  static $isConnecting = computed<boolean>(() => {
    return WalletStore.$isConnected.value && !DidStore.$did.value
      && !VerificationStore.$isSubjectSwitchRequired.value;
  }, `DidStore.isConnecting`);

  static get $did(): ReadonlySignal<DID | null> {
    return DidStore.#$did;
  }

  static async authenticate(seed: string, subjectId: Identifier) {
    const hash = sha256(u8a.fromString(seed));
    const provider = new Ed25519Provider(hash);
    const did = new DID({ provider, resolver: getResolver() });
    await did.authenticate();
    batch(() => {
      DidStore.seed = seed;
      DidStore.#$did.value = did;
      _subjectIdOfOwner = subjectId;
      ZCredDidSessionStore.save(subjectId, seed);
    });
  }

  static reset() {
    batch(() => {
      DidStore.seed = null;
      DidStore.#$did.value = null;
      _subjectIdOfOwner = null;
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

effect(() => {
  const wallet = WalletStore.$wallet.value;
  const seed = wallet && ZCredDidSessionStore.get(wallet.subjectId);

  batch(() => {
    if (_subjectIdOfOwner && _subjectIdOfOwner.key !== wallet?.subjectId.key) {
      DidStore.reset();
    }
    if (DidStore.$isConnecting.value && seed) {
      DidStore.authenticate(seed, wallet.subjectId).then();
    }
  });
});
