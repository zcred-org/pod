import type { Signal } from '@preact/signals-react';
import { type Challenge, type Identifier, isIdentifier, isChallenge } from '@zcredjs/core';
import { toast } from 'sonner';
import { z } from 'zod';
import { config } from '@/config';
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

export class SessionPersistedStore {
  static readonly #localStorageKey = 'zCredSession';
  public static session: Signal<SessionPersisted | null> = signal(null);

  static init(zcredSessionId: string): void {
    try {
      const sessionStoreStr = localStorage.getItem(SessionPersistedStore.#localStorageKey);
      if (!sessionStoreStr) throw new Error('Session not found');
      const [sessionStore, sessionParseError] = JSONParse<unknown>(sessionStoreStr);
      if (sessionParseError) throw new Error(`Session parse error`);
      const result = schema(zcredSessionId).safeParse(sessionStore);
      if (!result.success) {
        config.isDev && console.error('Session validation error:', result.error);
        throw new Error('Session validation error');
      }
      SessionPersistedStore.session.value = result.data[zcredSessionId];
    } catch (e) {
      toast.error(`Failed to load session: ${(e as Error).message}`);
    } finally {
      localStorage.removeItem(SessionPersistedStore.#localStorageKey);
    }
  }

  static set(zcredSessionId: string, session: SessionPersisted) {
    localStorage.setItem(SessionPersistedStore.#localStorageKey, JSON.stringify({ [zcredSessionId]: session }));
  }

  static cleanup() {
    localStorage.removeItem(SessionPersistedStore.#localStorageKey);
    SessionPersistedStore.session.value = null;
  }
}
