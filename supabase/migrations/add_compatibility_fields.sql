-- Add compatibility fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS dating_intentions TEXT,
ADD COLUMN IF NOT EXISTS relationship_type TEXT,
ADD COLUMN IF NOT EXISTS drinking_frequency TEXT,
ADD COLUMN IF NOT EXISTS drugs_frequency TEXT;

-- Add comments to document the new fields
COMMENT ON COLUMN profiles.dating_intentions IS 'User''s dating intentions (long-term, casual, etc.)';
COMMENT ON COLUMN profiles.relationship_type IS 'User''s preferred relationship type (monogamous, polyamorous, etc.)';
COMMENT ON COLUMN profiles.drinking_frequency IS 'User''s drinking frequency (never, rarely, socially, etc.)';
COMMENT ON COLUMN profiles.drugs_frequency IS 'User''s drugs frequency (never, rarely, socially, etc.)'; 