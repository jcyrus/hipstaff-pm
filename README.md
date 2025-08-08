# HipStaff PM - Monorepo

A full-stack project management application built with Next.js and Node.js.

## Structure

- `apps/client`: Next.js frontend application
- `apps/server`: Node.js/Express backend API with Prisma
- `packages/`: Shared packages (for future use)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm

### Installation

```bash
# Install dependencies for all apps
npm install

# Start development servers
npm run dev:client  # Frontend (Next.js)
npm run dev:server  # Backend (Express + Prisma)
```

### Available Scripts

- `npm run dev` - Start client in development mode
- `npm run dev:client` - Start client only
- `npm run dev:server` - Start server only
- `npm run build` - Build both client and server
- `npm run build:client` - Build client only
- `npm run build:server` - Build server only

## Applications

### Client (`apps/client`)
- **Framework**: Next.js 15 with Turbopack
- **UI**: React 19 RC, Material-UI, Tailwind CSS
- **State Management**: Redux Toolkit
- **Features**: Project management dashboard, task tracking, team collaboration

### Server (`apps/server`)
- **Framework**: Node.js with Express
- **Database**: Prisma ORM
- **Features**: REST API for projects, tasks, teams, and users

## Development

This is a monorepo using npm workspaces. Each app can be developed independently while sharing common configurations and dependencies when needed.
