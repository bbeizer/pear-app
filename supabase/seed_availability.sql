-- Seed weekly availability for all profiles
-- This creates realistic availability patterns for different people

-- Helper function to generate availability slots
-- Format: { "Sun_8:00 AM": true, "Mon_6:30 PM": true, ... }

-- Maya (25, Woman) - Evening availability, weekends free
UPDATE profiles 
SET weekly_availability = '{
  "Mon_6:00 PM": true, "Mon_6:30 PM": true, "Mon_7:00 PM": true, "Mon_7:30 PM": true, "Mon_8:00 PM": true, "Mon_8:30 PM": true,
  "Tue_6:00 PM": true, "Tue_6:30 PM": true, "Tue_7:00 PM": true, "Tue_7:30 PM": true, "Tue_8:00 PM": true, "Tue_8:30 PM": true,
  "Wed_6:00 PM": true, "Wed_6:30 PM": true, "Wed_7:00 PM": true, "Wed_7:30 PM": true, "Wed_8:00 PM": true, "Wed_8:30 PM": true,
  "Thu_6:00 PM": true, "Thu_6:30 PM": true, "Thu_7:00 PM": true, "Thu_7:30 PM": true, "Thu_8:00 PM": true, "Thu_8:30 PM": true,
  "Fri_6:00 PM": true, "Fri_6:30 PM": true, "Fri_7:00 PM": true, "Fri_7:30 PM": true, "Fri_8:00 PM": true, "Fri_8:30 PM": true,
  "Sat_10:00 AM": true, "Sat_10:30 AM": true, "Sat_11:00 AM": true, "Sat_11:30 AM": true, "Sat_12:00 PM": true, "Sat_12:30 PM": true,
  "Sat_1:00 PM": true, "Sat_1:30 PM": true, "Sat_2:00 PM": true, "Sat_2:30 PM": true, "Sat_3:00 PM": true, "Sat_3:30 PM": true,
  "Sat_4:00 PM": true, "Sat_4:30 PM": true, "Sat_5:00 PM": true, "Sat_5:30 PM": true, "Sat_6:00 PM": true, "Sat_6:30 PM": true,
  "Sat_7:00 PM": true, "Sat_7:30 PM": true, "Sat_8:00 PM": true, "Sat_8:30 PM": true,
  "Sun_10:00 AM": true, "Sun_10:30 AM": true, "Sun_11:00 AM": true, "Sun_11:30 AM": true, "Sun_12:00 PM": true, "Sun_12:30 PM": true,
  "Sun_1:00 PM": true, "Sun_1:30 PM": true, "Sun_2:00 PM": true, "Sun_2:30 PM": true, "Sun_3:00 PM": true, "Sun_3:30 PM": true,
  "Sun_4:00 PM": true, "Sun_4:30 PM": true, "Sun_5:00 PM": true, "Sun_5:30 PM": true, "Sun_6:00 PM": true, "Sun_6:30 PM": true,
  "Sun_7:00 PM": true, "Sun_7:30 PM": true, "Sun_8:00 PM": true, "Sun_8:30 PM": true
}'::jsonb
WHERE name = 'Maya';

-- Sarah (28, Woman) - Morning person, early evenings
UPDATE profiles 
SET weekly_availability = '{
  "Mon_7:00 AM": true, "Mon_7:30 AM": true, "Mon_8:00 AM": true, "Mon_8:30 AM": true, "Mon_9:00 AM": true, "Mon_9:30 AM": true,
  "Mon_5:00 PM": true, "Mon_5:30 PM": true, "Mon_6:00 PM": true, "Mon_6:30 PM": true, "Mon_7:00 PM": true, "Mon_7:30 PM": true,
  "Tue_7:00 AM": true, "Tue_7:30 AM": true, "Tue_8:00 AM": true, "Tue_8:30 AM": true, "Tue_9:00 AM": true, "Tue_9:30 AM": true,
  "Tue_5:00 PM": true, "Tue_5:30 PM": true, "Tue_6:00 PM": true, "Tue_6:30 PM": true, "Tue_7:00 PM": true, "Tue_7:30 PM": true,
  "Wed_7:00 AM": true, "Wed_7:30 AM": true, "Wed_8:00 AM": true, "Wed_8:30 AM": true, "Wed_9:00 AM": true, "Wed_9:30 AM": true,
  "Wed_5:00 PM": true, "Wed_5:30 PM": true, "Wed_6:00 PM": true, "Wed_6:30 PM": true, "Wed_7:00 PM": true, "Wed_7:30 PM": true,
  "Thu_7:00 AM": true, "Thu_7:30 AM": true, "Thu_8:00 AM": true, "Thu_8:30 AM": true, "Thu_9:00 AM": true, "Thu_9:30 AM": true,
  "Thu_5:00 PM": true, "Thu_5:30 PM": true, "Thu_6:00 PM": true, "Thu_6:30 PM": true, "Thu_7:00 PM": true, "Thu_7:30 PM": true,
  "Fri_7:00 AM": true, "Fri_7:30 AM": true, "Fri_8:00 AM": true, "Fri_8:30 AM": true, "Fri_9:00 AM": true, "Fri_9:30 AM": true,
  "Fri_5:00 PM": true, "Fri_5:30 PM": true, "Fri_6:00 PM": true, "Fri_6:30 PM": true, "Fri_7:00 PM": true, "Fri_7:30 PM": true,
  "Sat_8:00 AM": true, "Sat_8:30 AM": true, "Sat_9:00 AM": true, "Sat_9:30 AM": true, "Sat_10:00 AM": true, "Sat_10:30 AM": true,
  "Sat_11:00 AM": true, "Sat_11:30 AM": true, "Sat_12:00 PM": true, "Sat_12:30 PM": true, "Sat_1:00 PM": true, "Sat_1:30 PM": true,
  "Sat_2:00 PM": true, "Sat_2:30 PM": true, "Sat_3:00 PM": true, "Sat_3:30 PM": true, "Sat_4:00 PM": true, "Sat_4:30 PM": true,
  "Sat_5:00 PM": true, "Sat_5:30 PM": true, "Sat_6:00 PM": true, "Sat_6:30 PM": true,
  "Sun_8:00 AM": true, "Sun_8:30 AM": true, "Sun_9:00 AM": true, "Sun_9:30 AM": true, "Sun_10:00 AM": true, "Sun_10:30 AM": true,
  "Sun_11:00 AM": true, "Sun_11:30 AM": true, "Sun_12:00 PM": true, "Sun_12:30 PM": true, "Sun_1:00 PM": true, "Sun_1:30 PM": true,
  "Sun_2:00 PM": true, "Sun_2:30 PM": true, "Sun_3:00 PM": true, "Sun_3:30 PM": true, "Sun_4:00 PM": true, "Sun_4:30 PM": true,
  "Sun_5:00 PM": true, "Sun_5:30 PM": true, "Sun_6:00 PM": true, "Sun_6:30 PM": true
}'::jsonb
WHERE name = 'Sarah';

-- Emma (26, Woman) - Late night availability, weekends busy
UPDATE profiles 
SET weekly_availability = '{
  "Mon_8:00 PM": true, "Mon_8:30 PM": true, "Mon_9:00 PM": true, "Mon_9:30 PM": true, "Mon_10:00 PM": true, "Mon_10:30 PM": true,
  "Tue_8:00 PM": true, "Tue_8:30 PM": true, "Tue_9:00 PM": true, "Tue_9:30 PM": true, "Tue_10:00 PM": true, "Tue_10:30 PM": true,
  "Wed_8:00 PM": true, "Wed_8:30 PM": true, "Wed_9:00 PM": true, "Wed_9:30 PM": true, "Wed_10:00 PM": true, "Wed_10:30 PM": true,
  "Thu_8:00 PM": true, "Thu_8:30 PM": true, "Thu_9:00 PM": true, "Thu_9:30 PM": true, "Thu_10:00 PM": true, "Thu_10:30 PM": true,
  "Fri_8:00 PM": true, "Fri_8:30 PM": true, "Fri_9:00 PM": true, "Fri_9:30 PM": true, "Fri_10:00 PM": true, "Fri_10:30 PM": true,
  "Sat_9:00 PM": true, "Sat_9:30 PM": true, "Sat_10:00 PM": true, "Sat_10:30 PM": true,
  "Sun_9:00 PM": true, "Sun_9:30 PM": true, "Sun_10:00 PM": true, "Sun_10:30 PM": true
}'::jsonb
WHERE name = 'Emma';

-- Jessica (24, Woman) - Flexible schedule, lots of availability
UPDATE profiles 
SET weekly_availability = '{
  "Mon_6:00 PM": true, "Mon_6:30 PM": true, "Mon_7:00 PM": true, "Mon_7:30 PM": true, "Mon_8:00 PM": true, "Mon_8:30 PM": true, "Mon_9:00 PM": true, "Mon_9:30 PM": true,
  "Tue_6:00 PM": true, "Tue_6:30 PM": true, "Tue_7:00 PM": true, "Tue_7:30 PM": true, "Tue_8:00 PM": true, "Tue_8:30 PM": true, "Tue_9:00 PM": true, "Tue_9:30 PM": true,
  "Wed_6:00 PM": true, "Wed_6:30 PM": true, "Wed_7:00 PM": true, "Wed_7:30 PM": true, "Wed_8:00 PM": true, "Wed_8:30 PM": true, "Wed_9:00 PM": true, "Wed_9:30 PM": true,
  "Thu_6:00 PM": true, "Thu_6:30 PM": true, "Thu_7:00 PM": true, "Thu_7:30 PM": true, "Thu_8:00 PM": true, "Thu_8:30 PM": true, "Thu_9:00 PM": true, "Thu_9:30 PM": true,
  "Fri_6:00 PM": true, "Fri_6:30 PM": true, "Fri_7:00 PM": true, "Fri_7:30 PM": true, "Fri_8:00 PM": true, "Fri_8:30 PM": true, "Fri_9:00 PM": true, "Fri_9:30 PM": true,
  "Sat_11:00 AM": true, "Sat_11:30 AM": true, "Sat_12:00 PM": true, "Sat_12:30 PM": true, "Sat_1:00 PM": true, "Sat_1:30 PM": true, "Sat_2:00 PM": true, "Sat_2:30 PM": true,
  "Sat_3:00 PM": true, "Sat_3:30 PM": true, "Sat_4:00 PM": true, "Sat_4:30 PM": true, "Sat_5:00 PM": true, "Sat_5:30 PM": true, "Sat_6:00 PM": true, "Sat_6:30 PM": true,
  "Sat_7:00 PM": true, "Sat_7:30 PM": true, "Sat_8:00 PM": true, "Sat_8:30 PM": true, "Sat_9:00 PM": true, "Sat_9:30 PM": true,
  "Sun_11:00 AM": true, "Sun_11:30 AM": true, "Sun_12:00 PM": true, "Sun_12:30 PM": true, "Sun_1:00 PM": true, "Sun_1:30 PM": true, "Sun_2:00 PM": true, "Sun_2:30 PM": true,
  "Sun_3:00 PM": true, "Sun_3:30 PM": true, "Sun_4:00 PM": true, "Sun_4:30 PM": true, "Sun_5:00 PM": true, "Sun_5:30 PM": true, "Sun_6:00 PM": true, "Sun_6:30 PM": true,
  "Sun_7:00 PM": true, "Sun_7:30 PM": true, "Sun_8:00 PM": true, "Sun_8:30 PM": true, "Sun_9:00 PM": true, "Sun_9:30 PM": true
}'::jsonb
WHERE name = 'Jessica';

-- Rachel (27, Woman) - Weekend warrior, limited weekday availability
UPDATE profiles 
SET weekly_availability = '{
  "Mon_7:00 PM": true, "Mon_7:30 PM": true, "Mon_8:00 PM": true, "Mon_8:30 PM": true,
  "Tue_7:00 PM": true, "Tue_7:30 PM": true, "Tue_8:00 PM": true, "Tue_8:30 PM": true,
  "Wed_7:00 PM": true, "Wed_7:30 PM": true, "Wed_8:00 PM": true, "Wed_8:30 PM": true,
  "Thu_7:00 PM": true, "Thu_7:30 PM": true, "Thu_8:00 PM": true, "Thu_8:30 PM": true,
  "Fri_7:00 PM": true, "Fri_7:30 PM": true, "Fri_8:00 PM": true, "Fri_8:30 PM": true,
  "Sat_9:00 AM": true, "Sat_9:30 AM": true, "Sat_10:00 AM": true, "Sat_10:30 AM": true, "Sat_11:00 AM": true, "Sat_11:30 AM": true,
  "Sat_12:00 PM": true, "Sat_12:30 PM": true, "Sat_1:00 PM": true, "Sat_1:30 PM": true, "Sat_2:00 PM": true, "Sat_2:30 PM": true,
  "Sat_3:00 PM": true, "Sat_3:30 PM": true, "Sat_4:00 PM": true, "Sat_4:30 PM": true, "Sat_5:00 PM": true, "Sat_5:30 PM": true,
  "Sat_6:00 PM": true, "Sat_6:30 PM": true, "Sat_7:00 PM": true, "Sat_7:30 PM": true, "Sat_8:00 PM": true, "Sat_8:30 PM": true,
  "Sat_9:00 PM": true, "Sat_9:30 PM": true, "Sat_10:00 PM": true, "Sat_10:30 PM": true,
  "Sun_9:00 AM": true, "Sun_9:30 AM": true, "Sun_10:00 AM": true, "Sun_10:30 AM": true, "Sun_11:00 AM": true, "Sun_11:30 AM": true,
  "Sun_12:00 PM": true, "Sun_12:30 PM": true, "Sun_1:00 PM": true, "Sun_1:30 PM": true, "Sun_2:00 PM": true, "Sun_2:30 PM": true,
  "Sun_3:00 PM": true, "Sun_3:30 PM": true, "Sun_4:00 PM": true, "Sun_4:30 PM": true, "Sun_5:00 PM": true, "Sun_5:30 PM": true,
  "Sun_6:00 PM": true, "Sun_6:30 PM": true, "Sun_7:00 PM": true, "Sun_7:30 PM": true, "Sun_8:00 PM": true, "Sun_8:30 PM": true,
  "Sun_9:00 PM": true, "Sun_9:30 PM": true, "Sun_10:00 PM": true, "Sun_10:30 PM": true
}'::jsonb
WHERE name = 'Rachel';

-- Update current user (Ben) with some availability that overlaps with Maya
UPDATE profiles 
SET weekly_availability = '{
  "Mon_6:00 PM": true, "Mon_6:30 PM": true, "Mon_7:00 PM": true, "Mon_7:30 PM": true, "Mon_8:00 PM": true, "Mon_8:30 PM": true,
  "Tue_6:00 PM": true, "Tue_6:30 PM": true, "Tue_7:00 PM": true, "Tue_7:30 PM": true, "Tue_8:00 PM": true, "Tue_8:30 PM": true,
  "Wed_6:00 PM": true, "Wed_6:30 PM": true, "Wed_7:00 PM": true, "Wed_7:30 PM": true, "Wed_8:00 PM": true, "Wed_8:30 PM": true,
  "Thu_6:00 PM": true, "Thu_6:30 PM": true, "Thu_7:00 PM": true, "Thu_7:30 PM": true, "Thu_8:00 PM": true, "Thu_8:30 PM": true,
  "Fri_6:00 PM": true, "Fri_6:30 PM": true, "Fri_7:00 PM": true, "Fri_7:30 PM": true, "Fri_8:00 PM": true, "Fri_8:30 PM": true,
  "Sat_10:00 AM": true, "Sat_10:30 AM": true, "Sat_11:00 AM": true, "Sat_11:30 AM": true, "Sat_12:00 PM": true, "Sat_12:30 PM": true,
  "Sat_1:00 PM": true, "Sat_1:30 PM": true, "Sat_2:00 PM": true, "Sat_2:30 PM": true, "Sat_3:00 PM": true, "Sat_3:30 PM": true,
  "Sat_4:00 PM": true, "Sat_4:30 PM": true, "Sat_5:00 PM": true, "Sat_5:30 PM": true, "Sat_6:00 PM": true, "Sat_6:30 PM": true,
  "Sat_7:00 PM": true, "Sat_7:30 PM": true, "Sat_8:00 PM": true, "Sat_8:30 PM": true,
  "Sun_10:00 AM": true, "Sun_10:30 AM": true, "Sun_11:00 AM": true, "Sun_11:30 AM": true, "Sun_12:00 PM": true, "Sun_12:30 PM": true,
  "Sun_1:00 PM": true, "Sun_1:30 PM": true, "Sun_2:00 PM": true, "Sun_2:30 PM": true, "Sun_3:00 PM": true, "Sun_3:30 PM": true,
  "Sun_4:00 PM": true, "Sun_4:30 PM": true, "Sun_5:00 PM": true, "Sun_5:30 PM": true, "Sun_6:00 PM": true, "Sun_6:30 PM": true,
  "Sun_7:00 PM": true, "Sun_7:30 PM": true, "Sun_8:00 PM": true, "Sun_8:30 PM": true
}'::jsonb
WHERE name = 'Ben'; 