import { hash as sha256 } from '@stablelib/sha256';
import { DID } from 'dids';
import { Ed25519Provider } from 'key-did-provider-ed25519';
import { getResolver } from 'key-did-resolver';
import * as u8a from 'uint8arrays';


const hash = sha256(u8a.fromString('public'));
const provider = new Ed25519Provider(hash);
export const didPublic = new DID({ provider, resolver: getResolver() });
await didPublic.authenticate();
