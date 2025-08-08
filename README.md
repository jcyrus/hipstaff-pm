# HipStaff PM Tool - Monorepo

A full-stack project management application built with Next.js and Node.js, powered by Turborepo and Cyrus's coffe and AI tools :D.

## Structure

- `apps/client`: Next.js frontend application
- `apps/server`: Node.js/Express backend API with Prisma
- `packages/`: Shared packages (for future use)

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn 1.22+

### Installation

```bash
# Install dependencies for all apps
yarn install
```

## Development

### Using Turborepo Commands

```bash
# Start both applications in development mode
yarn dev

# Start specific applications
yarn dev:client    # Frontend only (Next.js)
yarn dev:server    # Backend only (Express + Prisma)

# Build all applications
yarn build

# Build specific applications
yarn build:client  # Build client only
yarn build:server  # Build server only

# Lint all applications
yarn lint

# Type check all applications
yarn type-check

# Clean all build artifacts
yarn clean
```

### Turborepo Benefits

- **Fast builds**: Intelligent caching and parallelization
- **Task orchestration**: Dependency-aware task execution
- **Remote caching**: Share cache across team and CI/CD
- **Incremental builds**: Only rebuild what changed

### Running with Filters

You can target specific apps using Turborepo filters:

```bash
# Run dev for client only
turbo dev --filter=client

# Build server only
turbo build --filter=hipstaff-project-server

# Lint both apps
turbo lint --filter=client --filter=hipstaff-project-server
```

## Applications

### Client (`apps/client`)

- **Framework**: Next.js 15 with React 19 RC
- **UI**: Material-UI, Tailwind CSS
- **State Management**: Redux Toolkit
- **Features**: Project management dashboard, task tracking, team collaboration

### Server (`apps/server`)

- **Framework**: Node.js with Express
- **Database**: Prisma ORM
- **Features**: REST API for projects, tasks, teams, and users

## Turborepo Configuration

The monorepo is configured with:

- Caching for `build`, `lint`, and `type-check` tasks
- Output caching for `.next/**` and `dist/**` directories
- Dependency awareness between tasks
- Environment variable tracking

See `turbo.json` for detailed configuration.
