import { FastifyInstance } from 'fastify';

export async function integrationRoutes(fastify: FastifyInstance) {
  // Get available integrations
  fastify.get('/available', async (request, reply) => {
    reply.send({
      integrations: [
        { id: 'google-sheets', name: 'Google Sheets', category: 'productivity' },
        { id: 'slack', name: 'Slack', category: 'communication' },
        { id: 'hubspot', name: 'HubSpot', category: 'crm' },
        { id: 'salesforce', name: 'Salesforce', category: 'crm' },
      ],
    });
  });

  // Get user's connected integrations
  fastify.get('/connected', {
    preHandler: [(fastify as any).authenticate],
  }, async (request, reply) => {
    // TODO: Fetch user's connected integrations
    reply.send({
      integrations: [],
    });
  });

  // Connect to an integration
  fastify.post('/connect/:serviceId', {
    preHandler: [(fastify as any).authenticate],
  }, async (request, reply) => {
    const { serviceId } = request.params as { serviceId: string };
    
    // TODO: Implement OAuth flow for the service
    reply.send({
      authUrl: `https://auth.example.com/${serviceId}`,
      message: 'Redirect to authorization URL',
    });
  });

  // Handle OAuth callback
  fastify.post('/callback/:serviceId', {
    preHandler: [(fastify as any).authenticate],
  }, async (request, reply) => {
    const { serviceId } = request.params as { serviceId: string };
    
    // TODO: Handle OAuth callback and store tokens
    reply.send({
      message: 'Integration connected successfully',
      connectionId: 'new-connection-id',
    });
  });

  // Disconnect an integration
  fastify.delete('/disconnect/:connectionId', {
    preHandler: [(fastify as any).authenticate],
  }, async (request, reply) => {
    const { connectionId } = request.params as { connectionId: string };
    
    // TODO: Remove connection from database
    reply.send({
      message: 'Integration disconnected successfully',
    });
  });
}