import { getRedisClient } from '../database/connection.js';
import { WorkflowRepository } from '../repositories/WorkflowRepository.js';

interface WorkflowNode {
  id: string;
  type: string;
  data: {
    label: string;
    type?: string;
    [key: string]: any;
  };
  position: { x: number; y: number };
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  label?: string;
}

interface ExecutionContext {
  workflowId: string;
  executionId: string;
  data: Record<string, any>;
  currentNodeId?: string;
}

export class WorkflowEngine {
  private workflowRepo: WorkflowRepository;
  private redis;

  constructor() {
    this.workflowRepo = new WorkflowRepository();
    this.redis = getRedisClient();
  }

  async executeWorkflow(
    workflowId: string,
    executionId: string,
    triggerData?: object
  ): Promise<void> {
    console.log(`Starting workflow execution: ${executionId} for workflow: ${workflowId}`);

    try {
      // Update execution status to running
      await this.workflowRepo.updateExecutionStatus(executionId, 'running');

      // Get workflow definition
      const workflow = await this.workflowRepo.getWorkflowById(workflowId);
      if (!workflow) {
        throw new Error('Workflow not found');
      }

      const latestVersion = await this.workflowRepo.getLatestWorkflowVersion(workflowId);
      if (!latestVersion) {
        throw new Error('No workflow version found');
      }

      const definition = latestVersion.definition as { nodes: WorkflowNode[]; edges: WorkflowEdge[] };
      if (!definition.nodes || !definition.edges) {
        throw new Error('Invalid workflow definition');
      }

      // Initialize execution context
      const context: ExecutionContext = {
        workflowId,
        executionId,
        data: triggerData ? { ...triggerData } : {},
      };

      // Store execution context in Redis for monitoring
      await this.redis.setex(`workflow_execution:${executionId}`, 3600, JSON.stringify(context));

      // Find trigger nodes (starting points)
      const triggerNodes = definition.nodes.filter(node => node.type === 'trigger');
      if (triggerNodes.length === 0) {
        throw new Error('No trigger nodes found in workflow');
      }

      // Execute from each trigger node
      const results: Array<{ nodeId: string; success: boolean; error?: string }> = [];

      for (const triggerNode of triggerNodes) {
        try {
          await this.executeFromNode(triggerNode, definition, context);
          results.push({ nodeId: triggerNode.id, success: true });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          results.push({ nodeId: triggerNode.id, success: false, error: errorMessage });
          console.error(`Error executing from trigger node ${triggerNode.id}:`, error);
        }
      }

      // Check if all executions were successful
      const allSuccessful = results.every(r => r.success);
      const status = allSuccessful ? 'completed' : 'failed';
      const errorMessage = allSuccessful 
        ? undefined 
        : `Some nodes failed: ${results.filter(r => !r.success).map(r => r.error).join(', ')}`;

      await this.workflowRepo.updateExecutionStatus(
        executionId,
        status,
        errorMessage,
        { results, finalData: context.data }
      );

      console.log(`Workflow execution ${executionId} completed with status: ${status}`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Workflow execution ${executionId} failed:`, error);
      
      await this.workflowRepo.updateExecutionStatus(
        executionId,
        'failed',
        errorMessage
      );
    }
  }

  private async executeFromNode(
    startNode: WorkflowNode,
    definition: { nodes: WorkflowNode[]; edges: WorkflowEdge[] },
    context: ExecutionContext
  ): Promise<void> {
    const visited = new Set<string>();
    const queue = [startNode];

    while (queue.length > 0) {
      const node = queue.shift()!;
      
      if (visited.has(node.id)) {
        continue; // Avoid infinite loops
      }
      visited.add(node.id);

      context.currentNodeId = node.id;

      console.log(`Executing node: ${node.id} (${node.type})`);

      // Execute the node
      try {
        const result = await this.executeNode(node, context);
        context.data[`node_${node.id}`] = result;

        // Find next nodes to execute
        const outgoingEdges = definition.edges.filter(edge => edge.source === node.id);
        
        for (const edge of outgoingEdges) {
          const nextNode = definition.nodes.find(n => n.id === edge.target);
          if (nextNode) {
            // For condition nodes, check if we should follow this edge
            if (node.type === 'condition') {
              if (this.shouldFollowEdge(edge, result, context)) {
                queue.push(nextNode);
              }
            } else {
              queue.push(nextNode);
            }
          }
        }

      } catch (error) {
        console.error(`Error executing node ${node.id}:`, error);
        throw error;
      }
    }
  }

  private async executeNode(node: WorkflowNode, context: ExecutionContext): Promise<any> {
    const { type, data } = node;

    switch (type) {
      case 'trigger':
        return this.executeTriggerNode(node, context);
      
      case 'email':
        return this.executeEmailNode(node, context);
      
      case 'delay':
        return this.executeDelayNode(node, context);
      
      case 'condition':
        return this.executeConditionNode(node, context);
      
      case 'crm':
        return this.executeCRMNode(node, context);
      
      case 'aiAgent':
        return this.executeAIAgentNode(node, context);
      
      default:
        console.warn(`Unknown node type: ${type}`);
        return { status: 'skipped', message: `Unknown node type: ${type}` };
    }
  }

  private async executeTriggerNode(node: WorkflowNode, context: ExecutionContext): Promise<any> {
    // Trigger nodes just pass through the data
    return {
      status: 'completed',
      triggerType: node.data.type || 'webhook',
      message: 'Trigger node executed',
      timestamp: new Date().toISOString()
    };
  }

  private async executeEmailNode(node: WorkflowNode, context: ExecutionContext): Promise<any> {
    // Simulate email sending
    const emailData = {
      to: context.data.email || 'user@example.com',
      subject: `Email from ${node.data.label}`,
      template: node.data.template || 'default',
    };

    // In a real implementation, this would integrate with an email service
    console.log(`Sending email:`, emailData);

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      status: 'completed',
      message: 'Email sent successfully',
      emailData,
      timestamp: new Date().toISOString()
    };
  }

  private async executeDelayNode(node: WorkflowNode, context: ExecutionContext): Promise<any> {
    const delayMs = this.parseDelay(node.data.label);
    
    console.log(`Delaying for ${delayMs}ms`);
    await new Promise(resolve => setTimeout(resolve, delayMs));

    return {
      status: 'completed',
      message: `Delayed for ${delayMs}ms`,
      delayMs,
      timestamp: new Date().toISOString()
    };
  }

  private async executeConditionNode(node: WorkflowNode, context: ExecutionContext): Promise<any> {
    // Simple condition evaluation
    const condition = node.data.condition || 'email_opened';
    let result = false;

    switch (condition) {
      case 'email_opened':
        // Simulate 70% chance of email being opened
        result = Math.random() > 0.3;
        break;
      case 'user_active':
        result = context.data.userStatus === 'active';
        break;
      default:
        result = true; // Default to true for unknown conditions
    }

    return {
      status: 'completed',
      condition,
      result,
      message: `Condition "${condition}" evaluated to ${result}`,
      timestamp: new Date().toISOString()
    };
  }

  private async executeCRMNode(node: WorkflowNode, context: ExecutionContext): Promise<any> {
    // Simulate CRM integration
    const crmData = {
      action: 'create_contact',
      contactData: {
        email: context.data.email || 'user@example.com',
        name: context.data.name || 'Unknown User',
        source: 'workflow_automation',
      },
      system: node.data.system || 'hubspot'
    };

    console.log(`CRM action:`, crmData);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    return {
      status: 'completed',
      message: 'CRM record created successfully',
      crmData,
      timestamp: new Date().toISOString()
    };
  }

  private async executeAIAgentNode(node: WorkflowNode, context: ExecutionContext): Promise<any> {
    // Simulate AI agent processing
    const agentType = node.data.agentType || 'content_generator';
    
    let result;
    switch (agentType) {
      case 'content_generator':
        result = {
          generatedContent: 'This is AI-generated content for the user.',
          contentType: 'email_body',
          wordCount: 42
        };
        break;
      case 'data_analyzer':
        result = {
          analysis: 'User engagement score: 85/100',
          insights: ['High email open rate', 'Active user profile'],
          score: 85
        };
        break;
      case 'decision_router':
        result = {
          decision: 'route_to_sales',
          confidence: 0.92,
          reasoning: 'High engagement score and recent activity'
        };
        break;
      default:
        result = { message: 'AI processing completed' };
    }

    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1500));

    return {
      status: 'completed',
      agentType,
      result,
      message: `AI agent ${agentType} completed processing`,
      timestamp: new Date().toISOString()
    };
  }

  private shouldFollowEdge(edge: WorkflowEdge, nodeResult: any, context: ExecutionContext): boolean {
    // For condition nodes, check the edge label against the result
    if (edge.label === 'Yes' || edge.label === 'True') {
      return nodeResult.result === true;
    } else if (edge.label === 'No' || edge.label === 'False') {
      return nodeResult.result === false;
    }
    
    // Default to following the edge
    return true;
  }

  private parseDelay(delayString: string): number {
    // Parse delay strings like "Wait 24h", "5m", "30s"
    const match = delayString.match(/(\d+)\s*(h|m|s|hour|minute|second)/i);
    if (!match) {
      return 1000; // Default 1 second
    }

    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    switch (unit) {
      case 'h':
      case 'hour':
        return value * 60 * 60 * 1000;
      case 'm':
      case 'minute':
        return value * 60 * 1000;
      case 's':
      case 'second':
      default:
        return value * 1000;
    }
  }

  // Queue a workflow for background execution
  async queueWorkflowExecution(workflowId: string, executionId: string, triggerData?: object): Promise<void> {
    const job = {
      workflowId,
      executionId,
      triggerData,
      queuedAt: new Date().toISOString()
    };

    // In a production environment, you'd use a proper job queue like Bull or Bee-Queue
    // For now, we'll execute immediately in the background
    setTimeout(() => {
      this.executeWorkflow(workflowId, executionId, triggerData);
    }, 100);

    console.log(`Queued workflow execution: ${executionId}`);
  }

  // Get execution status from Redis
  async getExecutionContext(executionId: string): Promise<ExecutionContext | null> {
    try {
      const data = await this.redis.get(`workflow_execution:${executionId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting execution context:', error);
      return null;
    }
  }

  // Clean up completed executions
  async cleanupExecution(executionId: string): Promise<void> {
    try {
      await this.redis.del(`workflow_execution:${executionId}`);
    } catch (error) {
      console.error('Error cleaning up execution:', error);
    }
  }
}