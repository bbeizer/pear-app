-- Clean up table structure - use swipes table only
-- Drop the redundant likes table
DROP TABLE IF EXISTS likes;

-- Ensure swipes table has the right structure
CREATE TABLE IF NOT EXISTS swipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    swiper_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    swipee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    liked BOOLEAN NOT NULL,
    meeting_type 'in-person' | 'video',
    suggested_activity TEXT,
    suggested_venue TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(swiper_id, swipee_id) -- Prevent duplicate swipes
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_swipes_swiper_id ON swipes(swiper_id);
CREATE INDEX IF NOT EXISTS idx_swipes_swipee_id ON swipes(swipee_id);
CREATE INDEX IF NOT EXISTS idx_swipes_liked ON swipes(liked);
CREATE INDEX IF NOT EXISTS idx_swipes_created_at ON swipes(created_at DESC); 