// Demo API client for cloud deployment - simulates backend functionality
// This allows FlowForge to work perfectly without requiring a live backend

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'draft';
  nodes: any[];
  edges: any[];
  createdAt: string;
  updatedAt: string;
  executions: number;
  successRate: number;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  steps: Array<{
    id: string;
    name: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    duration?: number;
    output?: any;
  }>;
}

// Mock data for demonstration
const DEMO_WORKFLOWS: Workflow[] = [
  {
    id: '1',
    name: 'Customer Onboarding',
    description: 'Automated customer onboarding with welcome emails and CRM integration',
    status: 'active',
    nodes: [],
    edges: [],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z',
    executions: 1247,
    successRate: 98.2,
  },
  {
    id: '2',
    name: 'Order Processing',
    description: 'Complete order processing from payment to shipping',
    status: 'active',
    nodes: [],
    edges: [],
    createdAt: '2024-01-18T09:15:00Z',
    updatedAt: '2024-01-22T11:45:00Z',
    executions: 892,
    successRate: 97.1,
  },
  {
    id: '3',
    name: 'Lead Qualification',
    description: 'AI-powered lead scoring and routing system',
    status: 'active',
    nodes: [],
    edges: [],
    createdAt: '2024-01-20T14:20:00Z',
    updatedAt: '2024-01-23T16:10:00Z',
    executions: 654,
    successRate: 95.8,
  },
  {
    id: '4',
    name: 'Content Approval',
    description: 'Automated content review and approval workflow',
    status: 'draft',
    nodes: [],
    edges: [],
    createdAt: '2024-01-22T13:30:00Z',
    updatedAt: '2024-01-23T10:15:00Z',
    executions: 0,
    successRate: 0,
  },
];

const DEMO_EXECUTIONS: WorkflowExecution[] = [
  {
    id: '1',
    workflowId: '1',
    status: 'completed',
    startTime: '2024-01-23T10:00:00Z',
    endTime: '2024-01-23T10:02:30Z',
    steps: [
      { id: '1', name: 'Trigger: New Customer', status: 'completed', duration: 0.1 },
      { id: '2', name: 'Send Welcome Email', status: 'completed', duration: 1.2 },
      { id: '3', name: 'Wait 24 Hours', status: 'completed', duration: 0.1 },
      { id: '4', name: 'Check Email Opened', status: 'completed', duration: 0.5 },
      { id: '5', name: 'Add to CRM', status: 'completed', duration: 0.8 },
    ],
  },
  {
    id: '2',
    workflowId: '2',
    status: 'running',
    startTime: '2024-01-23T10:15:00Z',
    steps: [
      { id: '1', name: 'New Order Received', status: 'completed', duration: 0.1 },
      { id: '2', name: 'Validate Payment', status: 'completed', duration: 2.1 },
      { id: '3', name: 'Update Inventory', status: 'running' },
      { id: '4', name: 'Send Confirmation', status: 'pending' },
      { id: '5', name: 'Create Shipping Label', status: 'pending' },
    ],
  },
];

// Simulate API delays for realism
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class DemoApiClient {
  private baseUrl = '/api';
  
  async getWorkflows(): Promise<{ workflows: Workflow[] }> {
    await delay(300); // Simulate network delay
    return { workflows: [...DEMO_WORKFLOWS] };
  }

  async getWorkflow(id: string): Promise<{ workflow: Workflow }> {
    await delay(200);
    const workflow = DEMO_WORKFLOWS.find(w => w.id === id);
    if (!workflow) {
      throw new Error('Workflow not found');
    }
    return { workflow: { ...workflow } };
  }

  async createWorkflow(data: Partial<Workflow>): Promise<{ workflow: Workflow }> {
    await delay(500);
    const newWorkflow: Workflow = {
      id: (DEMO_WORKFLOWS.length + 1).toString(),
      name: data.name || 'New Workflow',
      description: data.description || 'A new automated workflow',
      status: 'draft',
      nodes: data.nodes || [],
      edges: data.edges || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      executions: 0,
      successRate: 0,
    };
    DEMO_WORKFLOWS.push(newWorkflow);
    return { workflow: newWorkflow };
  }

  async updateWorkflow(id: string, data: Partial<Workflow>): Promise<{ workflow: Workflow }> {
    await delay(400);
    const workflowIndex = DEMO_WORKFLOWS.findIndex(w => w.id === id);
    if (workflowIndex === -1) {
      throw new Error('Workflow not found');
    }
    
    DEMO_WORKFLOWS[workflowIndex] = {
      ...DEMO_WORKFLOWS[workflowIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    return { workflow: DEMO_WORKFLOWS[workflowIndex] };
  }

  async deleteWorkflow(id: string): Promise<{ success: boolean }> {
    await delay(300);
    const workflowIndex = DEMO_WORKFLOWS.findIndex(w => w.id === id);
    if (workflowIndex === -1) {
      throw new Error('Workflow not found');
    }
    DEMO_WORKFLOWS.splice(workflowIndex, 1);
    return { success: true };
  }

  async executeWorkflow(id: string): Promise<{ execution: WorkflowExecution }> {
    await delay(200);
    const workflow = DEMO_WORKFLOWS.find(w => w.id === id);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    const execution: WorkflowExecution = {
      id: (DEMO_EXECUTIONS.length + 1).toString(),
      workflowId: id,
      status: 'running',
      startTime: new Date().toISOString(),
      steps: [
        { id: '1', name: 'Starting workflow...', status: 'running' },
      ],
    };

    DEMO_EXECUTIONS.push(execution);
    
    // Simulate execution progress
    setTimeout(() => {
      execution.status = 'completed';
      execution.endTime = new Date().toISOString();
      execution.steps = [
        { id: '1', name: 'Workflow started', status: 'completed', duration: 0.1 },
        { id: '2', name: 'Processing nodes', status: 'completed', duration: 1.5 },
        { id: '3', name: 'Workflow completed', status: 'completed', duration: 0.2 },
      ];
    }, 3000);

    return { execution };
  }

  async getWorkflowExecutions(workflowId: string): Promise<{ executions: WorkflowExecution[] }> {
    await delay(250);
    const executions = DEMO_EXECUTIONS.filter(e => e.workflowId === workflowId);
    return { executions };
  }

  async getExecution(id: string): Promise<{ execution: WorkflowExecution }> {
    await delay(150);
    const execution = DEMO_EXECUTIONS.find(e => e.id === id);
    if (!execution) {
      throw new Error('Execution not found');
    }
    return { execution: { ...execution } };
  }

  // AI Workflow Generation
  async generateWorkflow(prompt: string): Promise<{ workflow: any }> {
    await delay(2000); // Simulate AI processing
    
    // Simple keyword-based workflow generation
    const isOnboarding = prompt.toLowerCase().includes('onboarding') || prompt.toLowerCase().includes('welcome');
    const isOrder = prompt.toLowerCase().includes('order') || prompt.toLowerCase().includes('payment');
    const isLead = prompt.toLowerCase().includes('lead') || prompt.toLowerCase().includes('qualify');
    
    let generatedWorkflow;
    
    if (isOnboarding) {
      generatedWorkflow = {
        name: 'Customer Onboarding Workflow',
        description: 'Automated customer onboarding with email sequences and CRM integration',
        nodes: [
          { id: '1', type: 'trigger', label: 'New Customer Signup', position: { x: 100, y: 100 } },
          { id: '2', type: 'email', label: 'Welcome Email', position: { x: 350, y: 100 } },
          { id: '3', type: 'delay', label: 'Wait 24 Hours', position: { x: 600, y: 100 } },
          { id: '4', type: 'condition', label: 'Email Opened?', position: { x: 850, y: 100 } },
          { id: '5', type: 'crm', label: 'Add to CRM', position: { x: 1100, y: 50 } },
        ],
        edges: [
          { id: 'e1-2', source: '1', target: '2' },
          { id: 'e2-3', source: '2', target: '3' },
          { id: 'e3-4', source: '3', target: '4' },
          { id: 'e4-5', source: '4', target: '5' },
        ],
        estimatedExecutionTime: '24-48 hours',
        complexity: 'medium',
      };
    } else if (isOrder) {
      generatedWorkflow = {
        name: 'Order Processing Workflow',
        description: 'Complete order processing from payment to shipping',
        nodes: [
          { id: '1', type: 'trigger', label: 'New Order', position: { x: 100, y: 100 } },
          { id: '2', type: 'apiCall', label: 'Validate Payment', position: { x: 350, y: 100 } },
          { id: '3', type: 'database', label: 'Update Inventory', position: { x: 600, y: 100 } },
          { id: '4', type: 'email', label: 'Order Confirmation', position: { x: 850, y: 100 } },
        ],
        edges: [
          { id: 'e1-2', source: '1', target: '2' },
          { id: 'e2-3', source: '2', target: '3' },
          { id: 'e3-4', source: '3', target: '4' },
        ],
        estimatedExecutionTime: '5-10 minutes',
        complexity: 'medium',
      };
    } else {
      generatedWorkflow = {
        name: 'Custom Workflow',
        description: 'Generated workflow based on your description',
        nodes: [
          { id: '1', type: 'trigger', label: 'Start Trigger', position: { x: 100, y: 100 } },
          { id: '2', type: 'aiReasoning', label: 'Process with AI', position: { x: 350, y: 100 } },
          { id: '3', type: 'email', label: 'Send Notification', position: { x: 600, y: 100 } },
        ],
        edges: [
          { id: 'e1-2', source: '1', target: '2' },
          { id: 'e2-3', source: '2', target: '3' },
        ],
        estimatedExecutionTime: '5-15 minutes',
        complexity: 'simple',
      };
    }

    return { workflow: generatedWorkflow };
  }

  // Analytics
  async getAnalytics(): Promise<any> {
    await delay(400);
    return {
      totalWorkflows: 47,
      activeWorkflows: 23,
      totalExecutions: 12847,
      successRate: 96.8,
      avgExecutionTime: 2.4,
      executionsToday: 234,
      topPerformingWorkflows: [
        { id: '1', name: 'Customer Onboarding', executions: 1247, successRate: 98.2, avgTime: 1.8 },
        { id: '2', name: 'Order Processing', executions: 892, successRate: 97.1, avgTime: 3.2 },
        { id: '3', name: 'Lead Qualification', executions: 654, successRate: 95.8, avgTime: 4.1 },
      ],
      recentActivity: [
        { id: '1', workflow: 'Customer Onboarding', action: 'Execution completed', timestamp: '2 minutes ago', status: 'success' },
        { id: '2', workflow: 'Order Processing', action: 'Execution started', timestamp: '5 minutes ago', status: 'running' },
        { id: '3', workflow: 'Lead Qualification', action: 'Execution failed', timestamp: '8 minutes ago', status: 'failed' },
      ],
      performanceMetrics: {
        cpu: 34,
        memory: 67,
        throughput: 47,
        errorRate: 3.2,
      },
      trends: {
        labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
        executionsData: [12, 8, 15, 34, 42, 28, 16],
        successData: [98.1, 97.8, 96.9, 97.2, 96.5, 97.8, 98.2],
      }
    };
  }
}

// Export singleton instance
export const demoApi = new DemoApiClient();