/*
  # Fix Analysis History and Request Limits

  1. Tables
    - Ensures analysis_history table exists with proper structure
    - Adds indexes for performance optimization
  
  2. Security
    - Enables RLS
    - Creates policies for user data access if they don't exist
  
  3. Functions
    - Updates request counting function with proper limits
*/

-- Create analysis history table if it doesn't exist
CREATE TABLE IF NOT EXISTS analysis_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  query text NOT NULL,
  filter text,
  result jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE analysis_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can create own analysis history" ON analysis_history;
  DROP POLICY IF EXISTS "Users can read own analysis history" ON analysis_history;
END $$;

-- Create policies
CREATE POLICY "Users can create own analysis history"
  ON analysis_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own analysis history"
  ON analysis_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS analysis_history_user_id_idx ON analysis_history(user_id);
CREATE INDEX IF NOT EXISTS analysis_history_created_at_idx ON analysis_history(created_at DESC);

-- Update function for request limits
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
  v_last_reset timestamp with time zone;
BEGIN
  -- Insert or update user limits
  INSERT INTO user_request_limits (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Check if we need to reset counts
  SELECT last_reset_at INTO v_last_reset
  FROM user_request_limits
  WHERE user_id = p_user_id;

  IF v_last_reset < now() - interval '24 hours' THEN
    UPDATE user_request_limits
    SET 
      basic_requests_used = 0,
      advanced_requests_used = 0,
      last_reset_at = now(),
      updated_at = now()
    WHERE user_id = p_user_id;
  END IF;

  -- Get current count
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