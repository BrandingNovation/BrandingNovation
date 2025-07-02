import { FastifyInstance } from 'fastify';
import { Type } from '@sinclair/typebox';

export async function authRoutes(fastify: FastifyInstance) {
  // Register endpoint
  fastify.post('/register', {
    schema: {
      body: Type.Object({
        email: Type.String({ format: 'email' }),
        password: Type.String({ minLength: 8 }),
        firstName: Type.String({ minLength: 1 }),
        lastName: Type.String({ minLength: 1 }),
      }),
    },
  }, async (request, reply) => {
    const { email, password: _password, firstName, lastName } = request.body as {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    };
    
    reply.code(201).send({
      message: 'User registered successfully',
      user: {
        id: 'demo-user-id',
        email,
        firstName,
        lastName,
      },
    });
  });

  // Login endpoint
  fastify.post('/login', {
    schema: {
      body: Type.Object({
        email: Type.String({ format: 'email' }),
        password: Type.String(),
      }),
    },
  }, async (request, reply) => {
    const { email, password: _password } = request.body as {
      email: string;
      password: string;
    };
    
    const token = fastify.jwt.sign({ 
      userId: 'demo-user-id',
      email 
    });
    
    reply.send({
      access_token: token,
      user: {
        id: 'demo-user-id',
        email,
        firstName: 'Demo',
        lastName: 'User',
      },
    });
  });

  // Refresh token endpoint (simplified)
  fastify.post('/refresh', async (request, reply) => {
    const newToken = fastify.jwt.sign({
      userId: 'demo-user-id',
      email: 'demo@flowforge.ai',
    });
    
    reply.send({
      access_token: newToken,
    });
  });

  // Get current user (simplified)
  fastify.get('/me', async (request, reply) => {
    reply.send({
      id: 'demo-user-id',
      email: 'demo@flowforge.ai',
      firstName: 'Demo',
      lastName: 'User',
    });
  });
}