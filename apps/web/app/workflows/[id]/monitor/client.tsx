'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAPI, WorkflowExecution, workflowUtils } from '../../../../lib/api';

interface ExecutionStep {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: string;
  endTime?: string;
  duration?: number;
  output?: any;
  error?: string;
}

interface Props {
  workflowId: string;
}

export default function WorkflowMonitorClient({ workflowId }: Props) {
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null);
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const api = useAPI();

  useEffect(() => {
    loadExecutions();
    
    if (autoRefresh) {
      const interval = setInterval(loadExecutions, 2000); // Refresh every 2 seconds
      return () => clearInterval(interval);
    }
  }, [workflowId, autoRefresh]);

  const loadExecutions = async () => {
    try {
      const result = await api.getWorkflowExecutions(workflowId, { limit: 10 });
      if (result.data) {
        setExecutions(result.data.executions);
        
        // Auto-select the most recent execution
        if (result.data.executions.length > 0 && !selectedExecution) {
          setSelectedExecution(result.data.executions[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load executions:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeWorkflow = async () => {
    setIsExecuting(true);
    try {
      const result = await api.executeWorkflow(workflowId, {
        email: 'demo@example.com',
        name: 'Demo User',
        source: 'manual_trigger',
        timestamp: new Date().toISOString()
      });

      if (result.data) {
        // Refresh executions to show the new one
        setTimeout(() => {
          loadExecutions();
          setSelectedExecution(result.data!);
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to execute workflow:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'running': return '🔄';
      case 'completed': return '✅';
      case 'failed': return '❌';
      case 'cancelled': return '⚠️';
      default: return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'running': return 'text-blue-600 bg-blue-50 animate-pulse';
      case 'completed': return 'text-green-600 bg-green-50';
      case 'failed': return 'text-red-600 bg-red-50';
      case 'cancelled': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '0ms';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  // Simulate execution steps for demo
  const simulateExecutionSteps = (execution: WorkflowExecution): ExecutionStep[] => {
    const steps = [
      { nodeId: '1', nodeName: 'New Customer Trigger', nodeType: 'trigger' },
      { nodeId: '2', nodeName: 'Welcome Email', nodeType: 'email' },
      { nodeId: '3', nodeName: 'Wait 5 seconds', nodeType: 'delay' },
      { nodeId: '4', nodeName: 'Email Opened?', nodeType: 'condition' },
      { nodeId: '5', nodeName: 'Follow-up Email', nodeType: 'email' },
      { nodeId: '6', nodeName: 'Add to CRM', nodeType: 'crm' },
    ];

    return steps.map((step, index) => {
      let status: 'pending' | 'running' | 'completed' | 'failed' = 'pending';
      
      if (execution.status === 'completed') {
        status = 'completed';
      } else if (execution.status === 'running') {
        // Simulate progressive completion
        const elapsed = Date.now() - new Date(execution.started_at).getTime();
        const stepDuration = 2000; // 2 seconds per step
        const currentStep = Math.floor(elapsed / stepDuration);
        
        if (index < currentStep) {
          status = 'completed';
        } else if (index === currentStep) {
          status = 'running';
        }
      } else if (execution.status === 'failed') {
        status = index < 3 ? 'completed' : index === 3 ? 'failed' : 'pending';
      }

      return {
        ...step,
        status,
        startTime: status !== 'pending' ? new Date(Date.now() - (steps.length - index) * 2000).toISOString() : undefined,
        endTime: status === 'completed' ? new Date(Date.now() - (steps.length - index - 1) * 2000).toISOString() : undefined,
        duration: status === 'completed' ? 1500 + Math.random() * 1000 : undefined,
        output: status === 'completed' ? { success: true, message: `${step.nodeName} completed successfully` } : undefined
      };
    });
  };

  useEffect(() => {
    if (selectedExecution) {
      setExecutionSteps(simulateExecutionSteps(selectedExecution));
    }
  }, [selectedExecution]);

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
              <nav className="flex items-center space-x-2 text-sm text-gray-500">
                <Link href="/workflows" className="hover:text-gray-700">Workflows</Link>
                <span>/</span>
                <span>Monitor</span>
              </nav>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-3 py-1 text-sm rounded ${
                  autoRefresh 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {autoRefresh ? '🔄 Auto-refresh ON' : '⏸️ Auto-refresh OFF'}
              </button>
              <button
                onClick={executeWorkflow}
                disabled={isExecuting}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  isExecuting
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isExecuting ? '🔄 Executing...' : '▶️ Run Workflow'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Workflow Execution Monitor</h1>
          <p className="mt-2 text-gray-600">
            Real-time monitoring of workflow executions with step-by-step progress
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Executions List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Executions</h2>
              </div>
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-6 text-center text-gray-500">Loading executions...</div>
                ) : executions.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No executions yet. Run the workflow to see results.
                  </div>
                ) : (
                  executions.map((execution) => (
                    <button
                      key={execution.id}
                      onClick={() => setSelectedExecution(execution)}
                      className={`w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors ${
                        selectedExecution?.id === execution.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {getStatusIcon(execution.status)} Execution
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(execution.status)}`}>
                          {execution.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        <div>Started: {new Date(execution.started_at).toLocaleTimeString()}</div>
                        {execution.duration_ms && (
                          <div>Duration: {formatDuration(execution.duration_ms)}</div>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Execution Details */}
          <div className="lg:col-span-2">
            {selectedExecution ? (
              <div className="space-y-6">
                {/* Execution Overview */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Execution Details
                    </h2>
                    <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(selectedExecution.status)}`}>
                      {getStatusIcon(selectedExecution.status)} {selectedExecution.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500 mb-1">Started</div>
                      <div className="font-medium">
                        {new Date(selectedExecution.started_at).toLocaleString()}
                      </div>
                    </div>
                    {selectedExecution.completed_at && (
                      <div>
                        <div className="text-gray-500 mb-1">Completed</div>
                        <div className="font-medium">
                          {new Date(selectedExecution.completed_at).toLocaleString()}
                        </div>
                      </div>
                    )}
                    {selectedExecution.duration_ms && (
                      <div>
                        <div className="text-gray-500 mb-1">Duration</div>
                        <div className="font-medium">
                          {formatDuration(selectedExecution.duration_ms)}
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="text-gray-500 mb-1">Execution ID</div>
                      <div className="font-mono text-xs">
                        {selectedExecution.id.substring(0, 8)}...
                      </div>
                    </div>
                  </div>

                  {selectedExecution.error_message && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <div className="text-sm text-red-700">
                        <strong>Error:</strong> {selectedExecution.error_message}
                      </div>
                    </div>
                  )}
                </div>

                {/* Step-by-Step Progress */}
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Execution Steps</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {executionSteps.map((step, index) => (
                        <div
                          key={step.nodeId}
                          className={`flex items-start space-x-4 p-4 rounded-lg border-2 transition-all ${
                            step.status === 'running' 
                              ? 'border-blue-200 bg-blue-50' 
                              : step.status === 'completed'
                              ? 'border-green-200 bg-green-50'
                              : step.status === 'failed'
                              ? 'border-red-200 bg-red-50'
                              : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          {/* Step Number & Status */}
                          <div className="flex-shrink-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              step.status === 'completed' ? 'bg-green-500 text-white' :
                              step.status === 'running' ? 'bg-blue-500 text-white animate-pulse' :
                              step.status === 'failed' ? 'bg-red-500 text-white' :
                              'bg-gray-300 text-gray-600'
                            }`}>
                              {step.status === 'completed' ? '✓' :
                               step.status === 'failed' ? '✗' :
                               step.status === 'running' ? '⟳' :
                               index + 1}
                            </div>
                          </div>

                          {/* Step Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-medium text-gray-900">
                                {step.nodeName}
                              </h4>
                              <span className="text-xs text-gray-500 uppercase tracking-wide">
                                {step.nodeType}
                              </span>
                            </div>

                            {step.status === 'running' && (
                              <div className="text-sm text-blue-600 mb-2">
                                🔄 Processing...
                              </div>
                            )}

                            {step.output && (
                              <div className="text-sm text-gray-600 mb-2">
                                <pre className="whitespace-pre-wrap">
                                  {typeof step.output === 'string' 
                                    ? step.output 
                                    : JSON.stringify(step.output, null, 2)
                                  }
                                </pre>
                              </div>
                            )}

                            {step.error && (
                              <div className="text-sm text-red-600 mb-2">
                                ❌ Error: {step.error}
                              </div>
                            )}

                            {step.duration && (
                              <div className="text-xs text-gray-500">
                                Duration: {formatDuration(step.duration)}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Raw Execution Data */}
                {selectedExecution.execution_data && (
                  <div className="bg-white rounded-lg border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Raw Execution Data</h3>
                    </div>
                    <div className="p-6">
                      <pre className="text-xs bg-gray-50 p-4 rounded-md overflow-auto">
                        {JSON.stringify(selectedExecution.execution_data, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select an execution to monitor
                </h3>
                <p className="text-gray-600">
                  Choose an execution from the list to see detailed step-by-step progress
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}