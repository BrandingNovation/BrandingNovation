export default function WorkflowBuilderPage() {
  const demoWorkflow = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Customer Onboarding Flow',
    nodes: [
      { id: 'trigger-1', type: 'trigger', label: 'New Customer', x: 100, y: 100 },
      { id: 'email-1', type: 'email', label: 'Welcome Email', x: 300, y: 100 },
      { id: 'delay-1', type: 'delay', label: 'Wait 24h', x: 500, y: 100 },
      { id: 'condition-1', type: 'condition', label: 'Email Opened?', x: 700, y: 100 },
      { id: 'email-2', type: 'email', label: 'Follow-up Email', x: 900, y: 50 },
      { id: 'crm-1', type: 'crm', label: 'Add to CRM', x: 900, y: 150 },
    ],
    connections: [
      { from: 'trigger-1', to: 'email-1' },
      { from: 'email-1', to: 'delay-1' },
      { from: 'delay-1', to: 'condition-1' },
      { from: 'condition-1', to: 'email-2', label: 'Yes' },
      { from: 'condition-1', to: 'crm-1', label: 'No' },
    ]
  };

  const nodeTypes = [
    { type: 'trigger', label: 'Triggers', icon: '⚡', color: 'bg-green-500' },
    { type: 'email', label: 'Email', icon: '📧', color: 'bg-blue-500' },
    { type: 'delay', label: 'Delay', icon: '⏰', color: 'bg-yellow-500' },
    { type: 'condition', label: 'Condition', icon: '🔀', color: 'bg-purple-500' },
    { type: 'crm', label: 'CRM', icon: '📊', color: 'bg-red-500' },
    { type: 'ai', label: 'AI Agent', icon: '🤖', color: 'bg-indigo-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <a href="/" className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">F</span>
                </div>
                <span className="text-xl font-bold text-gray-900">FlowForge</span>
              </a>
              <div className="hidden md:flex items-center space-x-1 text-sm text-gray-500">
                <span>Workspace</span>
                <span>/</span>
                <span className="font-medium text-gray-900">{demoWorkflow.name}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                Save Draft
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                Publish Workflow
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-screen">
        {/* Sidebar - Node Library */}
        <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Node Library</h2>
            <div className="space-y-2">
              {nodeTypes.map((nodeType) => (
                <div
                  key={nodeType.type}
                  className="p-3 border border-gray-200 rounded-lg cursor-move hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 ${nodeType.color} rounded-lg flex items-center justify-center text-white text-lg`}>
                      {nodeType.icon}
                    </div>
                    <span className="font-medium text-gray-900">{nodeType.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Agents Section */}
          <div className="p-4 border-t border-gray-200">
            <h3 className="text-md font-semibold text-gray-900 mb-3">AI Agents</h3>
            <div className="space-y-2">
              <div className="p-3 border border-purple-200 rounded-lg bg-purple-50 cursor-move">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white">
                    ✨
                  </div>
                  <span className="font-medium text-gray-900">Content Generator</span>
                </div>
              </div>
              <div className="p-3 border border-purple-200 rounded-lg bg-purple-50 cursor-move">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white">
                    📊
                  </div>
                  <span className="font-medium text-gray-900">Data Analyzer</span>
                </div>
              </div>
              <div className="p-3 border border-purple-200 rounded-lg bg-purple-50 cursor-move">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white">
                    🎯
                  </div>
                  <span className="font-medium text-gray-900">Decision Router</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 relative">
          {/* Canvas Header */}
          <div className="absolute top-0 left-0 right-0 bg-white border-b border-gray-200 p-4 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-lg font-semibold text-gray-900">Workflow Canvas</h1>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>6 nodes</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>5 connections</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-500 hover:text-gray-700">
                  <span className="text-lg">🔍</span>
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700">
                  <span className="text-lg">↻</span>
                </button>
                <button className="px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
                  ▶ Test Run
                </button>
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="pt-20 h-full bg-gray-50 relative overflow-hidden">
            {/* Grid Background */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                  linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px'
              }}
            ></div>

            {/* Demo Workflow Nodes */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {/* Connections */}
              {demoWorkflow.connections.map((conn, index) => {
                const fromNode = demoWorkflow.nodes.find(n => n.id === conn.from);
                const toNode = demoWorkflow.nodes.find(n => n.id === conn.to);
                if (!fromNode || !toNode) return null;

                const x1 = fromNode.x + 60;
                const y1 = fromNode.y + 20;
                const x2 = toNode.x;
                const y2 = toNode.y + 20;

                return (
                  <g key={index}>
                    <path
                      d={`M ${x1} ${y1} C ${x1 + 50} ${y1} ${x2 - 50} ${y2} ${x2} ${y2}`}
                      stroke="#6366f1"
                      strokeWidth="2"
                      fill="none"
                      markerEnd="url(#arrowhead)"
                    />
                    {conn.label && (
                      <text
                        x={(x1 + x2) / 2}
                        y={(y1 + y2) / 2 - 10}
                        textAnchor="middle"
                        className="text-xs fill-gray-600"
                      >
                        {conn.label}
                      </text>
                    )}
                  </g>
                );
              })}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill="#6366f1"
                  />
                </marker>
              </defs>
            </svg>

            {/* Workflow Nodes */}
            {demoWorkflow.nodes.map((node) => {
              const nodeType = nodeTypes.find(nt => nt.type === node.type);
              return (
                <div
                  key={node.id}
                  className="absolute bg-white border-2 border-gray-300 rounded-lg shadow-md cursor-move hover:shadow-lg transition-shadow"
                  style={{ left: node.x, top: node.y, width: '120px', height: '40px' }}
                >
                  <div className="flex items-center h-full px-3">
                    <div className={`w-6 h-6 ${nodeType?.color} rounded flex items-center justify-center text-white text-sm mr-2`}>
                      {nodeType?.icon}
                    </div>
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {node.label}
                    </span>
                  </div>
                  {/* Connection Points */}
                  <div className="absolute left-0 top-1/2 w-2 h-2 bg-gray-400 rounded-full transform -translate-x-1 -translate-y-1"></div>
                  <div className="absolute right-0 top-1/2 w-2 h-2 bg-gray-400 rounded-full transform translate-x-1 -translate-y-1"></div>
                </div>
              );
            })}

            {/* Demo Notice */}
            <div className="absolute bottom-4 left-4 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-sm">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">ℹ</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Demo Workflow</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    This is a demonstration of FlowForge's visual workflow builder. 
                    Drag nodes from the library to create your automation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Properties Panel */}
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Node Properties</h3>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white">
                  ⚡
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Trigger: New Customer</h4>
                  <p className="text-sm text-gray-500">Webhook trigger</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Webhook URL
                  </label>
                  <input
                    type="text"
                    value="https://api.flowforge.ai/webhook/abc123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trigger Conditions
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input type="checkbox" checked className="mr-2" />
                      <span className="text-sm text-gray-700">New customer registration</span>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm text-gray-700">Payment completed</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rate Limiting
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                    <option>No limit</option>
                    <option>Max 10 per minute</option>
                    <option>Max 100 per hour</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="mt-6">
              <h4 className="text-md font-semibold text-gray-900 mb-3">Workflow Statistics</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Executions</span>
                  <span className="text-sm font-medium text-gray-900">142</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <span className="text-sm font-medium text-green-600">96%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg. Execution Time</span>
                  <span className="text-sm font-medium text-gray-900">2.3s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Last Executed</span>
                  <span className="text-sm font-medium text-gray-900">2 hours ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}