/*
  # Add daily reset trigger for request limits
  
  1. New Functions
    - `reset_request_limits`: Resets request counts to 0 for all users
    - `check_and_reset_limits`: Checks if limits need to be reset based on last_reset_at
    
  2. New Trigger
    - Automatically checks and resets limits when accessing the table
    
  3. Security
    - Functions are marked as SECURITY DEFINER to run with elevated privileges
*/

-- Function to reset all request limits
CREATE OR REPLACE FUNCTION reset_request_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE user_request_limits
  SET 
    basic_requests_used = 0,
    advanced_requests_used = 0,
    last_reset_at = now(),
    updated_at = now();
END;
$$;

-- Function to check and reset limits if needed
CREATE OR REPLACE FUNCTION check_and_reset_limits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if it's been more than 24 hours since the last reset
  IF NEW.last_reset_at < now() - interval '24 hours' THEN
    -- Reset the counts for this specific user
    NEW.basic_requests_used := 0;
    NEW.advanced_requests_used := 0;
    NEW.last_reset_at := now();
    NEW.updated_at := now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to check and reset limits
CREATE TRIGGER check_reset_limits_trigger
  BEFORE UPDATE ON user_request_limits
  FOR EACH ROW
  EXECUTE FUNCTION check_and_reset_limits();

-- Create trigger to initialize last_reset_at on insert
CREATE TRIGGER initialize_reset_time_trigger
  BEFORE INSERT ON user_request_limits
  FOR EACH ROW
  EXECUTE FUNCTION check_and_reset_limits();