import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { config } from '@/config';
import type { ZCredStore } from '@/service/external/zcred-store/api-specification.ts';
import { AuthApi } from '@/service/external/zcred-store/auth.api.ts';
import { SecretDataApi } from '@/service/external/zcred-store/secret-data.api.ts';
import { DidStore } from '@/stores/did.store.ts';
import { CredentialsApi } from './credentials.api.ts';


export class ZCredStoreApi {
  private readonly context;
  #tokenPromise: Promise<string> | null = null;
  #token: { value: string, payload: ZCredStore['JwtPayloadDto'] } | null = null;

  public readonly credential;
  public readonly secretData;
  private readonly auth;

  private getToken(): Promise<string> {
    this.#tokenPromise ??= (async () => {
      const did = DidStore.$did.peek();
      if (!did) throw new Error('Cannot request zcred-store JWT without a DID');
      // Return existing token if it's valid
      if (this.#token && this.#token.payload.exp * 1000 - 10_000 > Date.now() && this.#token.payload.did === did.id) {
        return this.#token.value;
      }
      // Request new token
      const nonce = await this.auth.wantAuth({ did: did.id });
      const { signatures: [signature] } = await did.createJWS(nonce);
      const tokenNew = await this.auth.auth({ did: did.id, signature });
      this.#token = {
        value: tokenNew,
        payload: jwtDecode<ZCredStore['JwtPayloadDto']>(tokenNew),
      };
      return tokenNew;
    })().finally(() => this.#tokenPromise = null);
    return this.#tokenPromise;
  }

  constructor() {
    this.context = {
      axios: axios.create({ baseURL: config.zCredStoreOrigin.href }),
    };
    this.credential = new CredentialsApi(this.context);
    this.auth = new AuthApi(this.context);
    this.secretData = new SecretDataApi(this.context);
    this.context.axios.interceptors.request.use(async (config) => {
      if (config.url?.toLowerCase().includes('credential')) {
        config.headers.Authorization = `Bearer ${await this.getToken()}`;
      }
      return config;
    });
  }
}

export const zCredStore = new ZCredStoreApi();
