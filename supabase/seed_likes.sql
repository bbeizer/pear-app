-- Seed likes table with some people swiping on Ben
INSERT INTO likes (liker_id, likee_id, created_at) VALUES 
-- Sarah likes Ben
('550e8400-e29b-41d4-a716-446655440001', 'e572e82d-2938-496a-8cf5-3a355e3673a2', NOW() - INTERVAL '2 hours'),

-- Emma likes Ben  
('550e8400-e29b-41d4-a716-446655440003', 'e572e82d-2938-496a-8cf5-3a355e3673a2', NOW() - INTERVAL '1 hour'),

-- Jessica likes Ben
('550e8400-e29b-41d4-a716-446655440005', 'e572e82d-2938-496a-8cf5-3a355e3673a2', NOW() - INTERVAL '30 minutes'),

-- Sophie likes Ben
('550e8400-e29b-41d4-a716-446655440010', 'e572e82d-2938-496a-8cf5-3a355e3673a2', NOW() - INTERVAL '15 minutes'),

-- Maya likes Ben
('550e8400-e29b-41d4-a716-446655440008', 'e572e82d-2938-496a-8cf5-3a355e3673a2', NOW() - INTERVAL '5 minutes'),

-- Some mutual likes (matches)
-- Ben likes Sarah back (mutual like = match!)
('e572e82d-2938-496a-8cf5-3a355e3673a2', '550e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '1 hour'),

-- Ben likes Emma back (mutual like = match!)
('e572e82d-2938-496a-8cf5-3a355e3673a2', '550e8400-e29b-41d4-a716-446655440003', NOW() - INTERVAL '45 minutes'),

-- Some other random likes between other people
-- Mike likes Jessica
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', NOW() - INTERVAL '3 hours'),

-- Chris likes Sophie
('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440010', NOW() - INTERVAL '2 hours'),

-- Ryan likes Maya
('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440008', NOW() - INTERVAL '1 hour'); 