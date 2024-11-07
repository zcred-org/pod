/* eslint-disable @typescript-eslint/no-explicit-any */
import { hash as sha256 } from '@stablelib/sha256';
import { DID } from 'dids';
import { Ed25519Provider } from 'key-did-provider-ed25519';
import { getResolver } from 'key-did-resolver';
import type { Asyncify } from 'type-fest';
import * as u8a from 'uint8arrays';


type AsyncDID = { [Key in keyof DID]: DID[Key] extends (...arguments_: any[]) => any
  ? Asyncify<DID[Key]>
  : Promise<DID[Key]> };

function createDIDAuthProxy(did: DID): AsyncDID {
  return new Proxy(did, {
    get(target: DID, key: keyof DID) {
      return async (...args: any[]) => {
        if (!target.authenticated && key !== 'authenticate') {
          await target.authenticate();
        }

        const property = target[key];

        if (typeof property === 'function') {
          const result = (property as any).apply(target, args);
          return result instanceof Promise ? result : Promise.resolve(result);
        }

        return Promise.resolve(property);
      };
    },
  }) as unknown as AsyncDID;
}


const hash = sha256(u8a.fromString('public'));
const provider = new Ed25519Provider(hash);
export const didPublic = createDIDAuthProxy(new DID({ provider, resolver: getResolver() }));
