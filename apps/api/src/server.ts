import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';

import { createPostgresPool, createMongoConnection, checkDatabaseHealth } from './config/database.js';
import { authRoutes } from './routes/auth.js';
import { workflowRoutes } from './routes/workflows.js';

const server = Fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  },
});

// Database connections
let pgPool: any;
let mongodb: any;

// Register essential plugins
await server.register(helmet, {
  contentSecurityPolicy: false,
});

await server.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
});

await server.register(jwt, {
  secret: process.env.JWT_SECRET || 'flowforge-dev-secret-key',
});

// API Documentation
await server.register(swagger, {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'FlowForge API',
      description: 'AI Workflow Automation Platform API',
      version: '1.0.0',
      contact: {
        name: 'FlowForge Team',
        email: 'support@flowforge.ai',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3001',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    tags: [
      { name: 'Authentication', description: 'User authentication and authorization' },
      { name: 'Workflows', description: 'Workflow management and execution' },
      { name: 'Health', description: 'System health and monitoring' },
    ],
  },
});

await server.register(swaggerUI, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false,
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
});

// Health check endpoint
server.get('/health', {
  schema: {
    tags: ['Health'],
    summary: 'System health check',
    description: 'Check the health status of the API and its dependencies',
    response: {
      200: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          timestamp: { type: 'string' },
          version: { type: 'string' },
          service: { type: 'string' },
          database: {
            type: 'object',
            properties: {
              postgres: { type: 'boolean' },
              mongodb: { type: 'boolean' },
            }
          }
        }
      }
    }
  }
}, async () => {
  const dbHealth = pgPool && mongodb 
    ? await checkDatabaseHealth(pgPool, mongodb)
    : { postgres: false, mongodb: false, timestamp: new Date().toISOString() };

  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'FlowForge API',
    database: {
      postgres: dbHealth.postgres,
      mongodb: dbHealth.mongodb,
    }
  };
});

// API status endpoint
server.get('/api/status', {
  schema: {
    tags: ['Health'],
    summary: 'API status information',
    response: {
      200: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          version: { type: 'string' },
          environment: { type: 'string' },
          uptime: { type: 'number' },
          features: {
            type: 'object',
            properties: {
              authentication: { type: 'boolean' },
              workflows: { type: 'boolean' },
              aiAgents: { type: 'boolean' },
              integrations: { type: 'boolean' },
            }
          }
        }
      }
    }
  }
}, async () => {
  return {
    message: 'FlowForge API is running!',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    features: {
      authentication: true,
      workflows: true,
      aiAgents: false, // Coming soon
      integrations: false, // Coming soon
    }
  };
});

// Register route modules
await server.register(authRoutes, { prefix: '/api' });
await server.register(workflowRoutes, { prefix: '/api' });

// Demo endpoints for testing
server.get('/api/demo/workflows', {
  schema: {
    tags: ['Workflows'],
    summary: 'Get demo workflows',
    description: 'Returns sample workflow data for testing and demos',
  }
}, async () => {
  return {
    data: [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Customer Onboarding Automation',
        description: 'Automated welcome email sequence with CRM integration',
        tags: ['onboarding', 'email', 'crm'],
        status: 'active',
        nodeCount: 6,
        executionCount: 142,
        successRate: 0.96,
        avgExecutionTime: '2.3s',
        lastExecuted: new Date(Date.now() - 3600000).toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      },
      {
        id: '987fcdeb-51d2-43a8-b456-426614174001',
        name: 'Lead Qualification Pipeline',
        description: 'AI-powered lead scoring with Slack notifications',
        tags: ['leads', 'ai', 'slack', 'scoring'],
        status: 'active',
        nodeCount: 8,
        executionCount: 89,
        successRate: 0.94,
        avgExecutionTime: '4.1s',
        lastExecuted: new Date(Date.now() - 1800000).toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: '456e7890-a12b-34c5-d678-426614174002',
        name: 'Content Distribution Flow',
        description: 'Multi-channel content publishing with analytics tracking',
        tags: ['content', 'social', 'analytics'],
        status: 'draft',
        nodeCount: 4,
        executionCount: 0,
        successRate: 0,
        avgExecutionTime: '0s',
        lastExecuted: null,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      }
    ],
    meta: {
      total: 3,
      active: 2,
      draft: 1,
      totalExecutions: 231,
      avgSuccessRate: 0.95
    }
  };
});

// Start server
async function start() {
  try {
    // Initialize database connections (gracefully handle failures in dev)
    try {
      pgPool = createPostgresPool();
      mongodb = await createMongoConnection();
      server.log.info('✅ Database connections initialized');
    } catch (error) {
      server.log.warn('⚠️ Database connections failed (dev mode continues)', error.message);
    }

    const address = await server.listen({
      port: Number(process.env.API_PORT) || 3001,
      host: '0.0.0.0',
    });

    server.log.info(`🚀 FlowForge API server listening at ${address}`);
    server.log.info(`📚 API Documentation available at ${address}/docs`);
    server.log.info(`💊 Health check available at ${address}/health`);
    server.log.info(`🔄 Demo endpoints available at ${address}/api/demo/workflows`);

  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  server.log.info('Received SIGTERM, shutting down gracefully...');
  
  try {
    if (pgPool) await pgPool.end();
    if (mongodb) await mongodb.client.close();
  } catch (error) {
    server.log.error('Error closing database connections:', error);
  }
  
  await server.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  server.log.info('Received SIGINT, shutting down gracefully...');
  
  try {
    if (pgPool) await pgPool.end();
    if (mongodb) await mongodb.client.close();
  } catch (error) {
    server.log.error('Error closing database connections:', error);
  }
  
  await server.close();
  process.exit(0);
});

start();