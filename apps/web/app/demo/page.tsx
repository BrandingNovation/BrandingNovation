export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 mb-4">
            <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">FlowForge</h1>
          </div>
          <p className="text-xl text-gray-600">AI Workflow Automation Platform - Demo</p>
          <div className="inline-flex items-center space-x-2 mt-4 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Foundation Complete</span>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Frontend Status */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Frontend Application</h3>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">
                ✅ RUNNING
              </span>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Next.js 14 with TypeScript</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Tailwind CSS styling</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Responsive design</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Hot reload development</span>
              </li>
            </ul>
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-gray-500">Port: 3000 • Status: Active</p>
            </div>
          </div>

          {/* Backend Status */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Backend API</h3>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm font-medium">
                🔧 IN PROGRESS
              </span>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Fastify server structure</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>TypeScript configuration</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                <span>Health endpoints (pending)</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                <span>Database integration</span>
              </li>
            </ul>
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-gray-500">Port: 3001 • Status: Setup</p>
            </div>
          </div>
        </div>

        {/* Architecture Overview */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Architecture</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <span className="text-white text-sm font-bold">W</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Web App</h4>
              <p className="text-xs text-gray-600">Next.js 14, React, Tailwind</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <span className="text-white text-sm font-bold">A</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">API Server</h4>
              <p className="text-xs text-gray-600">Fastify, TypeScript, Node.js</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <span className="text-white text-sm font-bold">T</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Type System</h4>
              <p className="text-xs text-gray-600">Shared types, validation, utils</p>
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Planned Features</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Core Platform</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Visual workflow canvas</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Drag-and-drop node editor</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Real-time collaboration</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Template marketplace</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">AI & Integrations</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span>AI content generation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span>Data analysis agents</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span>Google Workspace integration</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span>Slack & HubSpot connectors</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Development Progress */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Development Progress</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Project Setup</span>
                <span className="text-sm text-green-600 font-medium">100%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full w-full"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Frontend Foundation</span>
                <span className="text-sm text-green-600 font-medium">100%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full w-full"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Backend Foundation</span>
                <span className="text-sm text-yellow-600 font-medium">70%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full w-3/4"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Core Features</span>
                <span className="text-sm text-gray-500 font-medium">0%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gray-400 h-2 rounded-full w-0"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}