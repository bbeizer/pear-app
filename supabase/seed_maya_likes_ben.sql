-- Seed data: Maya likes Ben
-- This will create a like from Maya to Ben so they can test the matching flow

-- First, let's see what users exist
SELECT id, name, email FROM profiles;

-- Then create a like from Maya to Ben
-- (Replace the UUIDs with actual user IDs from your profiles table)

-- Example (you'll need to replace with actual UUIDs):
-- INSERT INTO swipes (user_id, target_user_id, swipe_type, created_at)
-- VALUES 
--     ('maya-user-id-here', 'ben-user-id-here', 'like', NOW());

-- To find the actual user IDs, run this first:
-- SELECT id, name FROM profiles WHERE name IN ('Maya', 'Ben'); 