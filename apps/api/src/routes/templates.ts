import { FastifyInstance } from 'fastify';

export async function templateRoutes(fastify: FastifyInstance) {
  // Get public workflow templates
  fastify.get('/public', async (request, reply) => {
    reply.send({
      templates: [],
      categories: ['productivity', 'marketing', 'sales', 'support'],
    });
  });

  // Get template by ID
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    // TODO: Fetch template from database
    reply.send({
      id,
      name: 'Sample Template',
      description: 'A sample workflow template',
      workflow: {},
    });
  });

  // Create template from workflow
  fastify.post('/', {
    preHandler: [(fastify as any).authenticate],
  }, async (request, reply) => {
    // TODO: Create template from existing workflow
    reply.code(201).send({
      id: 'new-template-id',
      message: 'Template created successfully',
    });
  });

  // Use template to create workflow
  fastify.post('/:id/use', {
    preHandler: [(fastify as any).authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    
    // TODO: Create workflow from template
    reply.send({
      workflowId: 'new-workflow-id',
      message: 'Workflow created from template',
    });
  });
}