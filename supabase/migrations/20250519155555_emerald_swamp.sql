/*
  # Add request limits tracking

  1. New Tables
    - `user_request_limits`
      - `user_id` (uuid, references auth.users)
      - `basic_requests_used` (int, default 0)
      - `advanced_requests_used` (int, default 0)
      - `last_reset_at` (timestamp)
  
  2. Security
    - Enable RLS on `user_request_limits` table
    - Add policy for users to read their own limits
*/

CREATE TABLE IF NOT EXISTS user_request_limits (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id),
  basic_requests_used integer NOT NULL DEFAULT 0,
  advanced_requests_used integer NOT NULL DEFAULT 0,
  last_reset_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE user_request_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own request limits"
  ON user_request_limits
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to increment request count
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