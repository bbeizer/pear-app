-- Complete SQL script to confirm Rachel Green's venue choice and create calendar event
-- This will update the match and ensure it appears in the calendar

-- Step 1: Find Rachel's profile and the match
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

-- Step 2: Update the match with venue confirmation and schedule it
UPDATE matches 
SET 
    -- Set Rachel's proposed venue to Regina's Pizza (detailed venue info)
    user1_proposed_venue = CASE 
        WHEN user1_id = (SELECT rachel_id FROM rachel_info) THEN 
            '{
                "name": "Regina''s Pizza", 
                "location": {
                    "address": "123 Main St, Boston, MA 02101",
                    "latitude": 42.3631,
                    "longitude": -71.0838
                }, 
                "rating": 4.5, 
                "priceLevel": 2, 
                "categories": ["restaurant", "pizza"],
                "imageUrl": "https://example.com/reginas-pizza.jpg"
            }'::jsonb
        ELSE user1_proposed_venue
    END,
    user2_proposed_venue = CASE 
        WHEN user2_id = (SELECT rachel_id FROM rachel_info) THEN 
            '{
                "name": "Regina''s Pizza", 
                "location": {
                    "address": "123 Main St, Boston, MA 02101",
                    "latitude": 42.3631,
                    "longitude": -71.0838
                }, 
                "rating": 4.5, 
                "priceLevel": 2, 
                "categories": ["restaurant", "pizza"],
                "imageUrl": "https://example.com/reginas-pizza.jpg"
            }'::jsonb
        ELSE user2_proposed_venue
    END,
    
    -- Mark venue as agreed since both users want the same place
    venue_agreed = true,
    
    -- Set the agreed venue
    agreed_venue = '{
        "name": "Regina''s Pizza", 
        "location": {
            "address": "123 Main St, Boston, MA 02101",
            "latitude": 42.3631,
            "longitude": -71.0838
        }, 
        "rating": 4.5, 
        "priceLevel": 2, 
        "categories": ["restaurant", "pizza"],
        "imageUrl": "https://example.com/reginas-pizza.jpg"
    }'::jsonb,
    
    -- Set both users to propose the same time (tomorrow at 7 PM)
    user1_proposed_time = 'Tomorrow_7:00_PM',
    user2_proposed_time = 'Tomorrow_7:00_PM',
    
    -- Set meeting type to in-person
    meeting_type = 'in-person',
    
    -- Set suggested activity
    suggested_activity = 'Dinner at Regina''s Pizza',
    
    -- Set suggested venue (legacy field)
    suggested_venue = 'Regina''s Pizza - 123 Main St, Boston, MA',
    
    -- Update status to scheduled since both venue and time are agreed
    status = 'scheduled',
    
    updated_at = NOW()
FROM rachel_info, match_info
WHERE matches.id = match_info.match_id;

-- Step 3: Show the updated match details
SELECT 
    m.id,
    m.user1_name,
    m.user2_name,
    m.status,
    m.meeting_type,
    m.suggested_activity,
    m.suggested_venue,
    m.user1_proposed_time,
    m.user2_proposed_time,
    m.venue_agreed,
    m.agreed_venue,
    m.updated_at
FROM matches m
CROSS JOIN rachel_info r
WHERE (m.user1_id = r.rachel_id OR m.user2_id = r.rachel_id)
ORDER BY m.updated_at DESC
LIMIT 1;
