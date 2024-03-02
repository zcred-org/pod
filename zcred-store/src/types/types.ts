// import type { JWT } from '@fastify/jwt';
import type { JwtPayloadDto } from '../models/dtos/jwt-payload.dto.js';

declare module 'fastify' {
  // interface FastifyRequest {
  //   jwt: JWT
  // }
  export interface FastifyInstance {
    authenticate: any
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: JwtPayloadDto;
  }
}
