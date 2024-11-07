import { type Identifier, isIdentifier } from '@zcredjs/core';
import { z } from 'zod';
import type { Result } from '@/types';
import { JSONSafeParse } from '@/util/independent/json.ts';
import { Ms } from '@/util/independent/ms.ts';
import { subjectIdToString } from '@/util/subject-id.ts';


const schema = z.record(z.string(), z.object({
  seed: z.string(),
  subjectId: z.custom<Identifier>(isIdentifier, { message: 'Invalid Identifier' }),
  timestamp: z.coerce.date(),
}));

type Schema = z.infer<typeof schema>;

export class ZCredDidSessionStore {
  static readonly #localStorageKey = 'zCredDidSession';
  static readonly #sessionExpires = Ms.hour(1);

  static #getActiveSessions(): Result<Schema> {
    const sessionStr = localStorage.getItem(ZCredDidSessionStore.#localStorageKey);
    if (!sessionStr) return [{}];
    const [sessionObj] = JSONSafeParse<unknown>(sessionStr);
    if (!sessionObj) return [undefined, new Error(`Can't parse did sessions`)];
    const validation = schema.safeParse(sessionObj);
    if (!validation.success) return [undefined, new Error('Invalid did sessions')];
    const now = Date.now();
    return [
      Object.fromEntries(Object.entries(validation.data)
        .filter(([, session]) => now - session.timestamp.getTime() < ZCredDidSessionStore.#sessionExpires)),
    ];
  }

  static get(subjectId: Identifier): string | undefined {
    const [sessions, error] = ZCredDidSessionStore.#getActiveSessions();
    if (error) return void localStorage.removeItem(ZCredDidSessionStore.#localStorageKey);
    localStorage.setItem(ZCredDidSessionStore.#localStorageKey, JSON.stringify(sessions satisfies Schema));
    return sessions[subjectIdToString(subjectId)]?.seed;
  }

  static save(subjectId: Identifier, seed: string): void {
    const [sessions = {}] = ZCredDidSessionStore.#getActiveSessions();
    sessions[subjectIdToString(subjectId)] = { seed, subjectId, timestamp: new Date() };
    localStorage.setItem(ZCredDidSessionStore.#localStorageKey, JSON.stringify(sessions satisfies Schema));
  }

  static clear(): void {
    return void localStorage.removeItem(ZCredDidSessionStore.#localStorageKey);
  }
}
