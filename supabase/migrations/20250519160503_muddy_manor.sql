/*
  # Add request limits functionality

  1. New Functions
    - `initialize_user_limits`: Creates initial limits for new users
    - `handle_new_user`: Trigger function to initialize limits for new users

  2. Triggers
    - Add trigger on auth.users to initialize limits for new users
*/

-- Function to initialize limits for new users
CREATE OR REPLACE FUNCTION initialize_user_limits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_request_limits (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger to initialize limits for new users
CREATE TRIGGER handle_new_user
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_limits();