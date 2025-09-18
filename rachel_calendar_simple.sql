-- Simple SQL to make Rachel's match appear in the Calendar tab
-- This focuses only on what the Calendar component actually uses

-- Step 1: Find the match with Rachel
WITH rachel_match AS (
    SELECT m.id, m.user1_id, m.user2_id, m.user1_name, m.user2_name
    FROM matches m
    WHERE m.user1_name ILIKE '%rachel%' OR m.user2_name ILIKE '%rachel%'
       OR m.user1_name ILIKE '%green%' OR m.user2_name ILIKE '%green%'
    ORDER BY m.created_at DESC
    LIMIT 1
)

-- Step 2: Update the match to make it appear in Calendar
UPDATE matches 
SET 
    -- Set status to 'scheduled' (this is what Calendar filters for)
    status = 'scheduled',
    
    -- Set both users to propose the same time (Calendar shows this)
    user1_proposed_time = 'Tomorrow_7:00_PM',
    user2_proposed_time = 'Tomorrow_7:00_PM',
    
    -- Set meeting type (Calendar shows this)
    meeting_type = 'in-person',
    
    -- Set suggested activity (Calendar shows this)
    suggested_activity = 'Dinner at Regina''s Pizza',
    
    -- Set suggested venue (Calendar shows this)
    suggested_venue = 'Regina''s Pizza - 123 Main St, Boston, MA',
    
    -- Update timestamp
    updated_at = NOW()
FROM rachel_match
WHERE matches.id = rachel_match.id;

-- Step 3: Verify the update
SELECT 
    id,
    user1_name,
    user2_name,
    status,
    meeting_type,
    suggested_activity,
    suggested_venue,
    user1_proposed_time,
    user2_proposed_time,
    updated_at
FROM matches
WHERE user1_name ILIKE '%rachel%' OR user2_name ILIKE '%rachel%'
   OR user1_name ILIKE '%green%' OR user2_name ILIKE '%green%'
ORDER BY updated_at DESC
LIMIT 1;
