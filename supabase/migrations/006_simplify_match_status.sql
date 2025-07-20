-- Simplify match status system
-- Update the status field to use clear, simple values

-- Update existing records to use new status values BEFORE adding the new constraint
UPDATE matches 
SET status = 'unscheduled' 
WHERE status NOT IN ('unscheduled', 'proposed', 'scheduled');

-- Now update the status field to use the new simplified values
ALTER TABLE matches DROP CONSTRAINT IF EXISTS matches_status_check;
ALTER TABLE matches ADD CONSTRAINT matches_status_check 
    CHECK (status IN ('unscheduled', 'proposed', 'scheduled'));

-- Set default status to unscheduled
ALTER TABLE matches ALTER COLUMN status SET DEFAULT 'unscheduled';

-- Create index for the status field
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status); 