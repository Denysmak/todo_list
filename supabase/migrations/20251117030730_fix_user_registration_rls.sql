/*
  # Fix User Registration RLS Policy

  ## Changes
  - Drop the existing restrictive INSERT policy for users table
  - Create a new policy that allows anyone to insert users without restrictions
  - This enables user registration to work properly

  ## Security Notes
  - Registration is open by design (public sign-up)
  - Password hashing is handled at application layer
  - User isolation is enforced on the tasks table
*/

-- Drop the existing policy that's too restrictive
DROP POLICY IF EXISTS "Anyone can create account" ON users;

-- Create a more permissive policy for user registration
CREATE POLICY "Enable insert for registration"
  ON users
  FOR INSERT
  WITH CHECK (true);
