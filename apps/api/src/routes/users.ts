import { FastifyInstance } from 'fastify';

export async function userRoutes(server: FastifyInstance): Promise<void> {
  server.get('/', async () => ({ status: 'user routes operational' }));
}