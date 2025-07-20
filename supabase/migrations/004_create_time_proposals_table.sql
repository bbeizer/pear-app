-- Add time proposal fields directly to matches table
-- This is simpler than a separate time_proposals table since we only need one active proposal per match

-- Add proposal fields to matches table
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS proposed_time TEXT,
ADD COLUMN IF NOT EXISTS proposed_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS proposal_status TEXT DEFAULT 'none' CHECK (proposal_status IN ('none', 'pending', 'accepted', 'declined'));

-- Create index for proposal queries
CREATE INDEX IF NOT EXISTS idx_matches_proposal_status ON matches(proposal_status);
CREATE INDEX IF NOT EXISTS idx_matches_proposed_by ON matches(proposed_by); 