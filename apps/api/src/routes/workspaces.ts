import { FastifyInstance } from 'fastify';

export async function workspaceRoutes(server: FastifyInstance): Promise<void> {
  server.get('/', async () => ({ status: 'workspace routes operational' }));
}