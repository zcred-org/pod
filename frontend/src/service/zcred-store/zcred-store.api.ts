import axios from 'axios';
import { DID } from 'dids';
import { CredentialsApi } from './credentials.api.ts';
import { merge } from 'lodash';
import { useDidStore } from '@/hooks/useDid.store.ts';


export class ZCredStoreApi {
  private readonly context;

  public readonly credential;

  constructor(did: DID | (() => DID)) {
    this.context = {
      did: () => typeof did === 'function' ? did() : did,
      axios: axios.create({
        baseURL: import.meta.env.VITE_ZCRED_STORE_URL,
      }),
    };
    this.context.axios.interceptors.request.use((config) => {
      merge(config.headers, {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      });
      return config;
    });
    this.credential = new CredentialsApi(this.context);
  }
}

export const zCredStore = new ZCredStoreApi(() => {
  const did1 = useDidStore.getState().did;
  if (!did1) throw new Error('Cannot authenticate without a DID');
  return did1;
});
