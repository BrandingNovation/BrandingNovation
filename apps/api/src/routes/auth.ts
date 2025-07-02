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
      response: {
        201: Type.Object({
          message: Type.String(),
          user: Type.Object({
            id: Type.String(),
            email: Type.String(),
            firstName: Type.String(),
            lastName: Type.String(),
          }),
        }),
      },
    },
  }, async (request, reply) => {
    const { email, password: _password, firstName, lastName } = request.body as {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    };
    
    // TODO: Implement user registration logic
    // - Hash password
    // - Check if user exists
    // - Create user in database
    // - Generate JWT token
    
    reply.code(201).send({
      message: 'User registered successfully',
      user: {
        id: 'temp-id',
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
      response: {
        200: Type.Object({
          access_token: Type.String(),
          user: Type.Object({
            id: Type.String(),
            email: Type.String(),
            firstName: Type.String(),
            lastName: Type.String(),
          }),
        }),
      },
    },
  }, async (request, reply) => {
    const { email, password: _password } = request.body as {
      email: string;
      password: string;
    };
    
    // TODO: Implement login logic
    // - Find user by email
    // - Verify password
    // - Generate JWT token
    
    const token = fastify.jwt.sign({ 
      userId: 'temp-id',
      email 
    });
    
    reply.send({
      access_token: token,
      user: {
        id: 'temp-id',
        email,
        firstName: 'John',
        lastName: 'Doe',
      },
    });
  });

  // Refresh token endpoint
  fastify.post('/refresh', {
    preHandler: [(fastify as any).authenticate],
  }, async (request, reply) => {
    const user = request.user as any;
    
    const newToken = fastify.jwt.sign({
      userId: user.userId,
      email: user.email,
    });
    
    reply.send({
      access_token: newToken,
    });
  });

  // Get current user
  fastify.get('/me', {
    preHandler: [(fastify as any).authenticate],
  }, async (request, reply) => {
    const user = request.user as any;
    
    // TODO: Fetch user details from database
    
    reply.send({
      id: user.userId,
      email: user.email,
      firstName: 'John',
      lastName: 'Doe',
    });
  });
}