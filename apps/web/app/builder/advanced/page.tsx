'use client';

import { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  NodeTypes,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { v4 as uuidv4 } from 'uuid';

// Advanced Node Components
const AdvancedTriggerNode = ({ data, selected }: any) => (
  <div className={`px-4 py-3 shadow-lg rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white border-2 ${selected ? 'border-blue-300' : 'border-transparent'} min-w-[180px]`}>
    <Handle type="source" position={Position.Right} className="w-3 h-3" />
    <div className="flex items-center">
      <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
        <span className="text-xl">⚡</span>
      </div>
      <div>
        <div className="text-sm font-bold">{data.label}</div>
        <div className="text-xs opacity-80">{data.triggerType || 'Webhook'}</div>
        <div className="text-xs opacity-60">Conditions: {data.conditions?.length || 0}</div>
      </div>
    </div>
  </div>
);

const LoopNode = ({ data, selected }: any) => (
  <div className={`px-4 py-3 shadow-lg rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-2 ${selected ? 'border-blue-300' : 'border-transparent'} min-w-[180px]`}>
    <Handle type="target" position={Position.Left} className="w-3 h-3" />
    <Handle type="source" position={Position.Right} className="w-3 h-3" />
    <Handle type="source" position={Position.Bottom} id="loop" className="w-3 h-3" />
    <div className="flex items-center">
      <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
        <span className="text-xl">🔄</span>
      </div>
      <div>
        <div className="text-sm font-bold">{data.label}</div>
        <div className="text-xs opacity-80">{data.loopType || 'For Each'}</div>
        <div className="text-xs opacity-60">Max: {data.maxIterations || '∞'}</div>
      </div>
    </div>
  </div>
);

const AIReasoningNode = ({ data, selected }: any) => (
  <div className={`px-4 py-3 shadow-lg rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white border-2 ${selected ? 'border-blue-300' : 'border-transparent'} min-w-[200px]`}>
    <Handle type="target" position={Position.Left} className="w-3 h-3" />
    <Handle type="source" position={Position.Right} className="w-3 h-3" />
    <div className="flex items-center">
      <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
        <span className="text-xl">🧠</span>
      </div>
      <div className="flex-1">
        <div className="text-sm font-bold">{data.label}</div>
        <div className="text-xs opacity-80">{data.model || 'GPT-4'}</div>
        <div className="text-xs opacity-60">Temperature: {data.temperature || 0.7}</div>
      </div>
    </div>
  </div>
);

const DatabaseNode = ({ data, selected }: any) => (
  <div className={`px-4 py-3 shadow-lg rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-2 ${selected ? 'border-blue-300' : 'border-transparent'} min-w-[180px]`}>
    <Handle type="target" position={Position.Left} className="w-3 h-3" />
    <Handle type="source" position={Position.Right} className="w-3 h-3" />
    <div className="flex items-center">
      <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
        <span className="text-xl">🗄️</span>
      </div>
      <div>
        <div className="text-sm font-bold">{data.label}</div>
        <div className="text-xs opacity-80">{data.operation || 'Query'}</div>
        <div className="text-xs opacity-60">{data.database || 'PostgreSQL'}</div>
      </div>
    </div>
  </div>
);

const APICallNode = ({ data, selected }: any) => (
  <div className={`px-4 py-3 shadow-lg rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white border-2 ${selected ? 'border-blue-300' : 'border-transparent'} min-w-[180px]`}>
    <Handle type="target" position={Position.Left} className="w-3 h-3" />
    <Handle type="source" position={Position.Right} className="w-3 h-3" />
    <div className="flex items-center">
      <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
        <span className="text-xl">🌐</span>
      </div>
      <div>
        <div className="text-sm font-bold">{data.label}</div>
        <div className="text-xs opacity-80">{data.method || 'POST'} Request</div>
        <div className="text-xs opacity-60">{data.endpoint || 'API Endpoint'}</div>
      </div>
    </div>
  </div>
);

const FileProcessorNode = ({ data, selected }: any) => (
  <div className={`px-4 py-3 shadow-lg rounded-lg bg-gradient-to-r from-teal-500 to-green-500 text-white border-2 ${selected ? 'border-blue-300' : 'border-transparent'} min-w-[180px]`}>
    <Handle type="target" position={Position.Left} className="w-3 h-3" />
    <Handle type="source" position={Position.Right} className="w-3 h-3" />
    <div className="flex items-center">
      <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
        <span className="text-xl">📁</span>
      </div>
      <div>
        <div className="text-sm font-bold">{data.label}</div>
        <div className="text-xs opacity-80">{data.operation || 'Process'}</div>
        <div className="text-xs opacity-60">{data.fileType || 'All Files'}</div>
      </div>
    </div>
  </div>
);

const ErrorHandlerNode = ({ data, selected }: any) => (
  <div className={`px-4 py-3 shadow-lg rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-2 ${selected ? 'border-blue-300' : 'border-transparent'} min-w-[180px]`}>
    <Handle type="target" position={Position.Left} className="w-3 h-3" />
    <Handle type="source" position={Position.Right} className="w-3 h-3" />
    <Handle type="source" position={Position.Bottom} id="error" className="w-3 h-3 bg-red-500" />
    <div className="flex items-center">
      <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
        <span className="text-xl">⚠️</span>
      </div>
      <div>
        <div className="text-sm font-bold">{data.label}</div>
        <div className="text-xs opacity-80">Try/Catch</div>
        <div className="text-xs opacity-60">Retries: {data.maxRetries || 3}</div>
      </div>
    </div>
  </div>
);

const nodeTypes: NodeTypes = {
  advancedTrigger: AdvancedTriggerNode,
  loop: LoopNode,
  aiReasoning: AIReasoningNode,
  database: DatabaseNode,
  apiCall: APICallNode,
  fileProcessor: FileProcessorNode,
  errorHandler: ErrorHandlerNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'advancedTrigger',
    position: { x: 50, y: 100 },
    data: { 
      label: 'Smart Trigger', 
      triggerType: 'Intelligent Webhook',
      conditions: ['user.status === "active"', 'order.amount > 100']
    },
  },
  {
    id: '2',
    type: 'aiReasoning',
    position: { x: 300, y: 100 },
    data: { 
      label: 'Analyze Customer', 
      model: 'GPT-4',
      temperature: 0.3,
      prompt: 'Analyze customer behavior and intent'
    },
  },
  {
    id: '3',
    type: 'database',
    position: { x: 550, y: 100 },
    data: { 
      label: 'Fetch History', 
      operation: 'SELECT',
      database: 'customer_db',
      query: 'SELECT * FROM orders WHERE customer_id = ?'
    },
  },
  {
    id: '4',
    type: 'loop',
    position: { x: 800, y: 100 },
    data: { 
      label: 'Process Orders', 
      loopType: 'For Each Order',
      maxIterations: 50
    },
  },
  {
    id: '5',
    type: 'apiCall',
    position: { x: 1050, y: 50 },
    data: { 
      label: 'Update CRM', 
      method: 'PATCH',
      endpoint: '/api/crm/customers/{id}'
    },
  },
  {
    id: '6',
    type: 'fileProcessor',
    position: { x: 1050, y: 180 },
    data: { 
      label: 'Generate Report', 
      operation: 'Create PDF',
      fileType: 'PDF Report'
    },
  },
  {
    id: '7',
    type: 'errorHandler',
    position: { x: 300, y: 250 },
    data: { 
      label: 'Error Handler', 
      maxRetries: 3,
      fallbackAction: 'Send Alert'
    },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' },
  { id: 'e2-3', source: '2', target: '3', type: 'smoothstep' },
  { id: 'e3-4', source: '3', target: '4', type: 'smoothstep' },
  { id: 'e4-5', source: '4', target: '5', type: 'smoothstep' },
  { id: 'e4-6', source: '4', target: '6', type: 'smoothstep' },
  { id: 'e2-7', source: '2', target: '7', sourceHandle: null, targetHandle: null, type: 'smoothstep', style: { stroke: '#ef4444' } },
];

export default function AdvancedBuilderPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showAdvancedPanel, setShowAdvancedPanel] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds: Edge[]) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const addAdvancedNode = (type: string) => {
    const nodeConfigs = {
      advancedTrigger: { label: 'Smart Trigger', color: 'from-green-500 to-emerald-500' },
      loop: { label: 'Loop Control', color: 'from-purple-500 to-indigo-500' },
      aiReasoning: { label: 'AI Reasoning', color: 'from-pink-500 to-rose-500' },
      database: { label: 'Database Query', color: 'from-cyan-500 to-blue-500' },
      apiCall: { label: 'API Request', color: 'from-orange-500 to-red-500' },
      fileProcessor: { label: 'File Processor', color: 'from-teal-500 to-green-500' },
      errorHandler: { label: 'Error Handler', color: 'from-yellow-500 to-orange-500' },
    };

    const config = nodeConfigs[type as keyof typeof nodeConfigs];
    
    const newNode: Node = {
      id: uuidv4(),
      type,
      position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
      data: { label: config.label },
    };
    setNodes((nds: Node[]) => nds.concat(newNode));
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Advanced Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <a href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                FlowForge Advanced
              </span>
            </a>
            <div className="text-sm text-gray-500">
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                🚀 Advanced Workflow Builder
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAdvancedPanel(!showAdvancedPanel)}
              className="px-4 py-2 text-sm font-medium text-purple-700 bg-purple-100 rounded-md hover:bg-purple-200"
            >
              {showAdvancedPanel ? '📊 Hide Analytics' : '📊 Show Analytics'}
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-md hover:from-blue-700 hover:to-purple-700">
              💾 Deploy Workflow
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Advanced Node Library */}
        <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Advanced Components</h2>
          
          <div className="space-y-6">
            {/* AI & Intelligence */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide">🧠 AI & Intelligence</h3>
              <div className="space-y-2">
                <button
                  onClick={() => addAdvancedNode('aiReasoning')}
                  className="w-full p-3 border border-purple-200 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 text-left group transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                      🧠
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">AI Reasoning</div>
                      <div className="text-xs text-gray-600">Advanced decision making</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Flow Control */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide">🔄 Flow Control</h3>
              <div className="space-y-2">
                <button
                  onClick={() => addAdvancedNode('loop')}
                  className="w-full p-3 border border-purple-200 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 text-left group transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                      🔄
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Loop Control</div>
                      <div className="text-xs text-gray-600">Iterate through data</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => addAdvancedNode('errorHandler')}
                  className="w-full p-3 border border-yellow-200 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 text-left group transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                      ⚠️
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Error Handler</div>
                      <div className="text-xs text-gray-600">Try/catch logic</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Data Operations */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide">🗄️ Data Operations</h3>
              <div className="space-y-2">
                <button
                  onClick={() => addAdvancedNode('database')}
                  className="w-full p-3 border border-cyan-200 rounded-lg bg-gradient-to-r from-cyan-50 to-blue-50 hover:from-cyan-100 hover:to-blue-100 text-left group transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                      🗄️
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Database</div>
                      <div className="text-xs text-gray-600">Query & update data</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => addAdvancedNode('fileProcessor')}
                  className="w-full p-3 border border-teal-200 rounded-lg bg-gradient-to-r from-teal-50 to-green-50 hover:from-teal-100 hover:to-green-100 text-left group transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-green-500 rounded-lg flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                      📁
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">File Processor</div>
                      <div className="text-xs text-gray-600">Process files & docs</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Integrations */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide">🌐 Integrations</h3>
              <div className="space-y-2">
                <button
                  onClick={() => addAdvancedNode('apiCall')}
                  className="w-full p-3 border border-orange-200 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 text-left group transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                      🌐
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">API Call</div>
                      <div className="text-xs text-gray-600">External API requests</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => addAdvancedNode('advancedTrigger')}
                  className="w-full p-3 border border-green-200 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 text-left group transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                      ⚡
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Smart Trigger</div>
                      <div className="text-xs text-gray-600">Conditional triggers</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">⚡ Performance</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Nodes:</span>
                <span className="font-medium text-blue-600">{nodes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Connections:</span>
                <span className="font-medium text-purple-600">{edges.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Complexity:</span>
                <span className="font-medium text-green-600">
                  {nodes.length < 5 ? 'Simple' : nodes.length < 15 ? 'Medium' : 'Complex'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gradient-to-br from-gray-50 to-blue-50"
          >
            <Controls className="bg-white border border-gray-200 rounded-lg shadow-sm" />
            <Background 
              variant={BackgroundVariant.Dots} 
              gap={20} 
              size={1} 
              className="opacity-40" 
              color="#6366f1"
            />
            <MiniMap 
              className="bg-white border border-gray-200 rounded-lg shadow-sm"
                             nodeColor={(node: Node) => {
                const colors = {
                  advancedTrigger: '#10b981',
                  loop: '#8b5cf6',
                  aiReasoning: '#ec4899',
                  database: '#06b6d4',
                  apiCall: '#f97316',
                  fileProcessor: '#14b8a6',
                  errorHandler: '#f59e0b',
                };
                return colors[node.type as keyof typeof colors] || '#6b7280';
              }}
              maskColor="rgba(0, 0, 0, 0.1)"
            />
          </ReactFlow>

          {/* Advanced Features Overlay */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-4 max-w-sm shadow-lg">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">🚀</span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Advanced Features</h4>
                <ul className="text-xs text-gray-700 mt-1 space-y-1">
                  <li>• Real-time AI reasoning</li>
                  <li>• Loop & conditional logic</li>
                  <li>• Database operations</li>
                  <li>• Error handling & recovery</li>
                  <li>• File processing & APIs</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Live Performance Monitor */}
          {showAdvancedPanel && (
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-4 min-w-[300px] shadow-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                📊 Live Analytics
                <div className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </h4>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Memory Usage:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="w-1/3 h-full bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-green-600 font-medium">32%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">CPU Load:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="w-1/4 h-full bg-blue-500 rounded-full"></div>
                    </div>
                    <span className="text-blue-600 font-medium">23%</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Execution Speed:</span>
                  <span className="font-medium text-purple-600">1.2s avg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Success Rate:</span>
                  <span className="font-medium text-green-600">98.7%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}