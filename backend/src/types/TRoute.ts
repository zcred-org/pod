import { RouteOptions } from 'fastify';

export type TRoute = Omit<RouteOptions, 'handler'>;
