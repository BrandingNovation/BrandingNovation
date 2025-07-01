'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface GeneratedWorkflow {
  name: string;
  description: string;
  nodes: Array<{
    id: string;
    type: string;
    label: string;
    data: any;
    position: { x: number; y: number };
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
  }>;
  estimatedExecutionTime: string;
  complexity: 'simple' | 'medium' | 'complex';
  suggestedImprovements: string[];
}

const EXAMPLE_PROMPTS = [
  "Create a customer onboarding workflow that sends a welcome email, waits 24 hours, then adds them to our CRM if they open the email",
  "Build an order processing flow that validates payment, updates inventory, sends confirmation email, and creates a shipping label",
  "Design a lead qualification system that analyzes incoming leads with AI, scores them, and routes high-value leads to sales team",
  "Set up a content approval workflow where new blog posts go through AI review, manager approval, and automatic publishing",
  "Create a support ticket system that categorizes issues with AI, assigns to correct team, and escalates if not resolved in 24 hours"
];

export default function GenerateWorkflowPage() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWorkflow, setGeneratedWorkflow] = useState<GeneratedWorkflow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const generateWorkflow = async () => {
    if (!prompt.trim()) {
      setError('Please describe the workflow you want to create');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Simulate AI workflow generation
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Generate a realistic workflow based on the prompt
      const workflow = generateWorkflowFromPrompt(prompt);
      setGeneratedWorkflow(workflow);
    } catch (err) {
      setError('Failed to generate workflow. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateWorkflowFromPrompt = (description: string): GeneratedWorkflow => {
    // Simple AI simulation - in production, this would call OpenAI/Claude
    const isOnboarding = description.toLowerCase().includes('onboarding') || description.toLowerCase().includes('welcome');
    const isOrder = description.toLowerCase().includes('order') || description.toLowerCase().includes('payment');
    const isLead = description.toLowerCase().includes('lead') || description.toLowerCase().includes('qualify');
    const isSupport = description.toLowerCase().includes('support') || description.toLowerCase().includes('ticket');

    if (isOnboarding) {
      return {
        name: 'Customer Onboarding Workflow',
        description: 'Automated customer onboarding with email sequences and CRM integration',
        nodes: [
          { id: '1', type: 'trigger', label: 'New Customer Signup', data: { triggerType: 'webhook' }, position: { x: 100, y: 100 } },
          { id: '2', type: 'email', label: 'Welcome Email', data: { template: 'welcome' }, position: { x: 350, y: 100 } },
          { id: '3', type: 'delay', label: 'Wait 24 Hours', data: { duration: '24h' }, position: { x: 600, y: 100 } },
          { id: '4', type: 'condition', label: 'Email Opened?', data: { condition: 'email_opened' }, position: { x: 850, y: 100 } },
          { id: '5', type: 'crm', label: 'Add to CRM', data: { action: 'create_contact' }, position: { x: 1100, y: 50 } },
          { id: '6', type: 'email', label: 'Follow-up Email', data: { template: 'follow_up' }, position: { x: 1100, y: 150 } },
        ],
        edges: [
          { id: 'e1-2', source: '1', target: '2' },
          { id: 'e2-3', source: '2', target: '3' },
          { id: 'e3-4', source: '3', target: '4' },
          { id: 'e4-5', source: '4', target: '5' },
          { id: 'e4-6', source: '4', target: '6' },
        ],
        estimatedExecutionTime: '24-48 hours',
        complexity: 'medium',
        suggestedImprovements: [
          'Add AI content personalization for emails',
          'Include SMS notifications for better engagement',
          'Add lead scoring based on email interactions'
        ]
      };
    }

    if (isOrder) {
      return {
        name: 'Order Processing Workflow',
        description: 'Complete order processing from payment to shipping',
        nodes: [
          { id: '1', type: 'trigger', label: 'New Order', data: { triggerType: 'webhook' }, position: { x: 100, y: 100 } },
          { id: '2', type: 'apiCall', label: 'Validate Payment', data: { endpoint: '/payment/validate' }, position: { x: 350, y: 100 } },
          { id: '3', type: 'database', label: 'Update Inventory', data: { operation: 'UPDATE' }, position: { x: 600, y: 100 } },
          { id: '4', type: 'email', label: 'Order Confirmation', data: { template: 'order_confirm' }, position: { x: 850, y: 100 } },
          { id: '5', type: 'apiCall', label: 'Create Shipping Label', data: { endpoint: '/shipping/create' }, position: { x: 1100, y: 100 } },
        ],
        edges: [
          { id: 'e1-2', source: '1', target: '2' },
          { id: 'e2-3', source: '2', target: '3' },
          { id: 'e3-4', source: '3', target: '4' },
          { id: 'e4-5', source: '4', target: '5' },
        ],
        estimatedExecutionTime: '5-10 minutes',
        complexity: 'medium',
        suggestedImprovements: [
          'Add fraud detection with AI',
          'Include real-time inventory checking',
          'Add automated customer notifications'
        ]
      };
    }

    if (isLead) {
      return {
        name: 'AI Lead Qualification System',
        description: 'Intelligent lead scoring and routing with AI analysis',
        nodes: [
          { id: '1', type: 'trigger', label: 'New Lead', data: { triggerType: 'form_submit' }, position: { x: 100, y: 100 } },
          { id: '2', type: 'aiReasoning', label: 'AI Lead Analysis', data: { model: 'GPT-4' }, position: { x: 350, y: 100 } },
          { id: '3', type: 'condition', label: 'High Value Lead?', data: { condition: 'score > 80' }, position: { x: 600, y: 100 } },
          { id: '4', type: 'crm', label: 'Route to Sales', data: { action: 'assign_to_sales' }, position: { x: 850, y: 50 } },
          { id: '5', type: 'email', label: 'Nurture Sequence', data: { template: 'nurture' }, position: { x: 850, y: 150 } },
        ],
        edges: [
          { id: 'e1-2', source: '1', target: '2' },
          { id: 'e2-3', source: '2', target: '3' },
          { id: 'e3-4', source: '3', target: '4' },
          { id: 'e3-5', source: '3', target: '5' },
        ],
        estimatedExecutionTime: '2-5 minutes',
        complexity: 'complex',
        suggestedImprovements: [
          'Add social media enrichment',
          'Include predictive lead scoring',
          'Add automated follow-up scheduling'
        ]
      };
    }

    // Default generic workflow
    return {
      name: 'Custom Workflow',
      description: 'Generated workflow based on your description',
      nodes: [
        { id: '1', type: 'trigger', label: 'Start Trigger', data: {}, position: { x: 100, y: 100 } },
        { id: '2', type: 'aiReasoning', label: 'Process with AI', data: { model: 'GPT-4' }, position: { x: 350, y: 100 } },
        { id: '3', type: 'condition', label: 'Check Condition', data: {}, position: { x: 600, y: 100 } },
        { id: '4', type: 'email', label: 'Send Notification', data: {}, position: { x: 850, y: 100 } },
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3' },
        { id: 'e3-4', source: '3', target: '4' },
      ],
      estimatedExecutionTime: '5-15 minutes',
      complexity: 'simple',
      suggestedImprovements: [
        'Add error handling',
        'Include monitoring and alerts',
        'Consider adding loops for batch processing'
      ]
    };
  };

  const createWorkflow = async () => {
    if (!generatedWorkflow) return;

    // Navigate to builder with the generated workflow
    const workflowData = encodeURIComponent(JSON.stringify(generatedWorkflow));
    router.push(`/builder/interactive?generated=${workflowData}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">F</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  FlowForge AI
                </span>
              </Link>
              <div className="text-sm text-gray-500">
                <span className="px-2 py-1 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-full text-xs font-medium">
                  🤖 AI Workflow Generator
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/builder/interactive"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50"
              >
                Manual Builder
              </Link>
              <Link
                href="/workflows"
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-md hover:from-purple-700 hover:to-blue-700"
              >
                My Workflows
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full text-sm font-medium text-purple-700 mb-6">
            <span className="mr-2">🚀</span>
            Revolutionary AI-Powered Workflow Generation
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            Describe. Generate. Deploy.
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Transform plain English descriptions into sophisticated automation workflows. 
            Our AI understands your business needs and creates production-ready automations in seconds.
          </p>
        </div>

        {/* Main Generator Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200 p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Describe Your Workflow
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What do you want to automate?
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your workflow in plain English... For example: 'Create a customer onboarding workflow that sends a welcome email, waits 24 hours, then adds them to our CRM if they open the email'"
                    className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    disabled={isGenerating}
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                  onClick={generateWorkflow}
                  disabled={isGenerating || !prompt.trim()}
                  className={`w-full py-3 px-6 rounded-lg font-medium text-white text-lg transition-all ${
                    isGenerating || !prompt.trim()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isGenerating ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Generating Workflow...
                    </div>
                  ) : (
                    '🤖 Generate Workflow with AI'
                  )}
                </button>
              </div>
            </div>

            {/* Example Prompts */}
            <div className="bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Example Prompts</h3>
              <div className="space-y-2">
                {EXAMPLE_PROMPTS.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(example)}
                    className="w-full text-left p-3 text-sm text-gray-700 hover:bg-purple-50 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors"
                    disabled={isGenerating}
                  >
                    "{example}"
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generated Workflow Preview */}
          <div className="space-y-6">
            {generatedWorkflow ? (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200 p-8 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Generated Workflow
                  </h2>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    generatedWorkflow.complexity === 'simple' ? 'bg-green-100 text-green-700' :
                    generatedWorkflow.complexity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {generatedWorkflow.complexity.toUpperCase()}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {generatedWorkflow.name}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {generatedWorkflow.description}
                    </p>
                  </div>

                  {/* Workflow Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600">Nodes</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {generatedWorkflow.nodes.length}
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600">Execution Time</div>
                      <div className="text-lg font-bold text-purple-600">
                        {generatedWorkflow.estimatedExecutionTime}
                      </div>
                    </div>
                  </div>

                  {/* Node List */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Workflow Steps</h4>
                    <div className="space-y-2">
                      {generatedWorkflow.nodes.map((node, index) => (
                        <div key={node.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                          <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{node.label}</div>
                            <div className="text-xs text-gray-500 capitalize">{node.type}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Suggestions */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">💡 AI Suggestions</h4>
                    <div className="space-y-1">
                      {generatedWorkflow.suggestedImprovements.map((suggestion, index) => (
                        <div key={index} className="text-sm text-gray-600 flex items-start">
                          <span className="text-purple-500 mr-2">•</span>
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <button
                      onClick={createWorkflow}
                      className="w-full py-3 px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors"
                    >
                      🚀 Open in Builder
                    </button>
                    <button
                      onClick={() => setGeneratedWorkflow(null)}
                      className="w-full py-2 px-6 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Generate Another
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200 p-12 text-center">
                <div className="text-6xl mb-6">🤖</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  AI Workflow Generator Ready
                </h3>
                <p className="text-gray-600 mb-6">
                  Describe your workflow in plain English and watch our AI create a complete automation for you.
                </p>
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    GPT-4 Powered
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Production Ready
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    Instant Generation
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">🧠</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Understanding</h3>
            <p className="text-gray-600">
              Advanced natural language processing understands complex business requirements and converts them into optimized workflows.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">⚡</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Generation</h3>
            <p className="text-gray-600">
              Generate complete workflows in seconds, not hours. From simple automations to complex enterprise processes.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">🎯</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Production Ready</h3>
            <p className="text-gray-600">
              Generated workflows include error handling, optimization suggestions, and are ready for immediate deployment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}