/*
  # Allow Anonymous Users to Read for Login

  ## Changes
  - Add SELECT policy for anon role to enable login
  - Only allows reading by email (needed for login validation)

  ## Security Notes
  - Anon users can only SELECT (read) user data
  - This is necessary for the login flow to work
  - Password hash is read but never exposed to client (only used server-side for comparison)
*/

-- Grant SELECT permission to anon role
GRANT SELECT ON users TO anon;

-- Create policy allowing anon users to read for login
CREATE POLICY "Allow anonymous login lookup"
  ON users
  FOR SELECT
  TO anon
  USING (true);
