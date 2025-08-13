-- ========================================
-- 🍐 PEAR APP BULLETPROOF SEED DATA
-- ========================================
-- This file can be run multiple times safely
-- It will clear existing data and recreate everything
-- ========================================

-- Clear existing data (safe to run multiple times)
DELETE FROM matches;
DELETE FROM swipes;
DELETE FROM profiles;

-- Reset sequences if they exist
DO $$
BEGIN
    -- Reset any auto-increment sequences
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'swipes_id_seq') THEN
        ALTER SEQUENCE swipes_id_seq RESTART WITH 1;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'matches_id_seq') THEN
        ALTER SEQUENCE matches_id_seq RESTART WITH 1;
    END IF;
END $$;

-- ========================================
-- 👥 PROFILES (15 users including you)
-- ========================================

INSERT INTO profiles (id, email, name, age, gender, height, bio, religion, politics, city, state, latitude, longitude, distance_preference, dating_intentions, relationship_type, drinking_frequency, drugs_frequency, photos, prompts, created_at, updated_at, sexuality, age_range_min, age_range_max, deal_breakers, location_accuracy, weekly_availability, push_token, avatar_url) VALUES
-- You (the user) - ALWAYS FIRST
('e572e82d-2938-496a-8cf5-3a355e3673a2', 'bhb987@gmail.com', 'Ben', 25, 'man', '5ft 10in', 'Software developer who loves hiking and coffee. Looking for someone to explore the city with!', 'agnostic', 'moderate', 'Boston', 'MA', 42.3601, -71.0589, 25, 'serious', 'monogamous', 'socially', 'never', ARRAY['{"url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", "order": 1, "is_primary": true}']::jsonb[], '{"prompt1": {"question": "What''s your ideal first date?", "answer": "Coffee and a walk around the city, then maybe dinner if we hit it off!"}, "prompt2": {"question": "What are you looking for?", "answer": "A genuine connection with someone who shares my love for exploration and good conversation."}}', NOW(), NOW(), 'straight', 22, 30, '["smoking", "extreme_politics"]', 100, '{"monday": {"9": true, "10": true, "11": true, "12": true, "13": true, "14": true, "15": true, "16": true, "17": true, "18": true, "19": true, "20": true, "21": true}}', null, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'),

-- 14 other profiles (all women for you to swipe on)
('550e8400-e29b-41d4-a716-446655440001', 'sarah.chen@example.com', 'Sarah Chen', 26, 'woman', '5ft 4in', 'Coffee enthusiast and book lover. Looking for someone to explore the city with!', 'spiritual', 'moderate', 'Boston', 'MA', 42.3601, -71.0589, 25, 'serious', 'monogamous', 'socially', 'never', ARRAY['{"url": "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400", "order": 1, "is_primary": true}']::jsonb[], '{"prompt1": {"question": "What''s your ideal first date?", "answer": "Coffee and a walk around the city, then maybe dinner if we hit it off!"}, "prompt2": {"question": "What are you looking for?", "answer": "A genuine connection with someone who shares my love for exploration and good conversation."}}', NOW(), NOW(), 'straight', 23, 30, '["smoking"]', 100, '{"monday": {"9": true, "10": true, "11": true, "12": true, "13": true, "14": true, "15": true, "16": true, "17": true, "18": true, "19": true, "20": true, "21": true}}', null, 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400'),

('550e8400-e29b-41d4-a716-446655440002', 'emma.wilson@example.com', 'Emma Wilson', 24, 'woman', '5ft 6in', 'Art teacher and yoga instructor. Passionate about creativity and mindfulness.', 'protestant', 'liberal', 'Cambridge', 'MA', 42.3736, -71.1097, 20, 'serious', 'monogamous', 'socially', 'never', ARRAY['{"url": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400", "order": 1, "is_primary": true}']::jsonb[], '{"prompt1": {"question": "What''s your ideal first date?", "answer": "A visit to an art gallery followed by coffee and deep conversation."}, "prompt2": {"question": "What are you looking for?", "answer": "A soulful connection with someone who values art and personal growth."}}', NOW(), NOW(), 'straight', 22, 28, '["smoking", "extreme_politics"]', 100, '{"monday": {"10": true, "11": true, "12": true, "13": true, "14": true, "15": true, "16": true, "17": true, "18": true, "19": true, "20": true}}', null, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'),

('550e8400-e29b-41d4-a716-446655440003', 'lisa.park@example.com', 'Lisa Park', 25, 'woman', '5ft 5in', 'Medical student and dog lover. Passionate about helping others and outdoor adventures.', 'buddhist', 'moderate', 'Boston', 'MA', 42.3601, -71.0589, 20, 'serious', 'monogamous', 'rarely', 'never', ARRAY['{"url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400", "order": 1, "is_primary": true}']::jsonb[], '{"prompt1": {"question": "What''s your ideal first date?", "answer": "A walk in the park with my dog, then coffee and conversation."}, "prompt2": {"question": "What are you looking for?", "answer": "A caring partner who loves animals and values education."}}', NOW(), NOW(), 'straight', 23, 29, '["smoking", "heavy_drinking"]', 100, '{"monday": {"8": true, "9": true, "10": true, "11": true, "12": true, "13": true, "14": true, "15": true, "16": true, "17": true, "18": true, "19": true, "20": true}}', null, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400'),

('550e8400-e29b-41d4-a716-446655440004', 'rachel.green@example.com', 'Rachel Green', 26, 'woman', '5ft 7in', 'Marketing manager and fitness enthusiast. Love running and trying new restaurants.', 'jewish', 'liberal', 'Boston', 'MA', 42.3601, -71.0589, 25, 'serious', 'monogamous', 'socially', 'never', ARRAY['{"url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400", "order": 1, "is_primary": true}']::jsonb[], '{"prompt1": {"question": "What''s your ideal first date?", "answer": "A morning run along the Charles River followed by brunch."}, "prompt2": {"question": "What are you looking for?", "answer": "A motivated partner who values health and good conversation."}}', NOW(), NOW(), 'straight', 24, 30, '["smoking", "heavy_drinking"]', 100, '{"monday": {"6": true, "7": true, "8": true, "9": true, "18": true, "19": true, "20": true, "21": true}}', null, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'),

('550e8400-e29b-41d4-a716-446655440005', 'sophia.lee@example.com', 'Sophia Lee', 24, 'woman', '5ft 4in', 'Graduate student in psychology and yoga instructor. Love learning and helping others.', 'agnostic', 'liberal', 'Somerville', 'MA', 42.3876, -71.0995, 20, 'serious', 'monogamous', 'rarely', 'never', ARRAY['{"url": "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400", "order": 1, "is_primary": true}']::jsonb[], '{"prompt1": {"question": "What''s your ideal first date?", "answer": "A quiet coffee shop for deep conversation about life and dreams."}, "prompt2": {"question": "What are you looking for?", "answer": "A genuine connection with someone who values personal growth."}}', NOW(), NOW(), 'straight', 22, 28, '["smoking", "heavy_drinking"]', 100, '{"monday": {"8": true, "9": true, "10": true, "11": true, "12": true, "13": true, "14": true, "15": true, "16": true, "17": true, "18": true, "19": true, "20": true}}', null, 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400'),

('550e8400-e29b-41d4-a716-446655440006', 'olivia.brown@example.com', 'Olivia Brown', 25, 'woman', '5ft 6in', 'Environmental scientist and nature photographer. Love hiking and sustainability.', 'spiritual', 'liberal', 'Cambridge', 'MA', 42.3736, -71.1097, 25, 'serious', 'monogamous', 'rarely', 'never', ARRAY['{"url": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400", "order": 1, "is_primary": true}']::jsonb[], '{"prompt1": {"question": "What''s your ideal first date?", "answer": "A hike in the woods to photograph nature and discuss environmental issues."}, "prompt2": {"question": "What are you looking for?", "answer": "Someone who cares about the planet and loves outdoor adventures."}}', NOW(), NOW(), 'straight', 23, 29, '["smoking", "heavy_drinking"]', 100, '{"monday": {"9": true, "10": true, "11": true, "12": true, "13": true, "14": true, "15": true, "16": true, "17": true, "18": true, "19": true, "20": true}}', null, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'),

('550e8400-e29b-41d4-a716-446655440007', 'jessica.taylor@example.com', 'Jessica Taylor', 27, 'woman', '5ft 5in', 'Chef and food blogger. Passionate about cooking and sharing meals with others.', 'catholic', 'moderate', 'Boston', 'MA', 42.3601, -71.0589, 25, 'serious', 'monogamous', 'socially', 'never', ARRAY['{"url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400", "order": 1, "is_primary": true}']::jsonb[], '{"prompt1": {"question": "What''s your ideal first date?", "answer": "Cooking a meal together and sharing our food stories."}, "prompt2": {"question": "What are you looking for?", "answer": "Someone who appreciates good food and values family traditions."}}', NOW(), NOW(), 'straight', 24, 31, '["smoking"]', 100, '{"monday": {"10": true, "11": true, "12": true, "13": true, "14": true, "15": true, "16": true, "17": true, "18": true, "19": true, "20": true, "21": true}}', null, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400'),

('550e8400-e29b-41d4-a716-446655440008', 'amanda.clark@example.com', 'Amanda Clark', 26, 'woman', '5ft 7in', 'Nurse and animal lover. Passionate about helping others and spending time with pets.', 'agnostic', 'moderate', 'Cambridge', 'MA', 42.3736, -71.1097, 25, 'serious', 'monogamous', 'rarely', 'never', ARRAY['{"url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400", "order": 1, "is_primary": true}']::jsonb[], '{"prompt1": {"question": "What''s your ideal first date?", "answer": "A visit to a pet shelter followed by coffee and conversation."}, "prompt2": {"question": "What are you looking for?", "answer": "Someone compassionate who loves animals and helping others."}}', NOW(), NOW(), 'straight', 23, 30, '["smoking", "heavy_drinking"]', 100, '{"monday": {"9": true, "10": true, "11": true, "12": true, "13": true, "14": true, "15": true, "16": true, "17": true, "18": true, "19": true, "20": true}}', null, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'),

-- Some men for variety (you'll swipe left on these)
('550e8400-e29b-41d4-a716-446655440009', 'mike.rodriguez@example.com', 'Mike Rodriguez', 28, 'man', '5ft 11in', 'Fitness trainer and foodie. Love trying new restaurants and staying active!', 'catholic', 'liberal', 'Boston', 'MA', 42.3601, -71.0589, 30, 'casual', 'open', 'socially', 'never', ARRAY['{"url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400", "order": 1, "is_primary": true}']::jsonb[], '{"prompt1": {"question": "What''s your ideal first date?", "answer": "A workout session followed by a healthy meal at a new restaurant!"}, "prompt2": {"question": "What are you looking for?", "answer": "Someone to share my active lifestyle and love for good food."}}', NOW(), NOW(), 'straight', 24, 32, '["smoking"]', 100, '{"monday": {"6": true, "7": true, "8": true, "9": true, "18": true, "19": true, "20": true, "21": true}}', null, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400'),

('550e8400-e29b-41d4-a716-446655440010', 'james.thompson@example.com', 'James Thompson', 27, 'man', '6ft 1in', 'Software engineer who loves hiking and craft beer. Looking for adventure!', 'agnostic', 'moderate', 'Somerville', 'MA', 42.3876, -71.0995, 25, 'serious', 'monogamous', 'socially', 'never', ARRAY['{"url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400", "order": 1, "is_primary": true}']::jsonb[], '{"prompt1": {"question": "What''s your ideal first date?", "answer": "A hike in the Blue Hills followed by craft beer at a local brewery."}, "prompt2": {"question": "What are you looking for?", "answer": "Someone adventurous who shares my love for nature and good beer."}}', NOW(), NOW(), 'straight', 23, 30, '["smoking"]', 100, '{"monday": {"9": true, "10": true, "11": true, "12": true, "13": true, "14": true, "15": true, "16": true, "17": true, "18": true, "19": true, "20": true}}', null, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'),

('550e8400-e29b-41d4-a716-446655440011', 'david.kim@example.com', 'David Kim', 29, 'man', '5ft 9in', 'Financial analyst and food blogger. Love exploring new cuisines and traveling.', 'protestant', 'conservative', 'Brookline', 'MA', 42.3318, -71.1212, 30, 'casual', 'open', 'socially', 'never', ARRAY['{"url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400", "order": 1, "is_primary": true}']::jsonb[], '{"prompt1": {"question": "What''s your ideal first date?", "answer": "Trying a new restaurant and sharing our favorite travel stories."}, "prompt2": {"question": "What are you looking for?", "answer": "Someone adventurous who loves food and new experiences."}}', NOW(), NOW(), 'straight', 25, 33, '["smoking"]', 100, '{"monday": {"9": true, "10": true, "11": true, "12": true, "13": true, "14": true, "15": true, "16": true, "17": true, "18": true, "19": true, "20": true, "21": true}}', null, 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400'),

('550e8400-e29b-41d4-a716-446655440012', 'alex.martinez@example.com', 'Alex Martinez', 28, 'man', '6ft 0in', 'Architect and coffee connoisseur. Passionate about design and urban exploration.', 'catholic', 'moderate', 'Cambridge', 'MA', 42.3736, -71.1097, 25, 'serious', 'monogamous', 'socially', 'never', ARRAY['{"url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", "order": 1, "is_primary": true}']::jsonb[], '{"prompt1": {"question": "What''s your ideal first date?", "answer": "Exploring the city''s architecture and coffee shops."}, "prompt2": {"question": "What are you looking for?", "answer": "Someone creative who appreciates good design and conversation."}}', NOW(), NOW(), 'straight', 24, 32, '["smoking"]', 100, '{"monday": {"9": true, "10": true, "11": true, "12": true, "13": true, "14": true, "15": true, "16": true, "17": true, "18": true, "19": true, "20": true}}', null, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'),

('550e8400-e29b-41d4-a716-446655440013', 'marcus.johnson@example.com', 'Marcus Johnson', 27, 'man', '6ft 2in', 'Music producer and vinyl collector. Love jazz, coffee, and late-night conversations.', 'protestant', 'moderate', 'Boston', 'MA', 42.3601, -71.0589, 30, 'casual', 'open', 'socially', 'never', ARRAY['{"url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400", "order": 1, "is_primary": true}']::jsonb[], '{"prompt1": {"question": "What''s your ideal first date?", "answer": "Listening to vinyl records and sharing our favorite music."}, "prompt2": {"question": "What are you looking for?", "answer": "Someone who appreciates good music and meaningful conversations."}}', NOW(), NOW(), 'straight', 24, 31, '["smoking"]', 100, '{"monday": {"10": true, "11": true, "12": true, "13": true, "14": true, "15": true, "16": true, "17": true, "18": true, "19": true, "20": true, "21": true}}', null, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400'),

('550e8400-e29b-41d4-a716-446655440014', 'kevin.zhang@example.com', 'Kevin Zhang', 26, 'man', '5ft 10in', 'Data scientist and board game enthusiast. Love strategy games and good food.', 'agnostic', 'moderate', 'Somerville', 'MA', 42.3876, -71.0995, 25, 'serious', 'monogamous', 'socially', 'never', ARRAY['{"url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400", "order": 1, "is_primary": true}']::jsonb[], '{"prompt1": {"question": "What''s your ideal first date?", "answer": "Playing a strategic board game over coffee and snacks."}, "prompt2": {"question": "What are you looking for?", "answer": "Someone intelligent who enjoys games and good conversation."}}', NOW(), NOW(), 'straight', 23, 30, '["smoking"]', 100, '{"monday": {"9": true, "10": true, "11": true, "12": true, "13": true, "14": true, "15": true, "16": true, "17": true, "18": true, "19": true, "20": true}}', null, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'),

('550e8400-e29b-41d4-a716-446655440015', 'daniel.garcia@example.com', 'Daniel Garcia', 29, 'man', '6ft 0in', 'Teacher and soccer coach. Love sports, reading, and helping kids grow.', 'protestant', 'liberal', 'Brookline', 'MA', 42.3318, -71.1212, 30, 'serious', 'monogamous', 'socially', 'never', ARRAY['{"url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400", "order": 1, "is_primary": true}']::jsonb[], '{"prompt1": {"question": "What''s your ideal first date?", "answer": "A walk in the park discussing our favorite books and life goals."}, "prompt2": {"question": "What are you looking for?", "answer": "Someone caring who values education and family."}}', NOW(), NOW(), 'straight', 25, 33, '["smoking"]', 100, '{"monday": {"8": true, "9": true, "10": true, "11": true, "12": true, "13": true, "14": true, "15": true, "16": true, "17": true, "18": true, "19": true, "20": true}}', null, 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400');

-- ========================================
-- 💕 INCOMING SWIPES (people who liked you)
-- ========================================

INSERT INTO swipes (id, swiper_id, swipee_id, liked, suggested_meeting_type, created_at) VALUES
-- 8 women who liked you (these will show in Likes tab)
('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'e572e82d-2938-496a-8cf5-3a355e3673a2', true, 'in_person', NOW()),
('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440002', 'e572e82d-2938-496a-8cf5-3a355e3673a2', true, 'in_person', NOW()),
('550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440003', 'e572e82d-2938-496a-8cf5-3a355e3673a2', true, 'in_person', NOW()),
('550e8400-e29b-41d4-a716-446655440204', '550e8400-e29b-41d4-a716-446655440004', 'e572e82d-2938-496a-8cf5-3a355e3673a2', true, 'in_person', NOW()),
('550e8400-e29b-41d4-a716-446655440205', '550e8400-e29b-41d4-a716-446655440005', 'e572e82d-2938-496a-8cf5-3a355e3673a2', true, 'in_person', NOW()),
('550e8400-e29b-41d4-a716-446655440206', '550e8400-e29b-41d4-a716-446655440006', 'e572e82d-2938-496a-8cf5-3a355e3673a2', true, 'in_person', NOW()),
('550e8400-e29b-41d4-a716-446655440207', '550e8400-e29b-41d4-a716-446655440007', 'e572e82d-2938-496a-8cf5-3a355e3673a2', true, 'in_person', NOW()),
('550e8400-e29b-41d4-a716-446655440208', '550e8400-e29b-41d4-a716-446655440008', 'e572e82d-2938-496a-8cf5-3a355e3673a2', true, 'in_person', NOW());

-- ========================================
-- 🎯 YOUR SWIPES (you swiping on others)
-- ========================================

INSERT INTO swipes (id, swiper_id, swipee_id, liked, suggested_meeting_type, created_at) VALUES
-- You swiping right on the 8 women who liked you (creates matches)
('550e8400-e29b-41d4-a716-446655440301', 'e572e82d-2938-496a-8cf5-3a355e3673a2', '550e8400-e29b-41d4-a716-446655440001', true, 'in_person', NOW()),
('550e8400-e29b-41d4-a716-446655440302', 'e572e82d-2938-496a-8cf5-3a355e3673a2', '550e8400-e29b-41d4-a716-446655440002', true, 'in_person', NOW()),
('550e8400-e29b-41d4-a716-446655440303', 'e572e82d-2938-496a-8cf5-3a355e3673a2', '550e8400-e29b-41d4-a716-446655440003', true, 'in_person', NOW()),
('550e8400-e29b-41d4-a716-446655440304', 'e572e82d-2938-496a-8cf5-3a355e3673a2', '550e8400-e29b-41d4-a716-446655440004', true, 'in_person', NOW()),
('550e8400-e29b-41d4-a716-446655440305', 'e572e82d-2938-496a-8cf5-3a355e3673a2', '550e8400-e29b-41d4-a716-446655440005', true, 'in_person', NOW()),
('550e8400-e29b-41d4-a716-446655440306', 'e572e82d-2938-496a-8cf5-3a355e3673a2', '550e8400-e29b-41d4-a716-446655440006', true, 'in_person', NOW()),
('550e8400-e29b-41d4-a716-446655440307', 'e572e82d-2938-496a-8cf5-3a355e3673a2', '550e8400-e29b-41d4-a716-446655440007', true, 'in_person', NOW()),
('550e8400-e29b-41d4-a716-446655440308', 'e572e82d-2938-496a-8cf5-3a355e3673a2', '550e8400-e29b-41d4-a716-446655440008', true, 'in_person', NOW()),

-- You swiping left on the men (these won't show in Likes tab)
('550e8400-e29b-41d4-a716-446655440309', 'e572e82d-2938-496a-8cf5-3a355e3673a2', '550e8400-e29b-41d4-a716-446655440009', false, null, NOW()),
('550e8400-e29b-41d4-a716-446655440310', 'e572e82d-2938-496a-8cf5-3a355e3673a2', '550e8400-e29b-41d4-a716-446655440010', false, null, NOW()),
('550e8400-e29b-41d4-a716-446655440311', 'e572e82d-2938-496a-8cf5-3a355e3673a2', '550e8400-e29b-41d4-a716-446655440011', false, null, NOW()),
('550e8400-e29b-41d4-a716-446655440312', 'e572e82d-2938-496a-8cf5-3a355e3673a2', '550e8400-e29b-41d4-a716-446655440012', false, null, NOW()),
('550e8400-e29b-41d4-a716-446655440313', 'e572e82d-2938-496a-8cf5-3a355e3673a2', '550e8400-e29b-41d4-a716-446655440013', false, null, NOW()),
('550e8400-e29b-41d4-a716-446655440314', 'e572e82d-2938-496a-8cf5-3a355e3673a2', '550e8400-e29b-41d4-a716-446655440014', false, null, NOW()),
('550e8400-e29b-41d4-a716-446655440315', 'e572e82d-2938-496a-8cf5-3a355e3673a2', '550e8400-e29b-41d4-a716-446655440015', false, null, NOW());

-- ========================================
-- 💘 MATCHES (mutual likes)
-- ========================================

INSERT INTO matches (id, user1_id, user2_id, status, meeting_type, suggested_activity, suggested_venue, created_at, updated_at, user1_proposed_time, user2_proposed_time, user1_name, user2_name) VALUES
-- Your 8 matches with the women who liked you
('550e8400-e29b-41d4-a716-446655440401', 'e572e82d-2938-496a-8cf5-3a355e3673a2', '550e8400-e29b-41d4-a716-446655440001', 'unscheduled', 'in_person', 'coffee', 'Tatte Bakery', NOW(), NOW(), null, null, 'Ben', 'Sarah Chen'),
('550e8400-e29b-41d4-a716-446655440402', 'e572e82d-2938-496a-8cf5-3a355e3673a2', '550e8400-e29b-41d4-a716-446655440002', 'unscheduled', 'in_person', 'art_gallery', 'Museum of Fine Arts', NOW(), NOW(), null, null, 'Ben', 'Emma Wilson'),
('550e8400-e29b-41d4-a716-446655440403', 'e572e82d-2938-496a-8cf5-3a355e3673a2', '550e8400-e29b-41d4-a716-446655440003', 'unscheduled', 'in_person', 'dog_walk', 'Boston Common', NOW(), NOW(), null, null, 'Ben', 'Lisa Park'),
('550e8400-e29b-41d4-a716-446655440404', 'e572e82d-2938-496a-8cf5-3a355e3673a2', '550e8400-e29b-41d4-a716-446655440004', 'unscheduled', 'in_person', 'running', 'Charles River Esplanade', NOW(), NOW(), null, null, 'Ben', 'Rachel Green'),
('550e8400-e29b-41d4-a716-446655440405', 'e572e82d-2938-496a-8cf5-3a355e3673a2', '550e8400-e29b-41d4-a716-446655440005', 'unscheduled', 'in_person', 'coffee', 'Thinking Cup', NOW(), NOW(), null, null, 'Ben', 'Sophia Lee'),
('550e8400-e29b-41d4-a716-446655440406', 'e572e82d-2938-496a-8cf5-3a355e3673a2', '550e8400-e29b-41d4-a716-446655440006', 'unscheduled', 'in_person', 'hiking', 'Blue Hills Reservation', NOW(), NOW(), null, null, 'Ben', 'Olivia Brown'),
('550e8400-e29b-41d4-a716-446655440407', 'e572e82d-2938-496a-8cf5-3a355e3673a2', '550e8400-e29b-41d4-a716-446655440007', 'unscheduled', 'in_person', 'cooking', 'Your Kitchen', NOW(), NOW(), null, null, 'Ben', 'Jessica Taylor'),
('550e8400-e29b-41d4-a716-446655440408', 'e572e82d-2938-496a-8cf5-3a355e3673a2', '550e8400-e29b-41d4-a716-446655440008', 'unscheduled', 'in_person', 'pet_shelter', 'MSPCA', NOW(), NOW(), null, null, 'Ben', 'Amanda Clark');

-- ========================================
-- ✅ SUCCESS MESSAGE
-- ========================================

SELECT 
    '🍐 PEAR APP SEEDED SUCCESSFULLY!' as message,
    'You now have:' as info,
    '• 15 profiles (including you)' as profiles,
    '• 8 incoming likes to respond to' as incoming_likes,
    '• 8 matches to interact with' as matches,
    '• 15 swipes total' as total_swipes;

-- ========================================
-- 📊 DATA VERIFICATION
-- ========================================

SELECT 
    'PROFILES COUNT:' as check_type,
    COUNT(*) as count
FROM profiles
UNION ALL
SELECT 
    'INCOMING SWIPES FOR YOU:' as check_type,
    COUNT(*) as count
FROM swipes 
WHERE swipee_id = 'e572e82d-2938-496a-8cf5-3a355e3673a2' AND liked = true
UNION ALL
SELECT 
    'YOUR MATCHES:' as check_type,
    COUNT(*) as count
FROM matches 
WHERE user1_id = 'e572e82d-2938-496a-8cf5-3a355e3673a2' OR user2_id = 'e572e82d-2938-496a-8cf5-3a355e3673a2';
