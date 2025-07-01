import Fastify from 'fastify';

const server = Fastify({
  logger: true
});

// Health check
server.get('/health', async () => {
  return {
    status: 'ok',
    message: 'FlowForge API is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  };
});

// API status
server.get('/api/status', async () => {
  return {
    message: 'FlowForge API is working!',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    features: {
      authentication: true,
      workflows: true,
      aiAgents: false,
      integrations: false
    }
  };
});

// Demo workflows
server.get('/api/demo/workflows', async () => {
  return {
    success: true,
    data: [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Customer Onboarding Automation',
        description: 'Automated welcome email sequence with CRM integration',
        status: 'active',
        executionCount: 142,
        successRate: 0.96
      },
      {
        id: '987fcdeb-51d2-43a8-b456-426614174001',
        name: 'Lead Qualification Pipeline',
        description: 'AI-powered lead scoring with Slack notifications',
        status: 'active',
        executionCount: 89,
        successRate: 0.94
      }
    ]
  };
});

// Root endpoint
server.get('/', async () => {
  return {
    message: 'Welcome to FlowForge API',
    documentation: '/docs',
    health: '/health',
    status: '/api/status'
  };
});

// Start server
async function start() {
  try {
    await server.listen({ 
      port: 3001, 
      host: '0.0.0.0' 
    });
    console.log('🚀 FlowForge API Server running on http://localhost:3001');
    console.log('📊 Health check: http://localhost:3001/health');
    console.log('🔧 API status: http://localhost:3001/api/status');
    console.log('📋 Demo workflows: http://localhost:3001/api/demo/workflows');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();