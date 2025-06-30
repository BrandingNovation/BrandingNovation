import { z } from 'zod';

// Base node types
export enum NodeType {
  TRIGGER = 'trigger',
  AI_AGENT = 'ai_agent',
  INTEGRATION = 'integration',
  CONDITION = 'condition',
  ACTION = 'action',
  WEBHOOK = 'webhook',
}

// Trigger types
export enum TriggerType {
  MANUAL = 'manual',
  SCHEDULE = 'schedule',
  WEBHOOK = 'webhook',
  DATA_CHANGE = 'data_change',
}

// Execution status
export enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  TIMEOUT = 'timeout',
}

// Node position for canvas
export const NodePositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export type NodePosition = z.infer<typeof NodePositionSchema>;

// Base node schema
export const BaseNodeSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(NodeType),
  name: z.string(),
  description: z.string().optional(),
  position: NodePositionSchema,
  config: z.record(z.any()),
  inputs: z.array(z.string()).default([]),
  outputs: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

export type BaseNode = z.infer<typeof BaseNodeSchema>;

// Trigger node specific schema
export const TriggerNodeSchema = BaseNodeSchema.extend({
  type: z.literal(NodeType.TRIGGER),
  triggerType: z.nativeEnum(TriggerType),
  schedule: z.string().optional(), // Cron expression for scheduled triggers
  webhookConfig: z.object({
    secret: z.string().optional(),
    allowedMethods: z.array(z.string()).default(['POST']),
  }).optional(),
});

export type TriggerNode = z.infer<typeof TriggerNodeSchema>;

// AI Agent node schema
export const AIAgentNodeSchema = BaseNodeSchema.extend({
  type: z.literal(NodeType.AI_AGENT),
  agentType: z.string(), // content_generator, data_analyzer, decision_router
  model: z.string().default('gpt-4'),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().optional(),
  systemPrompt: z.string().optional(),
  inputMapping: z.record(z.string()),
  outputMapping: z.record(z.string()),
});

export type AIAgentNode = z.infer<typeof AIAgentNodeSchema>;

// Integration node schema
export const IntegrationNodeSchema = BaseNodeSchema.extend({
  type: z.literal(NodeType.INTEGRATION),
  service: z.string(), // google_sheets, slack, hubspot, etc.
  operation: z.string(), // read, write, send, etc.
  authentication: z.object({
    type: z.enum(['oauth2', 'api_key', 'basic']),
    connectionId: z.string(),
  }),
  operationConfig: z.record(z.any()),
});

export type IntegrationNode = z.infer<typeof IntegrationNodeSchema>;

// Condition node schema
export const ConditionNodeSchema = BaseNodeSchema.extend({
  type: z.literal(NodeType.CONDITION),
  conditions: z.array(z.object({
    field: z.string(),
    operator: z.enum(['equals', 'not_equals', 'contains', 'greater_than', 'less_than', 'is_empty', 'is_not_empty']),
    value: z.any(),
    logicalOperator: z.enum(['AND', 'OR']).optional(),
  })),
  defaultPath: z.string().optional(),
});

export type ConditionNode = z.infer<typeof ConditionNodeSchema>;

// Connection between nodes
export const ConnectionSchema = z.object({
  id: z.string(),
  sourceNodeId: z.string(),
  targetNodeId: z.string(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
  label: z.string().optional(),
});

export type Connection = z.infer<typeof ConnectionSchema>;

// Workflow schema
export const WorkflowSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  workspaceId: z.string(),
  createdBy: z.string(),
  isActive: z.boolean().default(true),
  isTemplate: z.boolean().default(false),
  templateCategory: z.string().optional(),
  nodes: z.array(z.union([
    TriggerNodeSchema,
    AIAgentNodeSchema,
    IntegrationNodeSchema,
    ConditionNodeSchema,
  ])),
  connections: z.array(ConnectionSchema),
  variables: z.record(z.any()).default({}),
  settings: z.object({
    timeout: z.number().default(300000), // 5 minutes in ms
    retryAttempts: z.number().default(3),
    retryDelay: z.number().default(1000),
  }).default({}),
  metadata: z.object({
    version: z.string().default('1.0.0'),
    tags: z.array(z.string()).default([]),
    lastModified: z.string().datetime(),
    executionCount: z.number().default(0),
    averageExecutionTime: z.number().default(0),
  }).default({}),
});

export type Workflow = z.infer<typeof WorkflowSchema>;

// Workflow execution schema
export const WorkflowExecutionSchema = z.object({
  id: z.string(),
  workflowId: z.string(),
  workspaceId: z.string(),
  status: z.nativeEnum(ExecutionStatus),
  triggeredBy: z.string(),
  triggerData: z.record(z.any()).default({}),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  duration: z.number().optional(), // in milliseconds
  nodeExecutions: z.array(z.object({
    nodeId: z.string(),
    status: z.nativeEnum(ExecutionStatus),
    startedAt: z.string().datetime(),
    completedAt: z.string().datetime().optional(),
    duration: z.number().optional(),
    input: z.record(z.any()).optional(),
    output: z.record(z.any()).optional(),
    error: z.string().optional(),
    retryCount: z.number().default(0),
  })),
  error: z.string().optional(),
  metadata: z.record(z.any()).default({}),
});

export type WorkflowExecution = z.infer<typeof WorkflowExecutionSchema>;

// Workflow template schema for the marketplace
export const WorkflowTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  tags: z.array(z.string()),
  author: z.string(),
  version: z.string(),
  workflow: WorkflowSchema.omit({ id: true, workspaceId: true, createdBy: true }),
  usageCount: z.number().default(0),
  rating: z.number().min(0).max(5).default(0),
  reviews: z.array(z.object({
    userId: z.string(),
    rating: z.number().min(1).max(5),
    comment: z.string().optional(),
    createdAt: z.string().datetime(),
  })).default([]),
  isPublic: z.boolean().default(false),
  isVerified: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type WorkflowTemplate = z.infer<typeof WorkflowTemplateSchema>;