-- Add meeting type and activity fields to swipes table
ALTER TABLE swipes 
ADD COLUMN IF NOT EXISTS meeting_type TEXT CHECK (meeting_type IN ('in-person', 'video')),
ADD COLUMN IF NOT EXISTS suggested_activity TEXT,
ADD COLUMN IF NOT EXISTS suggested_venue TEXT;

-- Add comments to document the new fields
COMMENT ON COLUMN swipes.meeting_type IS 'Type of meeting preferred (in-person or video)';
COMMENT ON COLUMN swipes.suggested_activity IS 'Activity suggested by the swiper';
COMMENT ON COLUMN swipes.suggested_venue IS 'Venue suggested by the swiper'; 