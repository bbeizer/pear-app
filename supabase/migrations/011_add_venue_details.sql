-- Add detailed venue information to matches table
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS venue_name TEXT,
ADD COLUMN IF NOT EXISTS venue_address TEXT,
ADD COLUMN IF NOT EXISTS venue_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS venue_longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS venue_rating DECIMAL(3, 2),
ADD COLUMN IF NOT EXISTS venue_price_level INTEGER,
ADD COLUMN IF NOT EXISTS venue_categories TEXT[],
ADD COLUMN IF NOT EXISTS venue_distance_meters INTEGER,
ADD COLUMN IF NOT EXISTS venue_suggested_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS venue_suggested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add index for venue suggestions
CREATE INDEX IF NOT EXISTS idx_matches_venue_suggested_by ON matches(venue_suggested_by);

-- Add index for venue location queries
CREATE INDEX IF NOT EXISTS idx_matches_venue_location ON matches(venue_latitude, venue_longitude); 