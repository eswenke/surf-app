-- Populate profiles table for existing users
-- This script creates profile entries for users who already have accounts in auth.users

-- First, create a temporary function to generate usernames from emails
CREATE OR REPLACE FUNCTION temp_generate_username_from_email(email TEXT)
RETURNS TEXT AS $$
DECLARE
  username TEXT;
BEGIN
  -- Extract part before @ symbol and remove special characters
  username := regexp_replace(split_part(email, '@', 1), '[^a-zA-Z0-9]', '', 'g');
  
  -- Ensure username is at least 3 characters
  IF length(username) < 3 THEN
    username := username || repeat('0', 3 - length(username));
  END IF;
  
  RETURN username;
END;
$$ LANGUAGE plpgsql;

-- Insert profiles for users who don't already have one
INSERT INTO profiles (id, username, created_at)
SELECT 
  au.id,
  -- Try to get username from metadata first, if not available generate from email
  COALESCE(
    (au.raw_user_meta_data->>'username')::TEXT,
    temp_generate_username_from_email(au.email) || '_' || substr(md5(random()::text), 1, 4)
  ),
  COALESCE(au.created_at, NOW())
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Drop the temporary function
DROP FUNCTION temp_generate_username_from_email;

-- Check for any duplicate usernames and make them unique
WITH duplicates AS (
  SELECT 
    id, 
    username,
    ROW_NUMBER() OVER (PARTITION BY username ORDER BY created_at) as row_num
  FROM profiles
)
UPDATE profiles p
SET username = p.username || '_' || substr(md5(random()::text), 1, 4)
FROM duplicates d
WHERE p.id = d.id AND d.row_num > 1;

-- Output the results
SELECT 'Created ' || COUNT(*) || ' new profile entries.' as result 
FROM profiles;
