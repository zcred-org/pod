import { type AppContext } from '../../app.js';
import { CredentialUpsertRoute } from './routes/credential-upsert.route.js';
import { CredentialsRoute } from './routes/credentials.route.js';
import { CredentialEntity, type CredentialEntityNew, credentialEntityParse } from '../../entities/credential.entity.js';
import { and, eq } from 'drizzle-orm';
import { issuerConcat, subjectIdConcat } from '../../util/index.js';

export function CredentialController(context: AppContext) {
  const {
    httpServer: { fastify },
    dataSource: { db },
  } = context;

  fastify.route<CredentialUpsertRoute>({
    method: CredentialUpsertRoute.method,
    url: CredentialUpsertRoute.url,
    schema: CredentialUpsertRoute.schema,
    handler: async (req, reply) => {
      const credentialForSave: CredentialEntityNew = {
        id: req.body.id,
        controlledBy: req.headers.did,
        subjectId: subjectIdConcat(req.body.subjectId),
        issuer: issuerConcat(req.body.issuer),
        data: req.body.data,
      };
      const { 0: credential } = await db.insert(CredentialEntity).values(credentialForSave).returning()
        .onConflictDoUpdate({
          target: [CredentialEntity.id],
          set: {
            ...credentialForSave,
            updatedAt: new Date(),
          },
          // Check owner (id & controlledBy) on conflict
          where: eq(CredentialEntity.controlledBy, req.headers.did),
        });
      if (!credential) {
        // Owner (id & controlledBy) mismatch on update
        return reply.status(401).send(`Credential update rejected with provided id=${req.body.id}`);
      }
      return credentialEntityParse(credential);
    },
  });

  fastify.route<CredentialsRoute>({
    method: CredentialsRoute.method,
    url: CredentialsRoute.url,
    schema: CredentialsRoute.schema,
    handler: async (req, reply) => {
      const errors: string[] = [];
      if (!req.query['subject.id.type'] !== !req.query['subject.id.key']) {
        errors.push('subject.id.type and subject.id.key must be both present or both absent');
      }
      if (!req.query['issuer.type'] !== !req.query['issuer.uri']) {
        errors.push('issuer.type and issuer.uri must be both present or both absent');
      }
      if (errors.length) {
        return reply.status(400).send(errors.join(';'));
      }
      const subjectId = req.query['subject.id.type'] && req.query['subject.id.key']
        ? subjectIdConcat({ type: req.query['subject.id.type'], key: req.query['subject.id.key'] })
        : undefined;
      const issuer = req.query['issuer.type'] && req.query['issuer.uri']
        ? issuerConcat({ type: req.query['issuer.type'], uri: req.query['issuer.uri'] })
        : undefined;
      return db.select().from(CredentialEntity).where(and(
        eq(CredentialEntity.controlledBy, req.headers.did),
        subjectId ? eq(CredentialEntity.subjectId, subjectId) : undefined,
        issuer ? eq(CredentialEntity.issuer, issuer) : undefined,
      )).then((credentials) => credentials.map(credentialEntityParse));
    },
  });
}
