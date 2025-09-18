-- Final update script for Rachel's match
-- First run: add_missing_columns.sql
-- Then run this script

UPDATE matches 
SET 
    -- Set status to 'scheduled' (this makes it appear in Calendar tab)
    status = 'scheduled',
    
    -- Set both users to propose the same time (Calendar shows this)
    user1_proposed_time = 'Tomorrow_7:00_PM',
    user2_proposed_time = 'Tomorrow_7:00_PM',
    
    -- Set meeting type to in-person (Calendar shows this)
    meeting_type = 'in-person',
    
    -- Set suggested activity (Calendar shows this)
    suggested_activity = 'Dinner at Regina Pizzeria',
    
    -- Set suggested venue (Calendar shows this)
    suggested_venue = 'Regina Pizzeria - 11 1/2 Thacher St, Boston, MA',
    
    -- Mark venue as agreed since both users want the same place
    venue_agreed = true,
    
    -- Set the agreed venue to the same as what you proposed
    agreed_venue = user1_proposed_venue,
    
    -- Update timestamp
    updated_at = NOW()
WHERE id = '550e8400-e29b-41d4-a716-446655440204';

-- Verify the update
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
    venue_agreed,
    updated_at
FROM matches
WHERE id = '550e8400-e29b-41d4-a716-446655440204';
