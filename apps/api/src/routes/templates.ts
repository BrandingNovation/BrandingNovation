import { FastifyInstance } from 'fastify';

export async function templateRoutes(server: FastifyInstance): Promise<void> {
  server.get('/', async () => ({ status: 'template routes operational' }));
}