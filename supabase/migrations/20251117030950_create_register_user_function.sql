/*
  # Create User Registration Function

  ## Changes
  - Create a PostgreSQL function to handle user registration
  - This bypasses RLS and runs with elevated privileges
  - Function is callable by anon role for registration

  ## Security
  - Function validates input
  - Checks for duplicate emails
  - Returns user data without exposing password hash
*/

-- Create function for user registration
CREATE OR REPLACE FUNCTION register_user(
  p_email TEXT,
  p_password_hash TEXT
)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id UUID;
  v_result JSON;
BEGIN
  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM users WHERE email = p_email) THEN
    RAISE EXCEPTION 'Email already registered';
  END IF;

  -- Insert new user
  INSERT INTO users (email, password_hash)
  VALUES (p_email, p_password_hash)
  RETURNING id INTO v_user_id;

  -- Return user data
  SELECT json_build_object(
    'id', id,
    'email', email,
    'created_at', created_at
  )
  INTO v_result
  FROM users
  WHERE id = v_user_id;

  RETURN v_result;
END;
$$;

-- Grant execute permission to anon role
GRANT EXECUTE ON FUNCTION register_user(TEXT, TEXT) TO anon;
