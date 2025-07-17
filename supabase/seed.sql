-- Seed data for Pear App
-- This file contains sample profiles with multiple photos for testing the photo carousel

-- Clear existing data (optional - uncomment if you want to start fresh)
DELETE FROM swipes;
DELETE FROM matches;
DELETE FROM profiles;

-- Insert sample profiles with multiple photos
INSERT INTO profiles (id, name, bio, gender, sexuality, age, age_range_min, age_range_max, religion, politics, height, photos, deal_breakers, weekly_availability, email, prompts, created_at, updated_at) VALUES
(
    '550e8400-e29b-41d4-a716-446655440001',
    'Sarah Chen',
    'Adventure seeker and coffee enthusiast ☕️ Love hiking, photography, and trying new restaurants. Looking for someone to explore the city with!',
    'Woman',
    'Straight',
    28,
    25,
    35,
    'None',
    'Liberal',
    '5''4"',
    ARRAY[
        '{"url": "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop", "order": 1, "caption": "Hiking in the mountains"}'::jsonb,
        '{"url": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop", "order": 2, "caption": "Coffee date vibes"}'::jsonb,
        '{"url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop", "order": 3, "caption": "Exploring the city"}'::jsonb
    ],
    '{"gender": ["Man"], "ageRange": [25, 35], "religion": ["None", "Spiritual"], "politics": ["Liberal", "Moderate"], "heightRange": [0, 20]}',
    '{"monday_9": true, "monday_10": true, "tuesday_18": true, "tuesday_19": true, "wednesday_20": true, "thursday_19": true, "friday_20": true, "saturday_14": true, "saturday_15": true, "sunday_16": true}',
    'sarah.chen@example.com',
    '[{"question": "My most controversial opinion is...", "answer": "Pineapple belongs on pizza! 🍍"}, {"question": "Two truths and a lie:", "answer": "I climbed Mount Fuji, I speak 4 languages, I''ve never been to Disney"}, {"question": "Dating me is like...", "answer": "Going on a spontaneous road trip - you never know where we''ll end up!"}]',
    NOW() AT TIME ZONE 'UTC',
    NOW() AT TIME ZONE 'UTC'
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    'Alex Rodriguez',
    'Software engineer by day, musician by night 🎸 Passionate about tech, live music, and craft beer. Let''s build something amazing together!',
    'Man',
    'Straight',
    31,
    26,
    36,
    'None',
    'Moderate',
    '6''0"',
    ARRAY[
        '{"url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop", "order": 1, "caption": "Playing guitar"}'::jsonb,
        '{"url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop", "order": 2, "caption": "At the brewery"}'::jsonb,
        '{"url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop", "order": 3, "caption": "Coding session"}'::jsonb,
        '{"url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop", "order": 4, "caption": "Weekend adventures"}'::jsonb
    ],
    '{"gender": ["Woman"], "ageRange": [26, 36], "religion": ["None", "Spiritual"], "politics": ["Liberal", "Moderate"], "heightRange": [10, 30]}',
    '{"monday_19": true, "monday_20": true, "tuesday_19": true, "tuesday_20": true, "wednesday_19": true, "thursday_20": true, "friday_19": true, "friday_20": true, "saturday_15": true, "saturday_16": true, "sunday_14": true, "sunday_15": true}',
    'alex.rodriguez@example.com',
    '[{"question": "My hidden talent is...", "answer": "I can play Wonderwall on guitar (but only that song 😅)"}, {"question": "The last song I listened to on repeat was...", "answer": "Bohemian Rhapsody - it''s a masterpiece!"}, {"question": "My go-to karaoke song is...", "answer": "Sweet Caroline - everyone knows the chorus!"}]',
    NOW() AT TIME ZONE 'UTC',
    NOW() AT TIME ZONE 'UTC'
),
(
    '550e8400-e29b-41d4-a716-446655440003',
    'Maya Patel',
    'Yoga instructor and wellness advocate 🧘‍♀️ Love cooking, reading, and beach walks. Seeking someone who values health and mindfulness.',
    'Woman',
    'Bisexual',
    26,
    23,
    33,
    'Spiritual',
    'Liberal',
    '5''6"',
    ARRAY[
        '{"url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop", "order": 1, "caption": "Morning yoga"}'::jsonb,
        '{"url": "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=600&fit=crop", "order": 2, "caption": "Cooking in the kitchen"}'::jsonb,
        '{"url": "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=600&fit=crop", "order": 3, "caption": "Beach sunset"}'::jsonb,
        '{"url": "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop", "order": 4, "caption": "Reading time"}'::jsonb
    ],
    '{"gender": ["Man", "Woman"], "ageRange": [23, 33], "religion": ["None", "Spiritual", "Buddhist"], "politics": ["Liberal", "Moderate"], "heightRange": [8, 25]}',
    '{"monday_7": true, "monday_8": true, "tuesday_7": true, "tuesday_8": true, "wednesday_7": true, "thursday_7": true, "friday_7": true, "saturday_9": true, "saturday_10": true, "sunday_9": true, "sunday_10": true}',
    'maya.patel@example.com',
    '[{"question": "My most controversial opinion is...", "answer": "Meditation should be taught in schools 🧘‍♀️"}, {"question": "A shower thought I recently had...", "answer": "Why do we say ''sleep tight'' when we want someone to sleep well?"}, {"question": "I love...", "answer": "The feeling of sand between my toes and a good book in my hands"}]',
    NOW() AT TIME ZONE 'UTC',
    NOW() AT TIME ZONE 'UTC'
),
(
    '550e8400-e29b-41d4-a716-446655440004',
    'James Wilson',
    'Financial analyst with a passion for travel ✈️ Love trying new cuisines, watching documentaries, and playing tennis. Looking for someone to share adventures with!',
    'Man',
    'Gay',
    29,
    24,
    34,
    'None',
    'Moderate',
    '5''11"',
    ARRAY[
        '{"url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop", "order": 1, "caption": "Travel adventures"}'::jsonb,
        '{"url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop", "order": 2, "caption": "Tennis match"}'::jsonb,
        '{"url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop", "order": 3, "caption": "Foodie moments"}'::jsonb,
        '{"url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop", "order": 4, "caption": "Weekend vibes"}'::jsonb,
        '{"url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop", "order": 5, "caption": "City exploration"}'::jsonb
    ],
    '{"gender": ["Man"], "ageRange": [24, 34], "religion": ["None", "Spiritual"], "politics": ["Liberal", "Moderate"], "heightRange": [12, 28]}',
    '{"monday_18": true, "monday_19": true, "tuesday_18": true, "tuesday_19": true, "wednesday_18": true, "thursday_19": true, "friday_18": true, "friday_19": true, "saturday_16": true, "saturday_17": true, "sunday_15": true, "sunday_16": true}',
    'james.wilson@example.com',
    '[{"question": "My most controversial opinion is...", "answer": "Airplane food is actually pretty good! ✈️"}, {"question": "The last song I listened to on repeat was...", "answer": "Vampire by Olivia Rodrigo - it''s so catchy!"}, {"question": "Dating me is like...", "answer": "Going to a Michelin-starred restaurant - sophisticated but fun!"}]',
    NOW() AT TIME ZONE 'UTC',
    NOW() AT TIME ZONE 'UTC'
),
(
    '550e8400-e29b-41d4-a716-446655440005',
    'Emma Thompson',
    'Art teacher and creative soul 🎨 Love painting, gardening, and indie films. Looking for someone who appreciates beauty in the little things.',
    'Woman',
    'Straight',
    27,
    24,
    32,
    'Spiritual',
    'Liberal',
    '5''7"',
    ARRAY[
        '{"url": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop", "order": 1, "caption": "In my art studio"}'::jsonb,
        '{"url": "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop", "order": 2, "caption": "Garden vibes"}'::jsonb,
        '{"url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop", "order": 3, "caption": "Creative moments"}'::jsonb,
        '{"url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop", "order": 4, "caption": "Weekend adventures"}'::jsonb
    ],
    '{"gender": ["Man"], "ageRange": [24, 32], "religion": ["None", "Spiritual", "Christian"], "politics": ["Liberal", "Moderate"], "heightRange": [10, 26]}',
    '{"monday_16": true, "monday_17": true, "tuesday_16": true, "tuesday_17": true, "wednesday_16": true, "thursday_17": true, "friday_16": true, "friday_17": true, "saturday_13": true, "saturday_14": true, "sunday_12": true, "sunday_13": true}',
    'emma.thompson@example.com',
    '[{"question": "My hidden talent is...", "answer": "I can identify any plant just by looking at its leaves 🌿"}, {"question": "The emoji that best describes me is...", "answer": "💝 - caring, loving, and always there for others"}, {"question": "My toxic trait is...", "answer": "I spend way too much money on art supplies (but it''s worth it!)"}]',
    NOW() AT TIME ZONE 'UTC',
    NOW() AT TIME ZONE 'UTC'
),
(
    '550e8400-e29b-41d4-a716-446655440006',
    'David Kim',
    'Data scientist and fitness enthusiast 💪 Love running, cooking Korean food, and playing board games. Seeking someone who values both brains and brawn!',
    'Man',
    'Straight',
    30,
    25,
    35,
    'None',
    'Moderate',
    '5''10"',
    ARRAY[
        '{"url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop", "order": 1, "caption": "Post-workout"}'::jsonb,
        '{"url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop", "order": 2, "caption": "Cooking session"}'::jsonb,
        '{"url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop", "order": 3, "caption": "Running trail"}'::jsonb,
        '{"url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop", "order": 4, "caption": "Game night"}'::jsonb,
        '{"url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop", "order": 5, "caption": "Weekend vibes"}'::jsonb
    ],
    '{"gender": ["Woman"], "ageRange": [25, 35], "religion": ["None", "Spiritual"], "politics": ["Liberal", "Moderate", "Conservative"], "heightRange": [8, 24]}',
    '{"monday_6": true, "monday_7": true, "tuesday_6": true, "tuesday_7": true, "wednesday_6": true, "thursday_7": true, "friday_6": true, "friday_7": true, "saturday_8": true, "saturday_9": true, "sunday_8": true, "sunday_9": true}',
    'david.kim@example.com',
    '[{"question": "My most controversial opinion is...", "answer": "Excel is better than Google Sheets (fight me!) 📊"}, {"question": "Two truths and a lie:", "answer": "I can solve a Rubik''s cube, I''ve run a marathon, I''ve never eaten sushi"}, {"question": "My go-to karaoke song is...", "answer": "Gangnam Style - I know all the moves! 💃"}]',
    NOW() AT TIME ZONE 'UTC',
    NOW() AT TIME ZONE 'UTC'
),
(
    '550e8400-e29b-41d4-a716-446655440007',
    'Sophia Garcia',
    'Marketing manager and salsa dancer 💃 Love traveling, wine tasting, and live music. Looking for someone who can keep up with my energy!',
    'Woman',
    'Bisexual',
    25,
    22,
    30,
    'None',
    'Liberal',
    '5''5"',
    ARRAY[
        '{"url": "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=600&fit=crop", "order": 1, "caption": "Salsa dancing"}'::jsonb,
        '{"url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop", "order": 2, "caption": "Wine tasting"}'::jsonb,
        '{"url": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop", "order": 3, "caption": "Travel adventures"}'::jsonb,
        '{"url": "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop", "order": 4, "caption": "Live music"}'::jsonb,
        '{"url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop", "order": 5, "caption": "Weekend fun"}'::jsonb
    ],
    '{"gender": ["Man", "Woman"], "ageRange": [22, 30], "religion": ["None", "Spiritual"], "politics": ["Liberal", "Moderate"], "heightRange": [6, 22]}',
    '{"monday_19": true, "monday_20": true, "tuesday_19": true, "tuesday_20": true, "wednesday_19": true, "thursday_20": true, "friday_19": true, "friday_20": true, "saturday_15": true, "saturday_16": true, "sunday_14": true, "sunday_15": true}',
    'sophia.garcia@example.com',
    '[{"question": "My hidden talent is...", "answer": "I can dance salsa with my eyes closed 💃"}, {"question": "The last song I listened to on repeat was...", "answer": "Espacito - it gets me every time!"}, {"question": "Dating me is like...", "answer": "Going to a carnival - colorful, exciting, and full of surprises!"}]',
    NOW() AT TIME ZONE 'UTC',
    NOW() AT TIME ZONE 'UTC'
),
(
    '550e8400-e29b-41d4-a716-446655440008',
    'Michael Brown',
    'Architect and coffee connoisseur ☕️ Love design, cycling, and craft cocktails. Seeking someone who appreciates both form and function.',
    'Man',
    'Straight',
    33,
    28,
    38,
    'None',
    'Moderate',
    '6''2"',
    ARRAY[
        '{"url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop", "order": 1, "caption": "At the coffee shop"}'::jsonb,
        '{"url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop", "order": 2, "caption": "Cycling adventures"}'::jsonb,
        '{"url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop", "order": 3, "caption": "Design work"}'::jsonb,
        '{"url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop", "order": 4, "caption": "Cocktail hour"}'::jsonb,
        '{"url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop", "order": 5, "caption": "Weekend exploration"}'::jsonb
    ],
    '{"gender": ["Woman"], "ageRange": [28, 38], "religion": ["None", "Spiritual"], "politics": ["Liberal", "Moderate"], "heightRange": [14, 30]}',
    '{"monday_8": true, "monday_9": true, "tuesday_8": true, "tuesday_9": true, "wednesday_8": true, "thursday_9": true, "friday_8": true, "friday_9": true, "saturday_10": true, "saturday_11": true, "sunday_10": true, "sunday_11": true}',
    'michael.brown@example.com',
    '[{"question": "My most controversial opinion is...", "answer": "Modern architecture is underrated - glass and steel can be beautiful! 🏢"}, {"question": "A shower thought I recently had...", "answer": "Why do we call it ''coffee break'' when coffee is the main event?"}, {"question": "My toxic trait is...", "answer": "Judge restaurants by their coffee quality ☕️"}]',
    NOW() AT TIME ZONE 'UTC',
    NOW() AT TIME ZONE 'UTC'
),
(
    '550e8400-e29b-41d4-a716-446655440009',
    'Isabella Martinez',
    'Nurse and animal lover 🐕 Passionate about helping others and spending time with my rescue dog. Looking for someone with a big heart!',
    'Woman',
    'Straight',
    24,
    21,
    29,
    'Christian',
    'Moderate',
    '5''3"',
    ARRAY[
        '{"url": "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop", "order": 1, "caption": "With my rescue dog"}'::jsonb,
        '{"url": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop", "order": 2, "caption": "At the park"}'::jsonb,
        '{"url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop", "order": 3, "caption": "Weekend adventures"}'::jsonb,
        '{"url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop", "order": 4, "caption": "Coffee time"}'::jsonb
    ],
    '{"gender": ["Man"], "ageRange": [21, 29], "religion": ["Christian", "None"], "politics": ["Moderate", "Liberal"], "heightRange": [6, 20]}',
    '{"monday_7": true, "monday_8": true, "tuesday_7": true, "tuesday_8": true, "wednesday_7": true, "thursday_8": true, "friday_7": true, "friday_8": true, "saturday_10": true, "saturday_11": true, "sunday_10": true, "sunday_11": true}',
    'isabella.martinez@example.com',
    '[{"question": "My hidden talent is...", "answer": "I can make any dog fall in love with me in 30s 🐕"}, {"question": "The emoji that best describes me is...", "answer": "💝 - caring, loving, and always there for others"}, {"question": "One dealbreaker for me is...", "answer": "Not liking dogs - my rescue pup is my best friend!"}]',
    NOW() AT TIME ZONE 'UTC',
    NOW() AT TIME ZONE 'UTC'
),
(
    '550e8400-e29b-41d4-a716-446655440010',
    'Ryan Martinez',
    'Chef and food blogger 🍳 Love experimenting with new recipes, watching cooking shows, and hosting dinner parties. Let''s create something delicious together!',
    'Man',
    'Straight',
    32,
    27,
    37,
    'None',
    'Moderate',
    '6''1"',
    ARRAY[
        '{"url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop", "order": 1, "caption": "In the kitchen"}'::jsonb,
        '{"url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop", "order": 2, "caption": "Food photography"}'::jsonb,
        '{"url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop", "order": 3, "caption": "Dinner party"}'::jsonb,
        '{"url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop", "order": 4, "caption": "Weekend cooking"}'::jsonb,
        '{"url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop", "order": 5, "caption": "Food adventures"}'::jsonb
    ],
    '{"gender": ["Woman"], "ageRange": [27, 37], "religion": ["None", "Spiritual"], "politics": ["Moderate", "Liberal"], "heightRange": [8, 24]}',
    '{"monday_20": true, "monday_21": true, "tuesday_20": true, "tuesday_21": true, "wednesday_20": true, "thursday_21": true, "friday_20": true, "friday_21": true, "saturday_18": true, "saturday_19": true, "sunday_17": true, "sunday_18": true}',
    'ryan.martinez@example.com',
    '[{"question": "My most controversial opinion is...", "answer": "Ketchup on eggs is a crime against humanity! 🍳"}, {"question": "The last song I listened to on repeat was...", "answer": "Sweet Child O'' Mine - classic rock never gets old!"}, {"question": "Dating me is like...", "answer": "Going to a five-star restaurant - every meal is an experience!"}]',
    NOW() AT TIME ZONE 'UTC',
    NOW() AT TIME ZONE 'UTC'
);

-- Insert some sample matches for testing
INSERT INTO matches (id, user1_id, user2_id, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', NOW() AT TIME ZONE 'UTC'),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', NOW() AT TIME ZONE 'UTC');

-- Insert some sample swipes for testing
INSERT INTO swipes (id, swiper_id, swipee_id, liked, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', true, NOW() AT TIME ZONE 'UTC'),
('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440006', false, NOW() AT TIME ZONE 'UTC'),
('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440007', true, NOW() AT TIME ZONE 'UTC'); 