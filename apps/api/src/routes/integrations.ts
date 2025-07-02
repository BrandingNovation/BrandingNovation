import { FastifyInstance } from 'fastify';

export async function integrationRoutes(server: FastifyInstance): Promise<void> {
  server.get('/', async () => ({ status: 'integration routes operational' }));
}