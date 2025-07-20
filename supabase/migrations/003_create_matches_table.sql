-- Create matches table for mutual swipes
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    meeting_type TEXT CHECK (meeting_type IN ('in-person', 'video')),
    suggested_activity TEXT,
    suggested_venue TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user1_id, user2_id) -- Prevent duplicate matches
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_matches_user1_id ON matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2_id ON matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_created_at ON matches(created_at DESC);

-- Ensure likes table is completely dropped
DROP TABLE IF EXISTS likes;

-- Update swipes table to use suggested_meeting_type instead of meeting_type
ALTER TABLE swipes 
DROP COLUMN IF EXISTS meeting_type;

-- Add suggested_meeting_type if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'swipes' AND column_name = 'suggested_meeting_type') THEN
        ALTER TABLE swipes ADD COLUMN suggested_meeting_type TEXT CHECK (suggested_meeting_type IN ('in-person', 'video'));
    END IF;
END $$; 