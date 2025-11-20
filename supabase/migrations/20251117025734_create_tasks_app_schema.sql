/*
  # Task Management SaaS - Database Schema

  ## Overview
  Complete database schema for a task management application with authentication.

  ## New Tables
  
  ### `users`
  - `id` (uuid, primary key) - Unique user identifier
  - `email` (text, unique, not null) - User email for login
  - `password_hash` (text, not null) - Bcrypt hashed password
  - `created_at` (timestamptz) - Account creation timestamp
  
  ### `tasks`
  - `id` (uuid, primary key) - Unique task identifier
  - `title` (text, not null) - Task title/description
  - `category` (text, default 'Personal') - Task category
  - `done` (boolean, default false) - Completion status
  - `user_id` (uuid, foreign key) - Reference to task owner
  - `created_at` (timestamptz) - Task creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on both tables
  - Users can only access their own data
  - Authenticated users can perform all CRUD operations on their own tasks
  - Public users can register (insert into users table)

  ## Important Notes
  1. Password hashing will be handled at the application level using bcrypt
  2. JWT-based authentication will be implemented in the API layer
  3. All task operations require authentication
  4. Tasks are isolated per user - no cross-user data access
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text DEFAULT 'Personal',
  done boolean DEFAULT false,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table

-- Allow anyone to insert (for registration)
CREATE POLICY "Anyone can create account"
  ON users
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (id::text = current_setting('app.user_id', true));

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (id::text = current_setting('app.user_id', true))
  WITH CHECK (id::text = current_setting('app.user_id', true));

-- RLS Policies for tasks table

-- Users can view only their own tasks
CREATE POLICY "Users can view own tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (user_id::text = current_setting('app.user_id', true));

-- Users can create their own tasks
CREATE POLICY "Users can create own tasks"
  ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id::text = current_setting('app.user_id', true));

-- Users can update their own tasks
CREATE POLICY "Users can update own tasks"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (user_id::text = current_setting('app.user_id', true))
  WITH CHECK (user_id::text = current_setting('app.user_id', true));

-- Users can delete their own tasks
CREATE POLICY "Users can delete own tasks"
  ON tasks
  FOR DELETE
  TO authenticated
  USING (user_id::text = current_setting('app.user_id', true));

-- Create index for faster task queries
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_done ON tasks(done);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);