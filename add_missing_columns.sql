-- Add all missing columns that the Calendar component expects
-- Based on the actual schema, we need to add these columns

-- Add meeting_type column
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS meeting_type TEXT CHECK (meeting_type IN ('in-person', 'video'));

-- Add suggested_activity column
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS suggested_activity TEXT;

-- Add suggested_venue column  
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS suggested_venue TEXT;

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'matches' 
AND column_name IN ('meeting_type', 'suggested_activity', 'suggested_venue')
ORDER BY column_name;
