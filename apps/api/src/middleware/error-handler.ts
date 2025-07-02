import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export async function errorHandler(server: FastifyInstance): Promise<void> {
  server.setErrorHandler(
    async (error, _request: FastifyRequest, reply: FastifyReply) => {
      const statusCode = error.statusCode ?? 500;
      reply.code(statusCode).send({
        error: error.name ?? 'Error',
        message: error.message,
      });
    },
  );
}