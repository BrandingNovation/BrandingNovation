import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';

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
await server.register(cors, {
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
});

await server.register(jwt, {
  secret: 'development-secret-key',
});

// Health check endpoint
server.get('/health', async () => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    message: 'FlowForge API is running!',
  };
});

// Simple demo API endpoints
server.get('/api/demo', async () => {
  return {
    message: 'Welcome to FlowForge API!',
    features: [
      'AI Workflow Automation',
      'Visual Workflow Builder', 
      'Third-party Integrations',
      'Template Marketplace'
    ],
  };
});

// Auth endpoints (simplified)
server.post('/api/auth/login', async (request, reply) => {
  const token = server.jwt.sign({ 
    userId: 'demo-user',
    email: 'demo@flowforge.ai' 
  });
  
  reply.send({
    access_token: token,
    user: {
      id: 'demo-user',
      email: 'demo@flowforge.ai',
      firstName: 'Demo',
      lastName: 'User',
    },
  });
});

server.get('/api/workflows', async () => {
  return {
    workflows: [
      {
        id: 'demo-workflow-1',
        name: 'Customer Onboarding',
        description: 'Automated customer onboarding process',
        status: 'active',
        nodes: 5,
        executions: 142,
      },
      {
        id: 'demo-workflow-2', 
        name: 'Lead Scoring',
        description: 'AI-powered lead qualification',
        status: 'active',
        nodes: 8,
        executions: 89,
      }
    ],
  };
});

server.get('/api/templates', async () => {
  return {
    templates: [
      {
        id: 'template-1',
        name: 'Email Marketing Automation',
        category: 'Marketing',
        description: 'Automated email campaigns with AI personalization',
        rating: 4.8,
        usageCount: 1250,
      },
      {
        id: 'template-2',
        name: 'Invoice Processing',
        category: 'Finance',
        description: 'Automated invoice extraction and approval workflow',
        rating: 4.9,
        usageCount: 890,
      }
    ],
  };
});

// Start server
async function start() {
  try {
    const address = await server.listen({
      port: 3002,
      host: '0.0.0.0',
    });

    server.log.info(`🚀 FlowForge API server listening at ${address}`);
    server.log.info(`📊 Health check: ${address}/health`);
    server.log.info(`🧪 Demo API: ${address}/api/demo`);
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
}

start();