import { type Challenge, type Identifier, isIdentifier, isChallenge } from '@zcredjs/core';
import { omit } from 'lodash-es';
import { toast } from 'sonner';
import { z } from 'zod';
import { config } from '@/config';
import { AppGlobal } from '@/config/app-global.ts';
import { JSONSafeParse } from '@/util/independent/json.ts';
import { signal } from '@/util/independent/signals/signals-dev-tools.ts';


type SessionPersisted = z.infer<ReturnType<typeof schema>>[string];

const schema = (zcredSessionId: string) => z.object({
  [zcredSessionId]: z.object({
    subjectId: z.custom<Identifier>(isIdentifier, { message: 'Invalid Identifier' }),
    challenge: z.custom<Challenge>(isChallenge, { message: 'Invalid Challenge' }),
  }),
});

export class ZCredIssueStore {
  public static readonly searchQueryKey = 'zcredSessionId' as const;
  static readonly #localStorageKey = 'zCredIssueSession' as const;

  public static session = signal<SessionPersisted | null>(null, `ZCredIssueStore.session`);

  public static init(zcredSessionId: string): void {
    try {
      const sessionStoreStr = localStorage.getItem(ZCredIssueStore.#localStorageKey);
      if (!sessionStoreStr) throw new Error('Session not found');
      const [sessionStore, sessionParseError] = JSONSafeParse<unknown>(sessionStoreStr);
      if (sessionParseError) throw new Error(`Session parse error`);
      const result = schema(zcredSessionId).safeParse(sessionStore);
      if (!result.success) {
        config.isDev && console.error('Session validation error:', result.error);
        throw new Error('Session validation error');
      }
      ZCredIssueStore.session.value = result.data[zcredSessionId];
    } catch (e) {
      toast.error(`Failed to load session: ${(e as Error).message}`);
      ZCredIssueStore.cleanup();
    }
  }

  public static set(zcredSessionId: string, session: SessionPersisted) {
    localStorage.setItem(ZCredIssueStore.#localStorageKey, JSON.stringify({ [zcredSessionId]: session }));
  }

  public static cleanup() {
    const state = AppGlobal.router.state;
    AppGlobal.router.navigate({
      // @ts-expect-error - clean session id from search on current unknown untyped route
      search: omit(state.location.search, ZCredIssueStore.searchQueryKey),
      ignoreBlocker: true,
    }).then();
    localStorage.removeItem(ZCredIssueStore.#localStorageKey);
    ZCredIssueStore.session.value = null;
  }
}
