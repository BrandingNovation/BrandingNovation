// Application constants
export const APP_NAME = 'FlowForge';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'AI Workflow Automation Platform';

// Subscription limits
export const SUBSCRIPTION_LIMITS = {
  FREE: {
    maxWorkflows: 3,
    maxExecutionsPerMonth: 500,
    maxTeamMembers: 1,
    supportLevel: 'community',
  },
  PRO: {
    maxWorkflows: -1, // unlimited
    maxExecutionsPerMonth: 5000,
    maxTeamMembers: 5,
    supportLevel: 'email',
  },
  TEAM: {
    maxWorkflows: -1, // unlimited
    maxExecutionsPerMonth: 15000,
    maxTeamMembers: 25,
    supportLevel: 'priority',
  },
  ENTERPRISE: {
    maxWorkflows: -1, // unlimited
    maxExecutionsPerMonth: -1, // unlimited
    maxTeamMembers: -1, // unlimited
    supportLevel: 'dedicated',
  },
} as const;

// File upload limits
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 10,
  ALLOWED_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'text/plain',
    'application/json',
  ],
} as const;

// Workflow execution constants
export const WORKFLOW = {
  MAX_EXECUTION_TIME_MS: 300000, // 5 minutes
  MAX_RETRY_ATTEMPTS: 3,
  DEFAULT_RETRY_DELAY_MS: 1000,
  MAX_NODES_PER_WORKFLOW: 50,
  MAX_CONNECTIONS_PER_WORKFLOW: 100,
} as const;

// Rate limiting
export const RATE_LIMITS = {
  API: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 1000,
  },
  AUTH: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 5,
  },
  WEBHOOK: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX_REQUESTS: 100,
  },
} as const;

// AI model configurations
export const AI_MODELS = {
  OPENAI: {
    GPT_4: 'gpt-4',
    GPT_4_TURBO: 'gpt-4-1106-preview',
    GPT_3_5_TURBO: 'gpt-3.5-turbo',
  },
  ANTHROPIC: {
    CLAUDE_3_OPUS: 'claude-3-opus-20240229',
    CLAUDE_3_SONNET: 'claude-3-sonnet-20240229',
    CLAUDE_3_HAIKU: 'claude-3-haiku-20240307',
  },
  GOOGLE: {
    GEMINI_PRO: 'gemini-pro',
    GEMINI_PRO_VISION: 'gemini-pro-vision',
  },
} as const;

// Default AI agent configurations
export const DEFAULT_AI_CONFIG = {
  temperature: 0.7,
  maxTokens: 2048,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
} as const;

// Template categories
export const TEMPLATE_CATEGORIES = [
  'Marketing',
  'Sales',
  'Customer Support',
  'HR & Recruiting',
  'Finance & Accounting',
  'Operations',
  'Data Analysis',
  'Content Creation',
  'E-commerce',
  'Social Media',
  'Email Marketing',
  'Lead Generation',
  'Project Management',
  'Quality Assurance',
  'Compliance',
  'Other',
] as const;

// Integration service types
export const INTEGRATION_SERVICES = {
  COMMUNICATION: ['slack', 'discord', 'teams', 'telegram'],
  PRODUCTIVITY: ['google_workspace', 'microsoft_365', 'notion', 'airtable'],
  CRM: ['hubspot', 'salesforce', 'pipedrive', 'zoho_crm'],
  PAYMENT: ['stripe', 'paypal', 'square'],
  EMAIL: ['sendgrid', 'mailchimp', 'gmail', 'outlook'],
  STORAGE: ['google_drive', 'dropbox', 'onedrive', 's3'],
  ANALYTICS: ['google_analytics', 'mixpanel', 'amplitude'],
  SOCIAL_MEDIA: ['twitter', 'facebook', 'instagram', 'linkedin'],
  E_COMMERCE: ['shopify', 'woocommerce', 'magento'],
  PROJECT_MANAGEMENT: ['asana', 'trello', 'jira', 'monday'],
} as const;

// Webhook security
export const WEBHOOK = {
  MAX_PAYLOAD_SIZE: 1024 * 1024, // 1MB
  TIMEOUT_MS: 30000, // 30 seconds
  MAX_RETRIES: 3,
  RETRY_DELAYS_MS: [1000, 2000, 5000], // Exponential backoff
} as const;

// Error codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  WORKFLOW_EXECUTION_ERROR: 'WORKFLOW_EXECUTION_ERROR',
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
  INTEGRATION_ERROR: 'INTEGRATION_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;

// Status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;