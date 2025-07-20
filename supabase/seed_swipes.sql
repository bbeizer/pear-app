-- Seed swipes table (replacing likes)
INSERT INTO swipes (swiper_id, swipee_id, liked, suggested_meeting_type, created_at) VALUES 
-- Sarah likes Ben (with meeting preference)
('550e8400-e29b-41d4-a716-446655440001', 'e572e82d-2938-496a-8cf5-3a355e3673a2', true, 'in-person', NOW() - INTERVAL '2 hours'),

-- Emma likes Ben (with meeting preference)
('550e8400-e29b-41d4-a716-446655440003', 'e572e82d-2938-496a-8cf5-3a355e3673a2', true, 'video', NOW() - INTERVAL '1 hour'),

-- Jessica likes Ben (with meeting preference)
('550e8400-e29b-41d4-a716-446655440005', 'e572e82d-2938-496a-8cf5-3a355e3673a2', true, 'in-person', NOW() - INTERVAL '30 minutes'),

-- Sophie likes Ben (with meeting preference)
('550e8400-e29b-41d4-a716-446655440010', 'e572e82d-2938-496a-8cf5-3a355e3673a2', true, 'in-person', NOW() - INTERVAL '15 minutes'),

-- Maya likes Ben (with meeting preference)
('550e8400-e29b-41d4-a716-446655440008', 'e572e82d-2938-496a-8cf5-3a355e3673a2', true, 'video', NOW() - INTERVAL '5 minutes'),

-- Some mutual swipes (matches)
-- Ben likes Sarah back (mutual like = match!)
('e572e82d-2938-496a-8cf5-3a355e3673a2', '550e8400-e29b-41d4-a716-446655440001', true, 'in-person', NOW() - INTERVAL '1 hour'),

-- Ben likes Emma back (mutual like = match!)
('e572e82d-2938-496a-8cf5-3a355e3673a2', '550e8400-e29b-41d4-a716-446655440003', true, 'video', NOW() - INTERVAL '45 minutes'),

-- Some rejections (for testing)
-- Ben rejected David
('e572e82d-2938-496a-8cf5-3a355e3673a2', '550e8400-e29b-41d4-a716-446655440004', false, NULL, NOW() - INTERVAL '3 hours'),

-- David rejected Ben
('550e8400-e29b-41d4-a716-446655440004', 'e572e82d-2938-496a-8cf5-3a355e3673a2', false, NULL, NOW() - INTERVAL '2 hours'),

-- Some other random swipes between other people
-- Mike likes Jessica
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', true, 'in-person', NOW() - INTERVAL '3 hours'),

-- Chris likes Sophie
('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440010', true, 'in-person', NOW() - INTERVAL '2 hours'),

-- Ryan likes Maya
('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440008', true, 'in-person', NOW() - INTERVAL '1 hour'); 