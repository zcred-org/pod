import { type AppContext } from '../../app.js';
import { CredentialUpsertRoute, TCredentialUpsertRoute } from './credential.route.js';

export function CredentialController(context: AppContext) {
  const {
    httpServer: { fastify },
    // dataSource: { db },
  } = context;

  fastify.route<TCredentialUpsertRoute>({
    method: CredentialUpsertRoute.method,
    url: CredentialUpsertRoute.url,
    schema: CredentialUpsertRoute.schema,
    handler: async () => {
      throw new Error('Not implemented');
    },
  });
}
