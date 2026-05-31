# HipStaff PM

A full-stack project management application built with Next.js 15, Prisma ORM, and Auth.js v5.
Works with any standard PostgreSQL database — no proprietary backend required.

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: Material-UI, Tailwind CSS
- **State**: Redux Toolkit (RTK Query)
- **ORM**: Prisma 7
- **Auth**: Auth.js v5 (Credentials provider, bcrypt)
- **Database**: PostgreSQL (any provider)
- **Deployment**: Vercel

## Quick Start

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local — set DATABASE_URL and generate NEXTAUTH_SECRET:
#   openssl rand -base64 32

# Apply database schema
pnpm prisma migrate deploy

# Start development server
pnpm dev
```

## Deployment

See [DEPLOY.md](./DEPLOY.md) for deployment instructions.

## Project Structure

```text
  app/
    api/          # Next.js API routes (Prisma + Auth.js)
    (auth)/       # Login page
    (main)/       # Dashboard, projects, tasks, teams, etc.
  components/     # Reusable UI components
  lib/
    auth.ts       # requireAuth / requireAdmin helpers
    audit.ts      # Audit log helpers
    db.ts         # Prisma client singleton
    rbac/         # Role types and constants
  auth.ts         # Auth.js configuration
  auth.config.ts  # Edge-safe Auth.js config (used by middleware)
  middleware.ts   # Route protection
  state/          # Redux store and RTK Query API
prisma/
  schema.prisma   # Database schema
  migrations/     # Prisma migration history
```

## Features

- Project and task management
- Drag-and-drop Kanban board
- Timeline/Gantt view
- Team collaboration with role-based access control
- User assignments and priority-based filtering
- Search across projects, tasks, and users
- Invite system with email-based team onboarding
- Audit logging for all admin actions

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm type-check` | Run TypeScript checks |
| `pnpm prisma migrate dev` | Create and apply a new migration |
| `pnpm prisma studio` | Open Prisma database browser |

## License

MIT
