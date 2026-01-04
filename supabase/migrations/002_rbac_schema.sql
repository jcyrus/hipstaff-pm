-- RBAC Schema Migration - Add Roles, Audit Logs, and Invitations

-- Create enum type for roles
CREATE TYPE user_role AS ENUM ('superadmin', 'admin', 'manager', 'member');

-- Create enum type for audit action types
CREATE TYPE audit_action AS ENUM (
  'user_created',
  'user_updated',
  'user_deleted',
  'user_role_changed',
  'user_activated',
  'user_deactivated',
  'team_created',
  'team_updated',
  'team_deleted',
  'team_member_added',
  'team_member_removed',
  'invite_created',
  'invite_accepted',
  'invite_revoked'
);

-- Update users table with role and active status
ALTER TABLE users ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'member';
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Update teams table with created_by
ALTER TABLE teams ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(user_id);

-- Create invites table
CREATE TABLE IF NOT EXISTS invites (
  id SERIAL PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
  role user_role DEFAULT 'member',
  created_by INTEGER NOT NULL REFERENCES users(user_id),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit_log table
CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  action audit_action NOT NULL,
  actor_id INTEGER NOT NULL REFERENCES users(user_id),
  target_type TEXT NOT NULL,
  target_id INTEGER,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_team junction table for multi-team support
CREATE TABLE IF NOT EXISTS user_teams (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  role user_role DEFAULT 'member',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, team_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_invites_token ON invites(token);
CREATE INDEX IF NOT EXISTS idx_invites_email ON invites(email);
CREATE INDEX IF NOT EXISTS idx_invites_expires ON invites(expires_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_user_teams_user ON user_teams(user_id);
CREATE INDEX IF NOT EXISTS idx_user_teams_team ON user_teams(team_id);

-- Update RLS policies for roles
DROP POLICY IF EXISTS "Allow all for authenticated users" ON users;
DROP POLICY IF EXISTS "Allow public read" ON users;

-- Users can read all users
CREATE POLICY "Users read all" ON users FOR SELECT TO authenticated USING (true);

-- Users can update own profile
CREATE POLICY "Users update own" ON users 
FOR UPDATE TO authenticated 
USING (auth.uid()::text = supabase_user_id OR 
  (SELECT role FROM user_teams WHERE user_id = users.user_id LIMIT 1) = 'admin' OR
  (SELECT role FROM user_teams WHERE user_id = users.user_id LIMIT 1) = 'superadmin');

-- Only superadmin can create users
CREATE POLICY "Users insert superadmin" ON users 
FOR INSERT TO authenticated 
WITH CHECK (
  (SELECT role FROM user_teams WHERE user_id = users.user_id LIMIT 1) = 'superadmin'
);

-- Teams RLS
DROP POLICY IF EXISTS "Allow all for authenticated users" ON teams;
DROP POLICY IF EXISTS "Allow public read" ON teams;

CREATE POLICY "Teams read all" ON teams FOR SELECT TO authenticated USING (true);
CREATE POLICY "Teams insert superadmin" ON teams 
FOR INSERT TO authenticated 
WITH CHECK (
  (SELECT role FROM user_teams WHERE user_id = teams.created_by LIMIT 1) = 'superadmin'
);

CREATE POLICY "Teams update admin" ON teams 
FOR UPDATE TO authenticated 
USING (
  id IN (SELECT team_id FROM user_teams WHERE user_id = auth.uid()::INTEGER AND role IN ('admin', 'superadmin'))
);

-- Invites RLS
CREATE POLICY "Invites read all" ON invites FOR SELECT TO authenticated USING (true);
CREATE POLICY "Invites insert admin" ON invites 
FOR INSERT TO authenticated 
WITH CHECK (
  (SELECT role FROM user_teams WHERE user_id = invites.created_by LIMIT 1) IN ('admin', 'superadmin')
);

CREATE POLICY "Invites update own" ON invites 
FOR UPDATE TO authenticated 
USING (created_by = auth.uid()::INTEGER);

-- Audit logs RLS - Superadmin only
CREATE POLICY "Audit log read all" ON audit_log FOR SELECT TO authenticated USING (
  (SELECT role FROM user_teams WHERE user_id = auth.uid()::INTEGER LIMIT 1) = 'superadmin'
);

CREATE POLICY "Audit log insert" ON audit_log 
FOR INSERT TO authenticated 
WITH CHECK (actor_id = auth.uid()::INTEGER);

-- User teams RLS
CREATE POLICY "User teams read own" ON user_teams FOR SELECT TO authenticated 
USING (user_id = auth.uid()::INTEGER);

CREATE POLICY "User teams insert admin" ON user_teams 
FOR INSERT TO authenticated 
WITH CHECK (
  user_id = auth.uid()::INTEGER OR
  (SELECT role FROM user_teams WHERE user_id = auth.uid()::INTEGER AND team_id = user_teams.team_id LIMIT 1) IN ('admin', 'superadmin')
);

CREATE POLICY "User teams update admin" ON user_teams 
FOR UPDATE TO authenticated 
USING (
  (SELECT role FROM user_teams WHERE user_id = auth.uid()::INTEGER AND team_id = user_teams.team_id LIMIT 1) IN ('admin', 'superadmin')
);

CREATE POLICY "User teams delete admin" ON user_teams 
FOR DELETE TO authenticated 
USING (
  user_id = auth.uid()::INTEGER OR
  (SELECT role FROM user_teams WHERE user_id = auth.uid()::INTEGER AND team_id = user_teams.team_id LIMIT 1) IN ('admin', 'superadmin')
);
