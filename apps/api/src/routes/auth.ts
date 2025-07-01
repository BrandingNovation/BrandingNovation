import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(100),
  company: z.string().max(100).optional(),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const JWT_SECRET = process.env.JWT_SECRET || 'flowforge-dev-secret-key';

export async function authRoutes(fastify: FastifyInstance) {
  // Register a new user
  fastify.post<{
    Body: z.infer<typeof RegisterSchema>
  }>('/auth/register', {
    schema: {
      body: RegisterSchema
    }
  }, async (request, reply) => {
    const { email, password, name, company } = request.body;

    try {
      // Check if user already exists (mock check)
      const existingUser = null; // In real app: await getUserByEmail(email);
      
      if (existingUser) {
        return reply.code(400).send({
          error: 'User already exists',
          message: 'An account with this email already exists'
        });
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user (mock creation)
      const userId = crypto.randomUUID();
      const workspaceId = crypto.randomUUID();
      
      const user = {
        id: userId,
        email,
        name,
        company: company || null,
        role: 'owner',
        isEmailVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Create default workspace
      const workspace = {
        id: workspaceId,
        name: company || `${name}'s Workspace`,
        ownerId: userId,
        plan: 'free',
        createdAt: new Date().toISOString(),
      };

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId, 
          email,
          workspaceId,
          role: 'owner'
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      reply.code(201).send({
        data: {
          user,
          workspace,
          token,
          message: 'Account created successfully'
        }
      });
    } catch (error) {
      reply.code(500).send({ 
        error: 'Registration failed',
        message: 'Unable to create account. Please try again.'
      });
    }
  });

  // User login
  fastify.post<{
    Body: z.infer<typeof LoginSchema>
  }>('/auth/login', {
    schema: {
      body: LoginSchema
    }
  }, async (request, reply) => {
    const { email, password } = request.body;

    try {
      // Mock user lookup
      const user = {
        id: crypto.randomUUID(),
        email,
        name: 'John Doe',
        company: 'Acme Corp',
        role: 'owner',
        passwordHash: await bcrypt.hash('password123', 12), // Mock hashed password
        isEmailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (!user) {
        return reply.code(401).send({
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      
      if (!isValidPassword) {
        return reply.code(401).send({
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        });
      }

      // Get user's workspace (mock)
      const workspace = {
        id: crypto.randomUUID(),
        name: `${user.company || user.name}'s Workspace`,
        ownerId: user.id,
        plan: 'pro',
        createdAt: new Date().toISOString(),
      };

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          workspaceId: workspace.id,
          role: user.role
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Remove password from response
      const { passwordHash, ...userWithoutPassword } = user;

      return {
        data: {
          user: userWithoutPassword,
          workspace,
          token,
          message: 'Login successful'
        }
      };
    } catch (error) {
      reply.code(500).send({ 
        error: 'Login failed',
        message: 'Unable to sign in. Please try again.'
      });
    }
  });

  // Logout (client-side token removal, but we can track for analytics)
  fastify.post('/auth/logout', async (request, reply) => {
    // In a real app, you might want to blacklist the token
    // or track logout events for analytics
    
    return {
      data: {
        message: 'Logged out successfully'
      }
    };
  });

  // Get current user profile
  fastify.get('/auth/me', async (request, reply) => {
    // This would typically require JWT middleware to extract user from token
    // For now, return mock user data
    
    try {
      const user = {
        id: crypto.randomUUID(),
        email: 'user@example.com',
        name: 'John Doe',
        company: 'Acme Corp',
        role: 'owner',
        isEmailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const workspace = {
        id: crypto.randomUUID(),
        name: 'Acme Corp Workspace',
        ownerId: user.id,
        plan: 'pro',
        memberCount: 5,
        workflowCount: 12,
        createdAt: new Date().toISOString(),
      };

      return {
        data: {
          user,
          workspace,
          permissions: [
            'workflows:create',
            'workflows:read',
            'workflows:update',
            'workflows:delete',
            'workspace:manage',
            'integrations:manage'
          ]
        }
      };
    } catch (error) {
      reply.code(401).send({
        error: 'Unauthorized',
        message: 'Invalid or expired token'
      });
    }
  });

  // Refresh JWT token
  fastify.post('/auth/refresh', async (request, reply) => {
    // In a real app, this would validate the current token and issue a new one
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({
        error: 'No token provided',
        message: 'Authorization header required'
      });
    }

    try {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      // Generate new token
      const newToken = jwt.sign(
        { 
          userId: decoded.userId, 
          email: decoded.email,
          workspaceId: decoded.workspaceId,
          role: decoded.role
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return {
        data: {
          token: newToken,
          expiresIn: '7d'
        }
      };
    } catch (error) {
      reply.code(401).send({
        error: 'Invalid token',
        message: 'Token is invalid or expired'
      });
    }
  });

  // Request password reset
  fastify.post<{
    Body: { email: string }
  }>('/auth/forgot-password', async (request, reply) => {
    const { email } = request.body;

    try {
      // In a real app, this would:
      // 1. Check if user exists
      // 2. Generate reset token
      // 3. Send email with reset link
      
      // For now, just return success (don't reveal if email exists)
      return {
        data: {
          message: 'If an account with this email exists, you will receive a password reset link.'
        }
      };
    } catch (error) {
      reply.code(500).send({
        error: 'Password reset failed',
        message: 'Unable to process password reset request'
      });
    }
  });
}