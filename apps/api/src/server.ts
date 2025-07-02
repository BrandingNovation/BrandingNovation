import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import sensible from '@fastify/sensible';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

import { config } from './config/index.js';
import { authRoutes } from './routes/auth.js';
import { workflowRoutes } from './routes/workflows.js';
import { integrationRoutes } from './routes/integrations.js';
import { aiAgentRoutes } from './routes/ai-agents.js';
import { userRoutes } from './routes/users.js';
import { workspaceRoutes } from './routes/workspaces.js';
import { templateRoutes } from './routes/templates.js';
import { webhookRoutes } from './routes/webhooks.js';
import { errorHandler } from './middleware/error-handler.js';
import { authMiddleware } from './middleware/auth.js';
import { connectDatabase } from './config/database.js';
import { setupQueues } from './config/queues.js';

const server = Fastify({
  logger: {
    level: config.LOG_LEVEL,
    ...(config.NODE_ENV === 'development' && {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
        },
      },
    }),
  },
}).withTypeProvider<TypeBoxTypeProvider>();

// Register essential plugins
await server.register(helmet, {
  contentSecurityPolicy: false,
});

await server.register(cors, {
  origin: config.CORS_ORIGINS,
  credentials: true,
});

await server.register(sensible);

await server.register(jwt, {
  secret: config.JWT_SECRET,
});

await server.register(multipart, {
  limits: {
    fileSize: config.MAX_FILE_SIZE_BYTES,
  },
});

await server.register(rateLimit, {
  max: config.RATE_LIMIT_MAX_REQUESTS,
  timeWindow: config.RATE_LIMIT_WINDOW_MS,
});

// API Documentation
await server.register(swagger, {
  openapi: {
    info: {
      title: 'FlowForge API',
      description: 'AI Workflow Automation Platform API',
      version: '1.0.0',
    },
    servers: [
      {
        url: config.API_URL,
        description: 'FlowForge API Server',
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
  },
});

await server.register(swaggerUI, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false,
  },
});

// Health check endpoint
server.get('/health', async () => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  };
});

// Register middleware first
await server.register(errorHandler);
await server.register(authMiddleware);

// Register route modules after middleware
await server.register(authRoutes, { prefix: '/api/auth' });
await server.register(userRoutes, { prefix: '/api/users' });
await server.register(workspaceRoutes, { prefix: '/api/workspaces' });
await server.register(workflowRoutes, { prefix: '/api/workflows' });
await server.register(templateRoutes, { prefix: '/api/templates' });
await server.register(integrationRoutes, { prefix: '/api/integrations' });
await server.register(aiAgentRoutes, { prefix: '/api/ai-agents' });
await server.register(webhookRoutes, { prefix: '/api/webhooks' });

// Initialize database connections and queues
async function start() {
  try {
    // Connect to databases
    await connectDatabase();
    
    // Setup job queues
    await setupQueues();

    // Start server
    const address = await server.listen({
      port: config.PORT,
      host: config.HOST,
    });

    server.log.info(`FlowForge API server listening at ${address}`);
    server.log.info(`API Documentation available at ${address}/docs`);
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  server.log.info('Received SIGTERM, shutting down gracefully...');
  await server.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  server.log.info('Received SIGINT, shutting down gracefully...');
  await server.close();
  process.exit(0);
});

start();