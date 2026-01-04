# Changelog

All notable changes to HipStaff PM will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.8.0] - 2026-01-05

### Changed

- **Architecture: Monorepo to Monolith Migration**
  - Migrated from Turborepo monorepo structure (`apps/client` + `apps/server`) to a unified Next.js 16 monolith
  - Replaced Express.js backend with Next.js API routes
  - Replaced PostgreSQL/Prisma ORM with Supabase (PostgreSQL + Auth + Realtime)
  - Implementation: Entire codebase restructured under `src/`

### Added

- **Authentication & Authorization**
  - Supabase Auth integration with email/password login
  - RBAC-based route protection via Next.js Proxy (`src/proxy.ts`)
  - Role-based access control for admin, manager, and user routes
  - User menu dropdown with avatar in navbar
  - Sign out functionality with proper session cleanup
  - Implementation: `src/proxy.ts`, `src/app/(auth)/login/page.tsx`

- **Route Organization**
  - Route groups for auth `(auth)` and main `(main)` layouts
  - Separate layouts for authenticated dashboard and public auth pages
  - Implementation: `src/app/(auth)/layout.tsx`, `src/app/(main)/layout.tsx`

- **Performance Optimizations**
  - Skeleton loading states for dashboard components
  - Suspense boundaries for `useSearchParams` hooks
  - Optimized proxy to skip expensive auth checks for unauthenticated users
  - PersistGate loading indicator instead of blank screen
  - Implementation: `src/app/(main)/home/page.tsx`, `src/app/redux.tsx`

- **UI Components**
  - User avatar menu with profile link and logout
  - Login form skeleton placeholder
  - Dashboard skeleton with chart and table placeholders
  - Implementation: `src/components/Navbar/index.tsx`

### Fixed

- **Deprecated Supabase SSR Signature**
  - Updated `createServerClient` cookie methods to use required `options` type
  - Removed deprecated `CookieOptions` optional parameter pattern
  - Implementation: `src/lib/supabase/server.ts`

- **Next.js 16 Proxy Migration**
  - Renamed `middleware.ts` to `proxy.ts` per Next.js 16 convention
  - Moved proxy file to `src/` directory for proper detection
  - Added static asset exclusion to prevent redirect loops
  - Fixed matcher regex to exclude JS/CSS chunks
  - Implementation: `src/proxy.ts`

- **Blank Screen Loading Issues**
  - Fixed 5-second blank screen caused by `PersistGate loading={null}`
  - Added Suspense boundary for `useSearchParams` in login page
  - Optimized login page to skip expensive Supabase calls when no auth cookies present

### Removed

- **Monorepo Structure**
  - Removed `apps/client` (Next.js frontend)
  - Removed `apps/server` (Express.js backend)
  - Removed `turbo.json` and Turborepo configuration
  - Removed `yarn.lock` in favor of `pnpm-lock.yaml`

- **Legacy Dependencies**
  - Removed Express.js and related middleware
  - Removed Prisma ORM and PostgreSQL direct connection
  - Removed `@supabase/auth-helpers-nextjs` (replaced with `@supabase/ssr`)

---

## [0.7.x and Earlier] - Legacy Monorepo

Previous versions used a Turborepo monorepo structure with:
- **Frontend** (`apps/client`): Next.js 14 with Redux Toolkit, RTK Query
- **Backend** (`apps/server`): Express.js with Prisma ORM, PostgreSQL
- **Shared**: Task management, project views (Board, List, Timeline, Table)

This version marks a complete architectural overhaul to simplify deployment and leverage Supabase's managed infrastructure.
