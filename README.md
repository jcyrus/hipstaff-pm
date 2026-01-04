# HipStaff PM

A full-stack project management application built with Next.js 15 and Supabase.

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: Material-UI, Tailwind CSS
- **State**: Redux Toolkit (RTK Query)
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## Quick Start

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Add your Supabase credentials to .env.local

# Start development server
pnpm dev
```

## Deployment

See [DEPLOY.md](./DEPLOY.md) for one-click Vercel deployment instructions.

## Project Structure

```
src/
  app/
    api/          # Next.js API routes (Supabase integration)
    home/         # Dashboard home page
    projects/     # Project management views
    priority/     # Task priority pages
    search/       # Search functionality
    settings/     # User settings
    teams/        # Team management
    timeline/     # Timeline view
    users/        # User management
  components/     # Reusable UI components
  lib/
    supabase/     # Supabase client utilities
  state/          # Redux store and RTK Query API
supabase/
  migrations/     # Database schema SQL
```

## Features

- Project and task management
- Drag-and-drop Kanban board
- Timeline/Gantt view
- Team collaboration
- User assignments
- Priority-based filtering
- Search across projects, tasks, and users

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm type-check` | Run TypeScript checks |

## License

MIT
