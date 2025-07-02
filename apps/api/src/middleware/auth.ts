import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export async function authMiddleware(fastify: FastifyInstance) {
  // Register auth decorator
  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ error: 'Authentication required' });
    }
  });

  // Optional auth for routes that can work with or without authentication
  fastify.decorate('optionalAuth', async (request: FastifyRequest, _reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      // Continue without throwing error
    }
  });
}