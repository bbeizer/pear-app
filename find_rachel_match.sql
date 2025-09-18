-- Find the match with Rachel Green
-- First, let's see what matches exist and find Rachel's profile

-- Check if there's a profile for Rachel Green
SELECT id, name, email 
FROM profiles 
WHERE name ILIKE '%rachel%' OR name ILIKE '%green%';

-- Check all current matches
SELECT 
    m.id,
    m.user1_name,
    m.user2_name,
    m.status,
    m.user1_proposed_venue,
    m.user2_proposed_venue,
    m.venue_agreed,
    m.agreed_venue,
    m.created_at
FROM matches m
ORDER BY m.created_at DESC;
