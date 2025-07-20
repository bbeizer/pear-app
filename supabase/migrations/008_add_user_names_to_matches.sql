-- Add user names to matches table for better UI display
-- This allows showing proper names instead of "User 1" and "User 2"

-- Add the new name fields
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS user1_name TEXT,
ADD COLUMN IF NOT EXISTS user2_name TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_matches_user1_name ON matches(user1_name);
CREATE INDEX IF NOT EXISTS idx_matches_user2_name ON matches(user2_name);

-- Update existing matches with user names from profiles
UPDATE matches 
SET user1_name = (
    SELECT name FROM profiles WHERE id = matches.user1_id
),
user2_name = (
    SELECT name FROM profiles WHERE id = matches.user2_id
)
WHERE user1_name IS NULL OR user2_name IS NULL; 