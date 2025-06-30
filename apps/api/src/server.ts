import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';

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

// Register essential plugins
await server.register(helmet, {
  contentSecurityPolicy: false,
});

await server.register(cors, {
  origin: true,
  credentials: true,
});

// Health check endpoint
server.get('/health', async () => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'FlowForge API',
  };
});

// API routes
server.get('/api/status', async () => {
  return {
    message: 'FlowForge API is running!',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  };
});

// Start server
async function start() {
  try {
    const address = await server.listen({
      port: Number(process.env.API_PORT) || 3001,
      host: '0.0.0.0',
    });

    server.log.info(`🚀 FlowForge API server listening at ${address}`);
    server.log.info(`📚 Health check available at ${address}/health`);
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