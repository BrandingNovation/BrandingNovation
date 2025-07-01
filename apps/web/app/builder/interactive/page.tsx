'use client';

import { useCallback, useState } from 'react';
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
} from 'reactflow';
import 'reactflow/dist/style.css';
import { v4 as uuidv4 } from 'uuid';

// Custom Node Components
const TriggerNode = ({ data, selected }: any) => (
  <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-blue-500' : 'border-gray-200'} min-w-[150px]`}>
    <div className="flex items-center">
      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white mr-3">
        ⚡
      </div>
      <div>
        <div className="text-sm font-bold">{data.label}</div>
        <div className="text-xs text-gray-500">{data.type}</div>
      </div>
    </div>
  </div>
);

const EmailNode = ({ data, selected }: any) => (
  <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-blue-500' : 'border-gray-200'} min-w-[150px]`}>
    <div className="flex items-center">
      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white mr-3">
        📧
      </div>
      <div>
        <div className="text-sm font-bold">{data.label}</div>
        <div className="text-xs text-gray-500">Email Action</div>
      </div>
    </div>
  </div>
);

const ConditionNode = ({ data, selected }: any) => (
  <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-blue-500' : 'border-gray-200'} min-w-[150px]`}>
    <div className="flex items-center">
      <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white mr-3">
        🔀
      </div>
      <div>
        <div className="text-sm font-bold">{data.label}</div>
        <div className="text-xs text-gray-500">Condition</div>
      </div>
    </div>
  </div>
);

const AIAgentNode = ({ data, selected }: any) => (
  <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-blue-500' : 'border-purple-200'} min-w-[150px] bg-gradient-to-r from-purple-50 to-indigo-50`}>
    <div className="flex items-center">
      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center text-white mr-3">
        🤖
      </div>
      <div>
        <div className="text-sm font-bold">{data.label}</div>
        <div className="text-xs text-purple-600">AI Agent</div>
      </div>
    </div>
  </div>
);

const DelayNode = ({ data, selected }: any) => (
  <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-blue-500' : 'border-gray-200'} min-w-[150px]`}>
    <div className="flex items-center">
      <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center text-white mr-3">
        ⏰
      </div>
      <div>
        <div className="text-sm font-bold">{data.label}</div>
        <div className="text-xs text-gray-500">Delay</div>
      </div>
    </div>
  </div>
);

const CRMNode = ({ data, selected }: any) => (
  <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-blue-500' : 'border-gray-200'} min-w-[150px]`}>
    <div className="flex items-center">
      <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center text-white mr-3">
        📊
      </div>
      <div>
        <div className="text-sm font-bold">{data.label}</div>
        <div className="text-xs text-gray-500">CRM Integration</div>
      </div>
    </div>
  </div>
);

const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  email: EmailNode,
  condition: ConditionNode,
  aiAgent: AIAgentNode,
  delay: DelayNode,
  crm: CRMNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'trigger',
    position: { x: 100, y: 100 },
    data: { label: 'New Customer', type: 'Webhook' },
  },
  {
    id: '2',
    type: 'email',
    position: { x: 350, y: 100 },
    data: { label: 'Welcome Email' },
  },
  {
    id: '3',
    type: 'delay',
    position: { x: 600, y: 100 },
    data: { label: 'Wait 24h' },
  },
  {
    id: '4',
    type: 'condition',
    position: { x: 850, y: 100 },
    data: { label: 'Email Opened?' },
  },
  {
    id: '5',
    type: 'email',
    position: { x: 1100, y: 50 },
    data: { label: 'Follow-up Email' },
  },
  {
    id: '6',
    type: 'crm',
    position: { x: 1100, y: 150 },
    data: { label: 'Add to CRM' },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' },
  { id: 'e2-3', source: '2', target: '3', type: 'smoothstep' },
  { id: 'e3-4', source: '3', target: '4', type: 'smoothstep' },
  { id: 'e4-5', source: '4', target: '5', type: 'smoothstep', label: 'Yes' },
  { id: 'e4-6', source: '4', target: '6', type: 'smoothstep', label: 'No' },
];

export default function InteractiveBuilderPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds: Edge[]) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const addNode = (type: string) => {
    const newNode: Node = {
      id: uuidv4(),
      type,
      position: { x: Math.random() * 300 + 100, y: Math.random() * 300 + 100 },
      data: { 
        label: getNodeLabel(type),
        type: getNodeSubtype(type)
      },
    };
    setNodes((nds: Node[]) => nds.concat(newNode));
  };

  const getNodeLabel = (type: string) => {
    const labels = {
      trigger: 'New Trigger',
      email: 'Send Email',
      condition: 'Check Condition',
      aiAgent: 'AI Assistant',
      delay: 'Wait',
      crm: 'Update CRM'
    };
    return labels[type as keyof typeof labels] || 'New Node';
  };

  const getNodeSubtype = (type: string) => {
    const subtypes = {
      trigger: 'Webhook',
      email: 'Template',
      condition: 'Logic',
      aiAgent: 'OpenAI',
      delay: 'Timer',
      crm: 'HubSpot'
    };
    return subtypes[type as keyof typeof subtypes] || 'Action';
  };

  const runWorkflow = async () => {
    setIsRunning(true);
    // Simulate workflow execution
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRunning(false);
  };

  const saveWorkflow = () => {
    const workflow = {
      nodes,
      edges,
      metadata: {
        name: 'Customer Onboarding Flow',
        created: new Date().toISOString(),
        nodeCount: nodes.length,
        edgeCount: edges.length
      }
    };
    console.log('Saving workflow:', workflow);
    // Here you would send to your API
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <a href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="text-xl font-bold text-gray-900">FlowForge</span>
            </a>
            <div className="text-sm text-gray-500">
              <span>Interactive Workflow Builder</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={saveWorkflow}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Save Workflow
            </button>
            <button
              onClick={runWorkflow}
              disabled={isRunning}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                isRunning 
                  ? 'bg-green-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isRunning ? '🔄 Running...' : '▶ Test Run'}
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Node Library Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Node Library</h2>
          
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700 mb-2">Basic Nodes</div>
            {[
              { type: 'trigger', label: 'Trigger', icon: '⚡', color: 'bg-green-500' },
              { type: 'email', label: 'Email', icon: '📧', color: 'bg-blue-500' },
              { type: 'delay', label: 'Delay', icon: '⏰', color: 'bg-yellow-500' },
              { type: 'condition', label: 'Condition', icon: '🔀', color: 'bg-purple-500' },
              { type: 'crm', label: 'CRM', icon: '📊', color: 'bg-red-500' },
            ].map((nodeType) => (
              <button
                key={nodeType.type}
                onClick={() => addNode(nodeType.type)}
                className="w-full p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 ${nodeType.color} rounded-lg flex items-center justify-center text-white text-lg`}>
                    {nodeType.icon}
                  </div>
                  <span className="font-medium text-gray-900">{nodeType.label}</span>
                </div>
              </button>
            ))}

            <div className="text-sm font-medium text-gray-700 mb-2 mt-6">AI Agents</div>
            <button
              onClick={() => addNode('aiAgent')}
              className="w-full p-3 border border-purple-200 rounded-lg bg-purple-50 hover:shadow-md transition-shadow cursor-pointer text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center text-white">
                  🤖
                </div>
                <span className="font-medium text-gray-900">AI Agent</span>
              </div>
            </button>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Workflow Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Nodes:</span>
                <span className="font-medium">{nodes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Connections:</span>
                <span className="font-medium">{edges.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${isRunning ? 'text-green-600' : 'text-gray-900'}`}>
                  {isRunning ? 'Running' : 'Ready'}
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
            className="bg-gray-50"
          >
            <Controls className="bg-white border border-gray-200 rounded-lg" />
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} className="opacity-30" />
            <MiniMap 
              className="bg-white border border-gray-200 rounded-lg"
              nodeColor="rgb(59, 130, 246)"
              maskColor="rgba(0, 0, 0, 0.1)"
            />
          </ReactFlow>

          {/* Floating Instructions */}
          <div className="absolute top-4 left-4 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-sm">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">ℹ</span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-900">Interactive Builder</h4>
                <p className="text-sm text-blue-700 mt-1">
                  • Drag nodes from the library<br/>
                  • Connect nodes by dragging from handles<br/>
                  • Click nodes to select and configure<br/>
                  • Use controls to zoom and pan
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Properties Panel */}
        <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedNode ? 'Node Properties' : 'Workflow Properties'}
          </h3>
          
          {selectedNode ? (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">{selectedNode.data.label}</h4>
                <p className="text-sm text-gray-600 mb-4">Node ID: {selectedNode.id}</p>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Node Name
                    </label>
                    <input
                      type="text"
                      value={selectedNode.data.label}
                                             onChange={(e) => {
                         setNodes((nds: Node[]) =>
                           nds.map((node: Node) =>
                             node.id === selectedNode.id
                               ? { ...node, data: { ...node.data, label: e.target.value } }
                               : node
                           )
                         );
                         setSelectedNode({...selectedNode, data: {...selectedNode.data, label: e.target.value}});
                       }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>

                  {selectedNode.type === 'trigger' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Trigger Type
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                        <option>Webhook</option>
                        <option>Schedule</option>
                        <option>Manual</option>
                      </select>
                    </div>
                  )}

                  {selectedNode.type === 'email' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Template
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                        <option>Welcome Email</option>
                        <option>Follow-up Email</option>
                        <option>Custom Template</option>
                      </select>
                    </div>
                  )}

                  {selectedNode.type === 'aiAgent' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        AI Model
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                        <option>GPT-4</option>
                        <option>GPT-3.5 Turbo</option>
                        <option>Claude-3</option>
                      </select>
                    </div>
                  )}

                  <button
                                         onClick={() => {
                       setNodes((nds: Node[]) => nds.filter((node: Node) => node.id !== selectedNode.id));
                       setEdges((eds: Edge[]) => eds.filter((edge: Edge) => 
                         edge.source !== selectedNode.id && edge.target !== selectedNode.id
                       ));
                       setSelectedNode(null);
                     }}
                    className="w-full px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100"
                  >
                    Delete Node
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Workflow Overview</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Nodes:</span>
                    <span className="font-medium">{nodes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Connections:</span>
                    <span className="font-medium">{edges.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Triggers:</span>
                    <span className="font-medium">{nodes.filter(n => n.type === 'trigger').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">AI Agents:</span>
                    <span className="font-medium">{nodes.filter(n => n.type === 'aiAgent').length}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Quick Actions</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => addNode('aiAgent')}
                    className="w-full px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
                  >
                    + Add AI Agent
                  </button>
                  <button
                    onClick={() => {
                      setNodes([]);
                      setEdges([]);
                      setSelectedNode(null);
                    }}
                    className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Clear Canvas
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}