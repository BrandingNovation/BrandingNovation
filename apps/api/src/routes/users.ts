import { FastifyInstance } from 'fastify';

export async function userRoutes(fastify: FastifyInstance) {
  // Get current user profile (simplified)
  fastify.get('/profile', async (request, reply) => {
    reply.send({
      id: 'demo-user-id',
      email: 'demo@flowforge.ai',
      firstName: 'Demo',
      lastName: 'User',
      createdAt: new Date().toISOString(),
    });
  });

  // Update user profile (simplified)
  fastify.put('/profile', async (request, reply) => {
    reply.send({
      id: 'demo-user-id',
      message: 'Profile updated successfully',
    });
  });

  // Delete user account (simplified)
  fastify.delete('/account', async (request, reply) => {
    reply.send({
      message: 'Account deleted successfully',
    });
  });
}