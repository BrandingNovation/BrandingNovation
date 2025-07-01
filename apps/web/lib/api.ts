import { z } from 'zod';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// API Response Types
interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

interface WorkflowData {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  tags: string[];
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface WorkflowVersion {
  id: string;
  workflow_id: string;
  version_number: number;
  definition: object;
  changelog?: string;
  created_at: string;
  created_by: string;
}

interface WorkflowExecution {
  id: string;
  workflow_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  trigger_data?: object;
  execution_data?: object;
  error_message?: string;
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
}

// API Client Class
export class FlowForgeAPI {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Health Check
  async checkHealth() {
    return this.request('/health');
  }

  // Workflow Management
  async getWorkflows(params?: {
    limit?: number;
    offset?: number;
    status?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    if (params?.status) searchParams.set('status', params.status);

    const query = searchParams.toString();
    return this.request<{ workflows: WorkflowData[]; total: number }>(
      `/api/workflows${query ? `?${query}` : ''}`
    );
  }

  async createWorkflow(workflow: {
    name: string;
    description?: string;
    status?: 'draft' | 'active' | 'paused' | 'archived';
  }) {
    return this.request<WorkflowData>('/api/workflows', {
      method: 'POST',
      body: JSON.stringify(workflow),
    });
  }

  async getWorkflow(id: string) {
    return this.request<WorkflowData & { latest_version?: WorkflowVersion }>(
      `/api/workflows/${id}`
    );
  }

  async updateWorkflow(
    id: string,
    updates: {
      name?: string;
      description?: string;
      status?: 'draft' | 'active' | 'paused' | 'archived';
    }
  ) {
    return this.request<WorkflowData>(`/api/workflows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteWorkflow(id: string) {
    return this.request(`/api/workflows/${id}`, {
      method: 'DELETE',
    });
  }

  // Workflow Versions
  async saveWorkflowVersion(
    workflowId: string,
    definition: object,
    changelog?: string
  ) {
    return this.request<WorkflowVersion>(`/api/workflows/${workflowId}/versions`, {
      method: 'POST',
      body: JSON.stringify({ definition, changelog }),
    });
  }

  // Workflow Execution
  async executeWorkflow(workflowId: string, triggerData?: object) {
    return this.request<WorkflowExecution>(`/api/workflows/${workflowId}/execute`, {
      method: 'POST',
      body: JSON.stringify({ triggerData }),
    });
  }

  async getWorkflowExecutions(
    workflowId: string,
    params?: {
      limit?: number;
      offset?: number;
      status?: string;
    }
  ) {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    if (params?.status) searchParams.set('status', params.status);

    const query = searchParams.toString();
    return this.request<{ executions: WorkflowExecution[]; total: number }>(
      `/api/workflows/${workflowId}/executions${query ? `?${query}` : ''}`
    );
  }

  // Demo endpoints
  async getDemoWorkflows() {
    return this.request('/api/demo/workflows');
  }

  async getApiStatus() {
    return this.request('/api/status');
  }
}

// Create singleton instance
export const api = new FlowForgeAPI();

// React Hook for API calls
export function useAPI() {
  return api;
}

// Utility functions for common operations
export const workflowUtils = {
  async saveWorkflowFromBuilder(
    workflowId: string,
    nodes: any[],
    edges: any[],
    changelog?: string
  ) {
    const definition = {
      nodes,
      edges,
      metadata: {
        nodeCount: nodes.length,
        edgeCount: edges.length,
        lastSaved: new Date().toISOString(),
      },
    };

    return api.saveWorkflowVersion(workflowId, definition, changelog);
  },

  async createWorkflowFromBuilder(name: string, description?: string) {
    return api.createWorkflow({
      name,
      description,
      status: 'draft',
    });
  },

  formatExecutionDuration(durationMs?: number): string {
    if (!durationMs) return '0ms';
    
    if (durationMs < 1000) return `${durationMs}ms`;
    if (durationMs < 60000) return `${(durationMs / 1000).toFixed(1)}s`;
    return `${(durationMs / 60000).toFixed(1)}m`;
  },

  getStatusColor(status: string): string {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-red-100 text-red-800',
      pending: 'bg-blue-100 text-blue-800',
      running: 'bg-indigo-100 text-indigo-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  },
};

// Type exports for use in components
export type {
  WorkflowData,
  WorkflowVersion,
  WorkflowExecution,
  ApiResponse,
};