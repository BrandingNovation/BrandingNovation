import { FastifyInstance, FastifyError } from 'fastify';

export async function errorHandler(fastify: FastifyInstance) {
  fastify.setErrorHandler(async (error: FastifyError, request, reply) => {
    const { validation, statusCode } = error;

    // Handle validation errors
    if (validation) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: 'The request data is invalid',
        details: validation,
        statusCode: 400,
      });
    }

    // Handle authentication errors
    if (statusCode === 401) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Authentication required',
        statusCode: 401,
      });
    }

    // Handle authorization errors
    if (statusCode === 403) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'Insufficient permissions',
        statusCode: 403,
      });
    }

    // Handle not found errors
    if (statusCode === 404) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'The requested resource was not found',
        statusCode: 404,
      });
    }

    // Handle rate limit errors
    if (statusCode === 429) {
      return reply.status(429).send({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded',
        statusCode: 429,
      });
    }

    // Log internal server errors
    if (statusCode && statusCode >= 500) {
      fastify.log.error(error);
    }

    // Default error response
    const finalStatusCode = statusCode || 500;
    reply.status(finalStatusCode).send({
      error: error.name || 'Internal Server Error',
      message: error.message || 'An unexpected error occurred',
      statusCode: finalStatusCode,
    });
  });
}