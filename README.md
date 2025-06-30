# FlowForge - AI Workflow Automation Platform

🚀 **Democratizing AI automation by making enterprise-grade workflows accessible to every business user**

## Overview

FlowForge is a visual AI workflow automation platform that empowers business users to build sophisticated automation pipelines without coding. By combining intuitive drag-and-drop workflow creation with powerful AI agents, FlowForge bridges the gap between simple automation tools and complex enterprise solutions.

## Key Features

- **Visual Workflow Canvas**: Intuitive drag-and-drop interface for building complex workflows
- **AI-Powered Agents**: Smart automation with content generation, data analysis, and decision routing
- **Rich Integrations**: Connect with popular business tools (Google Workspace, Slack, HubSpot, etc.)
- **Smart Triggers**: Manual, scheduled, webhook, and data-change triggers
- **Team Collaboration**: Real-time editing, sharing, and workspace management
- **Template Marketplace**: Community-driven workflow templates

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, React Flow
- **Backend**: Node.js, Fastify, PostgreSQL, MongoDB, Redis
- **Infrastructure**: AWS, Docker, Kubernetes
- **AI Services**: OpenAI, Anthropic, Google AI with multi-provider fallback

## Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/flowforge.git
cd flowforge

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development servers
npm run dev

# Start backend services
npm run dev:backend
```

## Project Structure

```
flowforge/
├── apps/
│   ├── web/                 # Next.js frontend application
│   ├── api/                 # Node.js backend API
│   └── mobile/              # React Native mobile app (future)
├── packages/
│   ├── ui/                  # Shared UI components
│   ├── ai-agents/           # AI agent implementations
│   ├── integrations/        # Third-party integrations
│   └── shared/              # Shared utilities and types
├── infrastructure/          # AWS CDK infrastructure code
├── docs/                    # Documentation and guides
└── tools/                   # Development and build tools
```

## Development

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- AWS CLI (for deployment)
- PostgreSQL 14+
- Redis 6+

### Environment Setup

1. Copy environment configuration:
   ```bash
   cp .env.example .env.local
   ```

2. Start local services:
   ```bash
   docker-compose up -d
   ```

3. Run database migrations:
   ```bash
   npm run db:migrate
   ```

4. Start development servers:
   ```bash
   npm run dev
   ```

## Architecture

FlowForge follows a microservices architecture with:

- **Web Application**: Next.js with server-side rendering
- **API Gateway**: Fastify-based REST and GraphQL APIs
- **Workflow Engine**: BullMQ-based job processing
- **Database Layer**: PostgreSQL for metadata, MongoDB for workflow definitions
- **Cache Layer**: Redis for sessions and temporary data
- **AI Services**: Multi-provider integration with fallback mechanisms

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📧 Email: support@flowforge.ai
- 💬 Discord: [Join our community](https://discord.gg/flowforge)
- 📖 Docs: [docs.flowforge.ai](https://docs.flowforge.ai)

## Roadmap

- ✅ **Phase 1** (Months 1-4): MVP with core workflow canvas and 3 AI agents
- 🔄 **Phase 2** (Months 5-6): Public launch with team collaboration
- 📋 **Phase 3** (Months 7-9): Mobile app and advanced features
- 🎯 **Phase 4** (Months 10-12): Enterprise features and global expansion

---

Built with ❤️ by the FlowForge team
