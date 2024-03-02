import axios from 'axios';
import { CredentialsApi } from './credentials.api.ts';
import { config } from '@/config';
import { AuthApi } from '@/service/external/zcred-store/auth.api.ts';
import { useDidStore } from '@/hooks/useDid.store.ts';
import { jwtDecode } from 'jwt-decode';
import { ZCredStore } from '@/service/external/zcred-store/api-specification.ts';


export class ZCredStoreApi {
  private readonly context;
  private _token: { value: string, payload: ZCredStore['JwtPayloadDto'] } | null = null;

  public readonly credential;
  private readonly auth;

  private async getToken() {
    const didStore = useDidStore.getState();
    if (!didStore.did) throw new Error('Cannot authenticate without a DID');
    // Return existing token if it's valid
    if (this._token && this._token.payload.exp * 1000 - 10_000 > Date.now() && this._token.payload.did === didStore.did.id) {
      return this._token.value;
    }
    // Request new token
    const nonce = await this.auth.wantAuth({ did: didStore.did.id });
    const { signatures: [signature] } = await didStore.did.createJWS(nonce);
    const tokenNew = await this.auth.auth({ did: didStore.did.id, signature });
    this._token = {
      value: tokenNew,
      payload: jwtDecode<ZCredStore['JwtPayloadDto']>(tokenNew),
    };
    return tokenNew;
  }

  constructor() {
    this.context = {
      axios: axios.create({ baseURL: config.zCredStoreOrigin.href }),
    };
    this.credential = new CredentialsApi(this.context);
    this.auth = new AuthApi(this.context);
    this.context.axios.interceptors.request.use(async (config) => {
      if (!config.url?.toLowerCase().includes('auth')) {
        config.headers.Authorization = `Bearer ${await this.getToken()}`;
      }
      return config;
    });
  }
}

export const zCredStore = new ZCredStoreApi();
