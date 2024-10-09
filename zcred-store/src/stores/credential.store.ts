import { type DbClient } from '../backbone/db-client.js';
import { tokens } from '../util/tokens.js';
import { CredentialEntity, type CredentialEntityNew } from '../models/entities/credential.entity.js';
import { and, eq, type Placeholder, sql, count, desc } from 'drizzle-orm';
import { type IssuerDto } from '../models/dtos/issuer.dto.js';
import { type Identifier } from '../models/dtos/identifier.dto.js';
import { issuerConcat, subjectIdConcat } from '../util/index.js';
import { type Schema } from 'type-fest';
import { inArray } from 'drizzle-orm/sql/expressions/conditions';
import crypto from 'node:crypto';

export class CredentialStore {
  readonly #countByUserQuery;
  readonly #findManyQuery;
  readonly #findOneByIdQuery;
  readonly #upsertOneQuery;

  public static readonly inject = tokens('dbClient');

  constructor({ db }: DbClient) {
    this.#findOneByIdQuery = db.select().from(CredentialEntity).where(and(
      eq(CredentialEntity.id, sql.placeholder('id')),
      eq(CredentialEntity.controlledBy, sql.placeholder('controlledBy')),
    )).prepare('credential_of_user__find_by_id');

    const findManyWhere = and(
      eq(sql.placeholder('controlledBy'), CredentialEntity.controlledBy),
      inArray(sql.placeholder('subjectId'), [CredentialEntity.subjectId, sql`''`]),
      inArray(sql.placeholder('issuer'), [CredentialEntity.issuer, sql`''`]),
    );
    this.#findManyQuery = db.select()
      .from(CredentialEntity)
      .where(findManyWhere)
      // OrderBy:
      //  Affects credentials fetch>update>in-store-update batching on the frontend, since fetch and update happens at the same time.
      //  It must not be sorted by updatedAt here, or fetching and in-store-update should be separated on the frontend.
      .orderBy(desc(CredentialEntity.createdAt))
      .limit(sql.placeholder('limit'))
      .offset(sql.placeholder('offset'))
      .prepare('credentials_of_user__find_many');
    this.#countByUserQuery = db.select({ count: count() })
      .from(CredentialEntity)
      .where(findManyWhere)
      .prepare('credentials_of_user__no_paginated_count');

    const credentialForSave: any = {
      id: sql.placeholder('id'),
      controlledBy: sql.placeholder('controlledBy'),
      subjectId: sql.placeholder('subjectId'),
      issuer: sql.placeholder('issuer'),
      data: sql.placeholder('data'),
    } as const satisfies Schema<CredentialEntityNew, Placeholder>;

    this.#upsertOneQuery = db.insert(CredentialEntity).values(credentialForSave).onConflictDoUpdate({
      target: [CredentialEntity.id],
      set: {
        ...credentialForSave,
        updatedAt: sql`now()`,
      },
      // Check owner (controlledBy) on conflicted row
      setWhere: eq(CredentialEntity.controlledBy, sql.placeholder('controlledBy')),
    }).returning().prepare('credential_of_user__upsert');
  }

  public async findOneById(
    args: { id: string, controlledBy: string },
  ): Promise<CredentialEntity | null> {
    const { 0: credential = null } = await this.#findOneByIdQuery.execute(args);
    return credential;
  }

  public async upsertOne(
    credentialForSave: CredentialEntityNew,
  ): Promise<CredentialEntity | null> {
    credentialForSave.id ??= crypto.randomUUID();
    const { 0: credentialSaved = null } = await this.#upsertOneQuery.execute(credentialForSave);
    // If owner (controlledBy) mismatched on update, then nothing was updated and return null
    return credentialSaved;
  }

  public async findMany(
    filter: {
      controlledBy: string,
      issuer?: IssuerDto,
      subjectId?: Identifier,
    },
    pagination?: { limit?: number, offset?: number },
  ) {
    const searchParams = {
      controlledBy: filter.controlledBy,
      subjectId: filter.subjectId ? subjectIdConcat(filter.subjectId) : '',
      issuer: filter.issuer ? issuerConcat(filter.issuer) : '',
    };
    const paginationParams = {
      limit: pagination?.limit ?? 10,
      offset: pagination?.offset ?? 0,
    };
    const credentials = await this.#findManyQuery.execute({ ...searchParams, ...paginationParams });
    const countTotal = await this.#countByUserQuery.execute(searchParams)
      .then(rez => rez[0]!.count);
    return { credentials, countTotal };
  }
}
