-- Ensure proposal fields exist in matches table
-- This migration ensures the proposal_status field exists with correct constraints

-- Add proposal fields if they don't exist
DO $$
BEGIN
    -- Add proposed_time if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'matches' AND column_name = 'proposed_time') THEN
        ALTER TABLE matches ADD COLUMN proposed_time TEXT;
    END IF;

    -- Add proposed_by if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'matches' AND column_name = 'proposed_by') THEN
        ALTER TABLE matches ADD COLUMN proposed_by UUID REFERENCES profiles(id);
    END IF;

    -- Add proposal_status if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'matches' AND column_name = 'proposal_status') THEN
        ALTER TABLE matches ADD COLUMN proposal_status TEXT DEFAULT 'none' CHECK (proposal_status IN ('none', 'pending', 'accepted', 'declined'));
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_matches_proposal_status ON matches(proposal_status);
CREATE INDEX IF NOT EXISTS idx_matches_proposed_by ON matches(proposed_by); 