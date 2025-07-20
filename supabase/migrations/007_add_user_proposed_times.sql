-- Add user proposed time fields to matches table
-- This allows each user to propose their preferred time independently

-- Add the new fields
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS user1_proposed_time TEXT,
ADD COLUMN IF NOT EXISTS user2_proposed_time TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_matches_user1_proposed_time ON matches(user1_proposed_time);
CREATE INDEX IF NOT EXISTS idx_matches_user2_proposed_time ON matches(user2_proposed_time);

-- Update status logic: if both users propose the same time, it becomes scheduled
-- This will be handled by a trigger or application logic 