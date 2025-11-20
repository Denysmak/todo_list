/*
  # Fix RLS Policies for Anonymous Role

  ## Changes
  - Grant necessary permissions to anon role
  - Update INSERT policy to work with anon role
  - Ensure registration works without authentication

  ## Security Notes
  - Only INSERT is allowed for anon users
  - SELECT/UPDATE/DELETE still require authentication
*/

-- Grant INSERT permission to anon role on users table
GRANT INSERT ON users TO anon;

-- Drop existing insert policy
DROP POLICY IF EXISTS "Enable insert for registration" ON users;

-- Create new policy that works with anon role
CREATE POLICY "Allow anonymous user registration"
  ON users
  FOR INSERT
  TO anon
  WITH CHECK (true);
