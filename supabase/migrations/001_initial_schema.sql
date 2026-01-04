-- HipStaff PM - Supabase Schema Migration

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  team_name TEXT NOT NULL,
  product_owner_user_id INTEGER,
  project_manager_user_id INTEGER
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  supabase_user_id UUID UNIQUE,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  profile_picture_url TEXT,
  team_id INTEGER REFERENCES teams(id)
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ
);

-- Project Teams junction table
CREATE TABLE IF NOT EXISTS project_teams (
  id SERIAL PRIMARY KEY,
  team_id INTEGER NOT NULL REFERENCES teams(id),
  project_id INTEGER NOT NULL REFERENCES projects(id)
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT,
  priority TEXT,
  tags TEXT,
  start_date TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  points INTEGER,
  project_id INTEGER NOT NULL REFERENCES projects(id),
  author_user_id INTEGER NOT NULL REFERENCES users(user_id),
  assigned_user_id INTEGER REFERENCES users(user_id)
);

-- Task Assignments table
CREATE TABLE IF NOT EXISTS task_assignments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id),
  task_id INTEGER NOT NULL REFERENCES tasks(id)
);

-- Attachments table
CREATE TABLE IF NOT EXISTS attachments (
  id SERIAL PRIMARY KEY,
  file_url TEXT NOT NULL,
  file_name TEXT,
  task_id INTEGER NOT NULL REFERENCES tasks(id),
  uploaded_by_id INTEGER NOT NULL REFERENCES users(user_id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  task_id INTEGER NOT NULL REFERENCES tasks(id),
  user_id INTEGER NOT NULL REFERENCES users(user_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_author_user_id ON tasks(author_user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_user_id ON tasks(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_users_team_id ON users(team_id);
CREATE INDEX IF NOT EXISTS idx_comments_task_id ON comments(task_id);
CREATE INDEX IF NOT EXISTS idx_attachments_task_id ON attachments(task_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (allow all for authenticated users - customize as needed)
CREATE POLICY "Allow all for authenticated users" ON users FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON teams FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON projects FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON project_teams FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON tasks FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON task_assignments FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON attachments FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON comments FOR ALL TO authenticated USING (true);

-- Allow public read for demo purposes (remove in production)
CREATE POLICY "Allow public read" ON users FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public read" ON teams FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public read" ON projects FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public read" ON tasks FOR SELECT TO anon USING (true);
