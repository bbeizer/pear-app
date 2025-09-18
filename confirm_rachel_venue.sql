-- SQL to confirm Rachel Green wants to go to Regina's Pizza
-- This assumes we found the match ID from the previous query

-- First, let's find Rachel's user ID and the match
WITH rachel_info AS (
    SELECT id as rachel_id, name
    FROM profiles 
    WHERE name ILIKE '%rachel%' OR name ILIKE '%green%'
    LIMIT 1
),
match_info AS (
    SELECT m.id as match_id, m.user1_id, m.user2_id, m.user1_name, m.user2_name
    FROM matches m
    CROSS JOIN rachel_info r
    WHERE (m.user1_id = r.rachel_id OR m.user2_id = r.rachel_id)
    ORDER BY m.created_at DESC
    LIMIT 1
)
-- Update the match to confirm Rachel's venue choice
UPDATE matches 
SET 
    -- Set Rachel's proposed venue to Regina's Pizza
    user1_proposed_venue = CASE 
        WHEN user1_id = (SELECT rachel_id FROM rachel_info) THEN 
            '{"name": "Regina''s Pizza", "location": {"address": "123 Main St, Boston, MA"}, "rating": 4.5, "priceLevel": 2, "categories": ["restaurant", "pizza"]}'::jsonb
        ELSE user1_proposed_venue
    END,
    user2_proposed_venue = CASE 
        WHEN user2_id = (SELECT rachel_id FROM rachel_info) THEN 
            '{"name": "Regina''s Pizza", "location": {"address": "123 Main St, Boston, MA"}, "rating": 4.5, "priceLevel": 2, "categories": ["restaurant", "pizza"]}'::jsonb
        ELSE user2_proposed_venue
    END,
    -- Mark venue as agreed if both users have proposed the same venue
    venue_agreed = CASE 
        WHEN (user1_id = (SELECT rachel_id FROM rachel_info) AND user2_proposed_venue IS NOT NULL) OR
             (user2_id = (SELECT rachel_id FROM rachel_info) AND user1_proposed_venue IS NOT NULL)
        THEN true
        ELSE venue_agreed
    END,
    -- Set the agreed venue
    agreed_venue = CASE 
        WHEN (user1_id = (SELECT rachel_id FROM rachel_info) AND user2_proposed_venue IS NOT NULL) OR
             (user2_id = (SELECT rachel_id FROM rachel_info) AND user1_proposed_venue IS NOT NULL)
        THEN '{"name": "Regina''s Pizza", "location": {"address": "123 Main St, Boston, MA"}, "rating": 4.5, "priceLevel": 2, "categories": ["restaurant", "pizza"]}'::jsonb
        ELSE agreed_venue
    END,
    updated_at = NOW()
FROM rachel_info, match_info
WHERE matches.id = match_info.match_id;

-- Show the updated match
SELECT 
    m.id,
    m.user1_name,
    m.user2_name,
    m.status,
    m.user1_proposed_venue,
    m.user2_proposed_venue,
    m.venue_agreed,
    m.agreed_venue,
    m.updated_at
FROM matches m
CROSS JOIN rachel_info r
WHERE (m.user1_id = r.rachel_id OR m.user2_id = r.rachel_id)
ORDER BY m.updated_at DESC
LIMIT 1;
