'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AnalyticsData {
  totalWorkflows: number;
  activeWorkflows: number;
  totalExecutions: number;
  successRate: number;
  avgExecutionTime: number;
  executionsToday: number;
  topPerformingWorkflows: Array<{
    id: string;
    name: string;
    executions: number;
    successRate: number;
    avgTime: number;
  }>;
  recentActivity: Array<{
    id: string;
    workflow: string;
    action: string;
    timestamp: string;
    status: 'success' | 'failed' | 'running';
  }>;
  performanceMetrics: {
    cpu: number;
    memory: number;
    throughput: number;
    errorRate: number;
  };
  trends: {
    labels: string[];
    executionsData: number[];
    successData: number[];
  };
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadAnalytics();
    
    if (autoRefresh) {
      const interval = setInterval(loadAnalytics, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [timeRange, autoRefresh]);

  const loadAnalytics = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockData: AnalyticsData = {
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
        { id: '4', name: 'Support Ticket Routing', executions: 543, successRate: 99.1, avgTime: 0.9 },
        { id: '5', name: 'Content Approval', executions: 432, successRate: 94.3, avgTime: 5.7 },
      ],
      recentActivity: [
        { id: '1', workflow: 'Customer Onboarding', action: 'Execution completed', timestamp: '2 minutes ago', status: 'success' },
        { id: '2', workflow: 'Order Processing', action: 'Execution started', timestamp: '5 minutes ago', status: 'running' },
        { id: '3', workflow: 'Lead Qualification', action: 'Execution failed', timestamp: '8 minutes ago', status: 'failed' },
        { id: '4', workflow: 'Support Ticket Routing', action: 'Execution completed', timestamp: '12 minutes ago', status: 'success' },
        { id: '5', workflow: 'Content Approval', action: 'Workflow updated', timestamp: '15 minutes ago', status: 'success' },
        { id: '6', workflow: 'Customer Onboarding', action: 'Execution completed', timestamp: '18 minutes ago', status: 'success' },
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

    setAnalyticsData(mockData);
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'failed': return '❌';
      case 'running': return '🔄';
      default: return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'failed': return 'text-red-600 bg-red-50';
      case 'running': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

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
                <span>Analytics</span>
              </nav>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as '24h' | '7d' | '30d')}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-3 py-1 text-sm rounded ${
                  autoRefresh 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {autoRefresh ? '🔄 Auto-refresh' : '⏸️ Manual'}
              </button>
              <button
                onClick={loadAnalytics}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Monitor workflow performance, track execution metrics, and optimize automation efficiency
          </p>
        </div>

        {analyticsData && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-blue-600 text-xl">🔧</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Workflows</p>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.totalWorkflows}</p>
                    <p className="text-xs text-green-600">↗ +3 this week</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-green-600 text-xl">⚡</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Workflows</p>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.activeWorkflows}</p>
                    <p className="text-xs text-green-600">↗ +2 today</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-purple-600 text-xl">📊</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Executions</p>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.totalExecutions.toLocaleString()}</p>
                    <p className="text-xs text-green-600">↗ +{analyticsData.executionsToday} today</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-emerald-600 text-xl">✅</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.successRate}%</p>
                    <p className="text-xs text-green-600">↗ +0.2% this week</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* System Performance */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">CPU Usage</span>
                      <span className="font-medium">{analyticsData.performanceMetrics.cpu}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${analyticsData.performanceMetrics.cpu}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Memory Usage</span>
                      <span className="font-medium">{analyticsData.performanceMetrics.memory}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${analyticsData.performanceMetrics.memory}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Throughput</span>
                      <span className="font-medium">{analyticsData.performanceMetrics.throughput}/min</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${analyticsData.performanceMetrics.throughput}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Error Rate</span>
                      <span className="font-medium">{analyticsData.performanceMetrics.errorRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${analyticsData.performanceMetrics.errorRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Execution Trends Chart */}
              <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Execution Trends</h3>
                <div className="h-64 flex items-end justify-between space-x-2">
                  {analyticsData.trends.executionsData.map((value, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div 
                        className="w-full bg-blue-500 rounded-t transition-all duration-500 hover:bg-blue-600"
                        style={{ height: `${(value / Math.max(...analyticsData.trends.executionsData)) * 200}px` }}
                      ></div>
                      <div className="text-xs text-gray-600 mt-2">
                        {analyticsData.trends.labels[index]}
                      </div>
                      <div className="text-xs font-medium text-gray-900">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Performing Workflows & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Performing Workflows */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Top Performing Workflows</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {analyticsData.topPerformingWorkflows.map((workflow, index) => (
                    <div key={workflow.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{workflow.name}</div>
                            <div className="text-xs text-gray-500">{workflow.executions} executions</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-green-600">{workflow.successRate}%</div>
                          <div className="text-xs text-gray-500">{workflow.avgTime}s avg</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                </div>
                <div className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
                  {analyticsData.recentActivity.map((activity) => (
                    <div key={activity.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(activity.status)}`}>
                          <span className="text-sm">{getStatusIcon(activity.status)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {activity.workflow}
                          </div>
                          <div className="text-sm text-gray-500">{activity.action}</div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {activity.timestamp}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  href="/builder/interactive"
                  className="flex items-center justify-center px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <span className="text-2xl mr-3 group-hover:scale-110 transition-transform">🚀</span>
                  <span className="font-medium text-gray-900">Create New Workflow</span>
                </Link>
                
                <Link
                  href="/workflows"
                  className="flex items-center justify-center px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <span className="text-2xl mr-3 group-hover:scale-110 transition-transform">📊</span>
                  <span className="font-medium text-gray-900">Manage Workflows</span>
                </Link>
                
                <button
                  onClick={() => {
                    alert('Export feature coming soon! This will allow you to export analytics data as CSV, PDF, or Excel.');
                  }}
                  className="flex items-center justify-center px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <span className="text-2xl mr-3 group-hover:scale-110 transition-transform">📥</span>
                  <span className="font-medium text-gray-900">Export Data</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}