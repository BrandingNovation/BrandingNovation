import { FastifyInstance } from 'fastify';

export async function aiAgentRoutes(server: FastifyInstance): Promise<void> {
  server.get('/', async () => ({ status: 'ai-agent routes operational' }));
}