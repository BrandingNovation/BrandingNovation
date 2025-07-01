import { FastifyInstance } from 'fastify';
import { z } from 'zod';

// Import shared types (we'll reference the shared package)
const WorkflowSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  workspaceId: z.string().uuid(),
  isActive: z.boolean().default(true),
  nodes: z.array(z.object({
    id: z.string(),
    type: z.string(),
    data: z.record(z.any()),
    position: z.object({
      x: z.number(),
      y: z.number(),
    }),
  })),
  edges: z.array(z.object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
    sourceHandle: z.string().optional(),
    targetHandle: z.string().optional(),
  })),
  metadata: z.object({
    version: z.string().default('1.0.0'),
    tags: z.array(z.string()).default([]),
    lastModified: z.string().datetime(),
    executionCount: z.number().default(0),
    averageExecutionTime: z.number().default(0),
  }),
});

const CreateWorkflowSchema = WorkflowSchema.omit({ id: true, metadata: true });
const UpdateWorkflowSchema = WorkflowSchema.partial().omit({ id: true });

export async function workflowRoutes(fastify: FastifyInstance) {
  // Get all workflows for a workspace
  fastify.get<{
    Querystring: { workspaceId: string; limit?: string; offset?: string }
  }>('/workflows', async (request, reply) => {
    const { workspaceId, limit = '50', offset = '0' } = request.query;
    
    try {
      // In a real implementation, this would query the database
      const workflows = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Customer Onboarding Flow',
          description: 'Automated customer onboarding with email sequences',
          workspaceId,
          isActive: true,
          nodes: [
            {
              id: 'trigger-1',
              type: 'trigger',
              data: { triggerType: 'webhook' },
              position: { x: 100, y: 100 }
            },
            {
              id: 'email-1',
              type: 'email',
              data: { template: 'welcome' },
              position: { x: 300, y: 100 }
            }
          ],
          edges: [
            {
              id: 'edge-1',
              source: 'trigger-1',
              target: 'email-1'
            }
          ],
          metadata: {
            version: '1.0.0',
            tags: ['onboarding', 'email'],
            lastModified: new Date().toISOString(),
            executionCount: 47,
            averageExecutionTime: 2340
          }
        }
      ];

      return {
        data: workflows,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: workflows.length
        }
      };
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch workflows' });
    }
  });

  // Get a specific workflow
  fastify.get<{
    Params: { workflowId: string }
  }>('/workflows/:workflowId', async (request, reply) => {
    const { workflowId } = request.params;

    try {
      // Mock workflow data
      const workflow = {
        id: workflowId,
        name: 'Customer Onboarding Flow',
        description: 'Automated customer onboarding with email sequences',
        workspaceId: '123e4567-e89b-12d3-a456-426614174001',
        isActive: true,
        nodes: [
          {
            id: 'trigger-1',
            type: 'trigger',
            data: { triggerType: 'webhook' },
            position: { x: 100, y: 100 }
          }
        ],
        edges: [],
        metadata: {
          version: '1.0.0',
          tags: ['onboarding'],
          lastModified: new Date().toISOString(),
          executionCount: 47,
          averageExecutionTime: 2340
        }
      };

      return { data: workflow };
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch workflow' });
    }
  });

  // Create a new workflow
  fastify.post<{
    Body: z.infer<typeof CreateWorkflowSchema>
  }>('/workflows', {
    schema: {
      body: CreateWorkflowSchema
    }
  }, async (request, reply) => {
    const workflowData = request.body;

    try {
      const newWorkflow = {
        id: crypto.randomUUID(),
        ...workflowData,
        metadata: {
          version: '1.0.0',
          tags: [],
          lastModified: new Date().toISOString(),
          executionCount: 0,
          averageExecutionTime: 0
        }
      };

      reply.code(201).send({ data: newWorkflow });
    } catch (error) {
      reply.code(500).send({ error: 'Failed to create workflow' });
    }
  });

  // Update a workflow
  fastify.put<{
    Params: { workflowId: string };
    Body: z.infer<typeof UpdateWorkflowSchema>
  }>('/workflows/:workflowId', {
    schema: {
      body: UpdateWorkflowSchema
    }
  }, async (request, reply) => {
    const { workflowId } = request.params;
    const updates = request.body;

    try {
      // In real implementation, update the database
      const updatedWorkflow = {
        id: workflowId,
        ...updates,
        metadata: {
          ...updates.metadata,
          lastModified: new Date().toISOString()
        }
      };

      return { data: updatedWorkflow };
    } catch (error) {
      reply.code(500).send({ error: 'Failed to update workflow' });
    }
  });

  // Delete a workflow
  fastify.delete<{
    Params: { workflowId: string }
  }>('/workflows/:workflowId', async (request, reply) => {
    const { workflowId } = request.params;

    try {
      // In real implementation, soft delete from database
      reply.code(204).send();
    } catch (error) {
      reply.code(500).send({ error: 'Failed to delete workflow' });
    }
  });

  // Execute a workflow
  fastify.post<{
    Params: { workflowId: string };
    Body: { input?: Record<string, any> }
  }>('/workflows/:workflowId/execute', async (request, reply) => {
    const { workflowId } = request.params;
    const { input = {} } = request.body;

    try {
      const executionId = crypto.randomUUID();
      
      // Mock execution response
      const execution = {
        id: executionId,
        workflowId,
        status: 'running',
        startedAt: new Date().toISOString(),
        input,
        steps: [
          {
            nodeId: 'trigger-1',
            status: 'completed',
            output: { message: 'Workflow triggered successfully' },
            executedAt: new Date().toISOString()
          }
        ]
      };

      return { data: execution };
    } catch (error) {
      reply.code(500).send({ error: 'Failed to execute workflow' });
    }
  });

  // Get workflow execution history
  fastify.get<{
    Params: { workflowId: string };
    Querystring: { limit?: string; offset?: string }
  }>('/workflows/:workflowId/executions', async (request, reply) => {
    const { workflowId } = request.params;
    const { limit = '20', offset = '0' } = request.query;

    try {
      const executions = [
        {
          id: crypto.randomUUID(),
          workflowId,
          status: 'completed',
          startedAt: new Date(Date.now() - 3600000).toISOString(),
          completedAt: new Date(Date.now() - 3590000).toISOString(),
          duration: 10000,
          input: { email: 'user@example.com' },
          output: { status: 'success', messagesSent: 3 }
        }
      ];

      return {
        data: executions,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: executions.length
        }
      };
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch executions' });
    }
  });
}