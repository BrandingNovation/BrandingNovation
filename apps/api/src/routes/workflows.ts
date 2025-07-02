import { FastifyInstance } from 'fastify';

export async function workflowRoutes(server: FastifyInstance): Promise<void> {
  server.get('/', async () => ({ status: 'workflow routes operational' }));
}