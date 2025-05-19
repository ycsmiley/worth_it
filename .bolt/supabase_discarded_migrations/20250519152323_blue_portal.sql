/*
  # Email whitelist and auth settings

  1. New Tables
    - `email_whitelist`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `created_at` (timestamp)
      - `notes` (text, optional)

  2. Security
    - Enable RLS on `email_whitelist` table
    - Add policy for admins to manage whitelist
*/

-- Create email whitelist table
CREATE TABLE IF NOT EXISTS public.email_whitelist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  notes text
);

-- Enable RLS
ALTER TABLE public.email_whitelist ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage whitelist
CREATE POLICY "Admins can manage email whitelist"
  ON public.email_whitelist
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' IN (
    SELECT email FROM public.email_whitelist
    WHERE notes = 'admin'
  ));

-- Create auth hook function to check whitelist
CREATE OR REPLACE FUNCTION public.check_email_whitelist()
RETURNS trigger AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.email_whitelist
    WHERE email = NEW.email
  ) THEN
    RETURN NEW;
  ELSE
    RAISE EXCEPTION 'Email not in whitelist';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new sign ups
CREATE OR REPLACE TRIGGER check_email_whitelist_trigger
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.check_email_whitelist();