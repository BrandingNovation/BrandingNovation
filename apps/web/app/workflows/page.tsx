'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAPI, WorkflowData, workflowUtils } from '../../lib/api';

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const api = useAPI();

  useEffect(() => {
    loadWorkflows();
  }, [selectedStatus]);

  const loadWorkflows = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = selectedStatus !== 'all' ? { status: selectedStatus } : {};
      const result = await api.getWorkflows(params);
      
      if (result.error) {
        throw new Error(result.error);
      }

      setWorkflows(result.data?.workflows || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkflow = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      const result = await api.deleteWorkflow(id);
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Remove from local state
      setWorkflows(workflows.filter(w => w.id !== id));
    } catch (err) {
      alert(`Failed to delete workflow: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">F</span>
                </div>
                <span className="text-xl font-bold text-gray-900">FlowForge</span>
              </Link>
              <div className="text-sm text-gray-500">
                <span>Workflows Dashboard</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/builder/interactive"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                New Workflow
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Workflows</h1>
          <p className="mt-2 text-gray-600">
            Manage and monitor your automation workflows
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <button
            onClick={loadWorkflows}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading workflows...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="w-5 h-5 text-red-400 mr-2">❌</div>
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && workflows.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl text-gray-400">🔧</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows found</h3>
            <p className="text-gray-600 mb-6">
              {selectedStatus === 'all' 
                ? "You haven't created any workflows yet."
                : `No workflows with status "${selectedStatus}".`
              }
            </p>
            <Link
              href="/builder/interactive"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Create Your First Workflow
            </Link>
          </div>
        )}

        {/* Workflows Grid */}
        {!loading && !error && workflows.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {workflow.name}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${workflowUtils.getStatusColor(
                        workflow.status
                      )}`}
                    >
                      {workflow.status}
                    </span>
                  </div>

                  {/* Description */}
                  {workflow.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {workflow.description}
                    </p>
                  )}

                  {/* Tags */}
                  {workflow.tags && workflow.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {workflow.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {workflow.tags.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                          +{workflow.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="text-xs text-gray-500 mb-4 space-y-1">
                    <div>Created: {formatDate(workflow.created_at)}</div>
                    <div>Updated: {formatDate(workflow.updated_at)}</div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/builder/interactive?workflowId=${workflow.id}`}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Edit
                      </Link>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => {
                          // TODO: View executions
                          alert('View executions feature coming soon!');
                        }}
                        className="text-sm text-green-600 hover:text-green-700 font-medium"
                      >
                        Executions
                      </button>
                    </div>
                    <button
                      onClick={() => handleDeleteWorkflow(workflow.id, workflow.name)}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {!loading && !error && workflows.length > 0 && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{workflows.length}</div>
              <div className="text-sm text-gray-600">Total Workflows</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {workflows.filter(w => w.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {workflows.filter(w => w.status === 'draft').length}
              </div>
              <div className="text-sm text-gray-600">Draft</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">
                {workflows.filter(w => w.status === 'paused').length}
              </div>
              <div className="text-sm text-gray-600">Paused</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}