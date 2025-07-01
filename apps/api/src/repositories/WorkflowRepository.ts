import { PoolClient } from 'pg';
import { getPostgresClient, withTransaction } from '../database/connection.js';
import { z } from 'zod';

// Temporary workflow schema until shared package is properly linked
const WorkflowSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  status: z.enum(['draft', 'active', 'paused', 'archived']).optional(),
  metadata: z.object({
    tags: z.array(z.string()).optional()
  }).optional()
});

// Database entity types (matching our SQL schema)
interface DbWorkflow {
  id: string;
  name: string;
  description: string | null;
  organization_id: string | null;
  created_by: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  is_template: boolean;
  template_category: string | null;
  tags: string[];
  created_at: Date;
  updated_at: Date;
  published_at: Date | null;
}

interface DbWorkflowVersion {
  id: string;
  workflow_id: string;
  version_number: number;
  definition: object;
  changelog: string | null;
  created_by: string;
  created_at: Date;
}

interface DbWorkflowExecution {
  id: string;
  workflow_id: string;
  workflow_version_id: string | null;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  trigger_data: object | null;
  execution_data: object | null;
  error_message: string | null;
  started_at: Date;
  completed_at: Date | null;
  duration_ms: number | null;
}

export class WorkflowRepository {
  // Create a new workflow
  async createWorkflow(
    workflow: z.infer<typeof WorkflowSchema>,
    userId: string,
    organizationId?: string
  ): Promise<DbWorkflow> {
    const client = await getPostgresClient();
    
    try {
      const result = await client.query(
        `INSERT INTO workflows (name, description, organization_id, created_by, status, tags)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          workflow.name,
          workflow.description || null,
          organizationId || null,
          userId,
          workflow.status || 'draft',
          workflow.metadata?.tags || []
        ]
      );

      return result.rows[0] as DbWorkflow;
    } finally {
      client.release();
    }
  }

  // Create a workflow version
  async createWorkflowVersion(
    workflowId: string,
    definition: object,
    userId: string,
    changelog?: string
  ): Promise<DbWorkflowVersion> {
    const client = await getPostgresClient();

    try {
      // Get the next version number
      const versionResult = await client.query(
        'SELECT COALESCE(MAX(version_number), 0) + 1 as next_version FROM workflow_versions WHERE workflow_id = $1',
        [workflowId]
      );
      
      const nextVersion = versionResult.rows[0].next_version;

      const result = await client.query(
        `INSERT INTO workflow_versions (workflow_id, version_number, definition, changelog, created_by)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [workflowId, nextVersion, JSON.stringify(definition), changelog || null, userId]
      );

      return result.rows[0] as DbWorkflowVersion;
    } finally {
      client.release();
    }
  }

  // Get workflow by ID
  async getWorkflowById(id: string, userId?: string): Promise<DbWorkflow | null> {
    const client = await getPostgresClient();

    try {
      let query = 'SELECT * FROM workflows WHERE id = $1';
      const params = [id];

      // Add user/org filtering if needed
      if (userId) {
        query += ' AND (created_by = $2 OR organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = $2))';
        params.push(userId);
      }

      const result = await client.query(query, params);
      return result.rows[0] as DbWorkflow || null;
    } finally {
      client.release();
    }
  }

  // Get workflows for a user
  async getWorkflowsForUser(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      status?: string;
      organizationId?: string;
    } = {}
  ): Promise<{ workflows: DbWorkflow[]; total: number }> {
    const client = await getPostgresClient();

    try {
      let whereClause = 'WHERE (created_by = $1 OR organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = $1))';
      const params: any[] = [userId];
      let paramIndex = 2;

      if (options.status) {
        whereClause += ` AND status = $${paramIndex}`;
        params.push(options.status);
        paramIndex++;
      }

      if (options.organizationId) {
        whereClause += ` AND organization_id = $${paramIndex}`;
        params.push(options.organizationId);
        paramIndex++;
      }

      // Get total count
      const countResult = await client.query(
        `SELECT COUNT(*) as total FROM workflows ${whereClause}`,
        params
      );
      const total = parseInt(countResult.rows[0].total);

      // Get workflows with pagination
      let query = `SELECT * FROM workflows ${whereClause} ORDER BY updated_at DESC`;
      
      if (options.limit) {
        query += ` LIMIT $${paramIndex}`;
        params.push(options.limit);
        paramIndex++;
      }

      if (options.offset) {
        query += ` OFFSET $${paramIndex}`;
        params.push(options.offset);
      }

      const result = await client.query(query, params);

      return {
        workflows: result.rows as DbWorkflow[],
        total
      };
    } finally {
      client.release();
    }
  }

  // Update workflow
  async updateWorkflow(
    id: string,
    updates: Partial<z.infer<typeof WorkflowSchema>>,
    userId: string
  ): Promise<DbWorkflow | null> {
    const client = await getPostgresClient();

    try {
      const setClauses: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (updates.name !== undefined) {
        setClauses.push(`name = $${paramIndex}`);
        params.push(updates.name);
        paramIndex++;
      }

      if (updates.description !== undefined) {
        setClauses.push(`description = $${paramIndex}`);
        params.push(updates.description);
        paramIndex++;
      }

      if (updates.status !== undefined) {
        setClauses.push(`status = $${paramIndex}`);
        params.push(updates.status);
        paramIndex++;
      }

      if (updates.metadata?.tags !== undefined) {
        setClauses.push(`tags = $${paramIndex}`);
        params.push(updates.metadata.tags);
        paramIndex++;
      }

      if (setClauses.length === 0) {
        return null;
      }

      setClauses.push(`updated_at = NOW()`);

      const query = `
        UPDATE workflows 
        SET ${setClauses.join(', ')}
        WHERE id = $${paramIndex} AND created_by = $${paramIndex + 1}
        RETURNING *
      `;
      
      params.push(id, userId);

      const result = await client.query(query, params);
      return result.rows[0] as DbWorkflow || null;
    } finally {
      client.release();
    }
  }

  // Delete workflow
  async deleteWorkflow(id: string, userId: string): Promise<boolean> {
    const client = await getPostgresClient();

    try {
      const result = await client.query(
        'DELETE FROM workflows WHERE id = $1 AND created_by = $2',
        [id, userId]
      );

      return (result.rowCount ?? 0) > 0;
    } finally {
      client.release();
    }
  }

  // Get latest workflow version
  async getLatestWorkflowVersion(workflowId: string): Promise<DbWorkflowVersion | null> {
    const client = await getPostgresClient();

    try {
      const result = await client.query(
        `SELECT * FROM workflow_versions 
         WHERE workflow_id = $1 
         ORDER BY version_number DESC 
         LIMIT 1`,
        [workflowId]
      );

      return result.rows[0] as DbWorkflowVersion || null;
    } finally {
      client.release();
    }
  }

  // Create workflow execution
  async createWorkflowExecution(
    workflowId: string,
    triggerData?: object,
    workflowVersionId?: string
  ): Promise<DbWorkflowExecution> {
    const client = await getPostgresClient();

    try {
      const result = await client.query(
        `INSERT INTO workflow_executions (workflow_id, workflow_version_id, trigger_data, status)
         VALUES ($1, $2, $3, 'pending')
         RETURNING *`,
        [workflowId, workflowVersionId || null, triggerData ? JSON.stringify(triggerData) : null]
      );

      return result.rows[0] as DbWorkflowExecution;
    } finally {
      client.release();
    }
  }

  // Update execution status
  async updateExecutionStatus(
    executionId: string,
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled',
    errorMessage?: string,
    executionData?: object
  ): Promise<DbWorkflowExecution | null> {
    const client = await getPostgresClient();

    try {
      const updates: string[] = ['status = $2'];
      const params: any[] = [executionId, status];
      let paramIndex = 3;

      if (status === 'running' && !await this.isExecutionStarted(executionId)) {
        // First time setting to running, record start time
        updates.push('started_at = NOW()');
      }

      if (['completed', 'failed', 'cancelled'].includes(status)) {
        updates.push('completed_at = NOW()');
        updates.push('duration_ms = EXTRACT(EPOCH FROM (NOW() - started_at)) * 1000');
      }

      if (errorMessage !== undefined) {
        updates.push(`error_message = $${paramIndex}`);
        params.push(errorMessage);
        paramIndex++;
      }

      if (executionData !== undefined) {
        updates.push(`execution_data = $${paramIndex}`);
        params.push(JSON.stringify(executionData));
        paramIndex++;
      }

      const result = await client.query(
        `UPDATE workflow_executions 
         SET ${updates.join(', ')}
         WHERE id = $1
         RETURNING *`,
        params
      );

      return result.rows[0] as DbWorkflowExecution || null;
    } finally {
      client.release();
    }
  }

  // Get workflow executions
  async getWorkflowExecutions(
    workflowId: string,
    options: {
      limit?: number;
      offset?: number;
      status?: string;
    } = {}
  ): Promise<{ executions: DbWorkflowExecution[]; total: number }> {
    const client = await getPostgresClient();

    try {
      let whereClause = 'WHERE workflow_id = $1';
      const params: any[] = [workflowId];
      let paramIndex = 2;

      if (options.status) {
        whereClause += ` AND status = $${paramIndex}`;
        params.push(options.status);
        paramIndex++;
      }

      // Get total count
      const countResult = await client.query(
        `SELECT COUNT(*) as total FROM workflow_executions ${whereClause}`,
        params
      );
      const total = parseInt(countResult.rows[0].total);

      // Get executions with pagination
      let query = `SELECT * FROM workflow_executions ${whereClause} ORDER BY started_at DESC`;
      
      if (options.limit) {
        query += ` LIMIT $${paramIndex}`;
        params.push(options.limit);
        paramIndex++;
      }

      if (options.offset) {
        query += ` OFFSET $${paramIndex}`;
        params.push(options.offset);
      }

      const result = await client.query(query, params);

      return {
        executions: result.rows as DbWorkflowExecution[],
        total
      };
    } finally {
      client.release();
    }
  }

  // Helper method to check if execution has started
  private async isExecutionStarted(executionId: string): Promise<boolean> {
    const client = await getPostgresClient();

    try {
      const result = await client.query(
        'SELECT started_at FROM workflow_executions WHERE id = $1',
        [executionId]
      );

      return result.rows.length > 0 && result.rows[0].started_at !== null;
    } finally {
      client.release();
    }
  }

  // Bulk operations for performance
  async getWorkflowsWithExecutionStats(
    userId: string,
    organizationId?: string
  ): Promise<Array<DbWorkflow & { execution_count: number; last_execution: Date | null }>> {
    const client = await getPostgresClient();

    try {
      let whereClause = 'WHERE (w.created_by = $1 OR w.organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = $1))';
      const params: any[] = [userId];

      if (organizationId) {
        whereClause += ' AND w.organization_id = $2';
        params.push(organizationId);
      }

      const result = await client.query(
        `SELECT w.*, 
                COUNT(we.id) as execution_count,
                MAX(we.started_at) as last_execution
         FROM workflows w
         LEFT JOIN workflow_executions we ON w.id = we.workflow_id
         ${whereClause}
         GROUP BY w.id
         ORDER BY w.updated_at DESC`,
        params
      );

      return result.rows;
    } finally {
      client.release();
    }
  }
}