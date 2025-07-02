import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export async function authMiddleware(server: FastifyInstance): Promise<void> {
  server.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    // Placeholder – implement JWT verification here.
    // Currently allows all requests through.
    return;
  });
}