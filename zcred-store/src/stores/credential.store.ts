import { type DataSource } from '../backbone/db-client.js';
import { tokens } from '../util/tokens.js';
import { CredentialEntity, type CredentialEntityNew } from '../entities/credential.entity.js';
import { and, eq, type Placeholder, type SQL, sql } from 'drizzle-orm';
import { type IssuerDto } from '../dtos/issuer.dto.js';
import { type Identifier } from '../dtos/identifier.dto.js';
import { issuerConcat, subjectIdConcat } from '../util/index.js';
import { type CredentialDto } from '../controllers/credential/dtos/credential.dto.js';
import { type Schema } from 'type-fest';
import { type CredentialIdDto } from '../controllers/credential/dtos/credential-id.dto.js';
import { inArray } from 'drizzle-orm/sql/expressions/conditions';

export class CredentialStore {
  private readonly credentialsQuery;
  private readonly credentialUpsertQuery;

  public static readonly inject = tokens('dataSource');

  constructor({ db }: DataSource) {
    this.credentialsQuery = db.select({
      id: CredentialEntity.id,
      data: CredentialEntity.data,
      createdAt: CredentialEntity.createdAt,
      updatedAt: CredentialEntity.updatedAt,
    }).from(CredentialEntity).where(and(
      eq(CredentialEntity.controlledBy, sql.placeholder('controlledBy')),
      inArray(sql.placeholder('subjectId'), [CredentialEntity.subjectId, sql`''`]),
      inArray(sql.placeholder('issuer'), [CredentialEntity.issuer, sql`''`]),
    )).prepare('credentials_of_user_find_many');

    const credentialForSave: any = {
      id: sql.placeholder('id'),
      controlledBy: sql.placeholder('controlledBy'),
      subjectId: sql.placeholder('subjectId'),
      issuer: sql.placeholder('issuer'),
      data: sql.placeholder('data'),
    } satisfies Schema<CredentialEntityNew, Placeholder>;

    this.credentialUpsertQuery = db.insert(CredentialEntity).values(credentialForSave).returning({
      id: CredentialEntity.id,
    }).onConflictDoUpdate({
      target: [CredentialEntity.id],
      set: {
        ...credentialForSave,
        updatedAt: sql`now()`,
      },
      // Check owner (controlledBy) on conflicted row
      where: eq(CredentialEntity.controlledBy, sql.placeholder('controlledBy')),
    }).prepare('upsert_credential_of_user');
  }

  public async credentialUpsert(
    credentialForSave: CredentialEntityNew,
  ): Promise<CredentialIdDto | null> {
    credentialForSave.id ??= crypto.randomUUID();
    const { 0: credentialSaved = null } = await this.credentialUpsertQuery.execute(credentialForSave);
    // If owner (controlledBy) mismatched on update, then nothing updated and return null
    return credentialSaved;
  }

  public async credentialsSearch(
    filter: { controlledBy: string, issuer?: IssuerDto, subjectId?: Identifier },
  ): Promise<CredentialDto[]> {
    console.log('filter', filter);
    return this.credentialsQuery.execute({
      controlledBy: filter.controlledBy,
      subjectId: filter.subjectId ? subjectIdConcat(filter.subjectId) : '',
      issuer: filter.issuer ? issuerConcat(filter.issuer) : '',
    });
  }
}
