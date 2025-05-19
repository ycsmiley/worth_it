/*
  # Fix request limits functionality
  
  1. Changes
    - Remove automatic reset of request counts
    - Keep track of total usage without resetting
    - Maintain basic and advanced request limits
  
  2. Updates
    - Modify increment_request_count function to remove reset logic
    - Remove reset-related triggers and functions
*/

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS check_reset_limits_trigger ON user_request_limits;
DROP TRIGGER IF EXISTS initialize_reset_time_trigger ON user_request_limits;
DROP FUNCTION IF EXISTS check_and_reset_limits();
DROP FUNCTION IF EXISTS reset_request_limits();

-- Update the increment_request_count function to remove reset logic
CREATE OR REPLACE FUNCTION increment_request_count(
  p_user_id uuid,
  p_is_advanced boolean
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_basic_limit constant int := 10;
  v_advanced_limit constant int := 3;
  v_current_count int;
BEGIN
  -- Insert or update user limits
  INSERT INTO user_request_limits (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Get current count and check limits
  IF p_is_advanced THEN
    SELECT advanced_requests_used INTO v_current_count
    FROM user_request_limits
    WHERE user_id = p_user_id;

    IF v_current_count >= v_advanced_limit THEN
      RETURN false;
    END IF;

    -- Increment advanced count
    UPDATE user_request_limits
    SET advanced_requests_used = advanced_requests_used + 1,
        updated_at = now()
    WHERE user_id = p_user_id;
  ELSE
    SELECT basic_requests_used INTO v_current_count
    FROM user_request_limits
    WHERE user_id = p_user_id;

    IF v_current_count >= v_basic_limit THEN
      RETURN false;
    END IF;

    -- Increment basic count
    UPDATE user_request_limits
    SET basic_requests_used = basic_requests_used + 1,
        updated_at = now()
    WHERE user_id = p_user_id;
  END IF;

  RETURN true;
END;
$$;