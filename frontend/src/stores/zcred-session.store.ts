import { type Challenge, type Identifier, isIdentifier, isChallenge } from '@zcredjs/core';
import { omit } from 'lodash-es';
import { toast } from 'sonner';
import { z } from 'zod';
import { config } from '@/config';
import { AppGlobal } from '@/config/app-global.ts';
import { JSONParse } from '@/util';
import { signal } from '@/util/signals/signals-dev-tools.ts';


type SessionPersisted = z.infer<ReturnType<typeof schema>>[string];

const schema = (zcredSessionId: string) => z.object({
  [zcredSessionId]: z.object({
    subjectId: z.custom<Identifier>(isIdentifier, { message: 'Invalid Identifier' }),
    didPrivateKey: z.string(),
    didKey: z.string(),
    challenge: z.custom<Challenge>(isChallenge, { message: 'Invalid Challenge' }),
  }),
});

export class ZCredSessionStore {
  public static readonly searchQueryKey = 'zcredSessionId' as const;
  static readonly #localStorageKey = 'zCredSession' as const;

  public static session = signal<SessionPersisted | null>(null, `${ZCredSessionStore.name}.session`);

  static init(zcredSessionId: string): void {
    try {
      const sessionStoreStr = localStorage.getItem(ZCredSessionStore.#localStorageKey);
      if (!sessionStoreStr) throw new Error('Session not found');
      const [sessionStore, sessionParseError] = JSONParse<unknown>(sessionStoreStr);
      if (sessionParseError) throw new Error(`Session parse error`);
      const result = schema(zcredSessionId).safeParse(sessionStore);
      if (!result.success) {
        config.isDev && console.error('Session validation error:', result.error);
        throw new Error('Session validation error');
      }
      ZCredSessionStore.session.value = result.data[zcredSessionId];
    } catch (e) {
      toast.error(`Failed to load session: ${(e as Error).message}`);
      ZCredSessionStore.cleanup();
    }
  }

  static set(zcredSessionId: string, session: SessionPersisted) {
    localStorage.setItem(ZCredSessionStore.#localStorageKey, JSON.stringify({ [zcredSessionId]: session }));
  }

  static cleanup() {
    const state = AppGlobal.router.state;
    AppGlobal.router.navigate({
      // @ts-expect-error - clean session id from search on current unknown untyped route
      search: omit(state.location.search, ZCredSessionStore.searchQueryKey),
      ignoreBlocker: true,
    }).then();
    localStorage.removeItem(ZCredSessionStore.#localStorageKey);
    ZCredSessionStore.session.value = null;
  }
}
