import { FastifyInstance } from 'fastify';

export async function authRoutes(server: FastifyInstance): Promise<void> {
  server.get('/', async () => ({ status: 'auth route operational' }));
}