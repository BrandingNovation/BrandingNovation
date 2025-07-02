import { FastifyInstance } from 'fastify';

export async function webhookRoutes(server: FastifyInstance): Promise<void> {
  server.get('/', async () => ({ status: 'webhook routes operational' }));
}