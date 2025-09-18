# Rachel Green Venue Confirmation Guide

## Overview
This guide will help you confirm that Rachel Green wants to go to Regina's Pizza with you, and create a calendar event that shows up in the Calendar tab.

## Step 1: Find Rachel's Match
First, run this SQL to find Rachel's profile and current matches:

```sql
-- Find Rachel's profile
SELECT id, name, email 
FROM profiles 
WHERE name ILIKE '%rachel%' OR name ILIKE '%green%';

-- Find matches with Rachel
SELECT 
    m.id,
    m.user1_name,
    m.user2_name,
    m.status,
    m.user1_proposed_venue,
    m.user2_proposed_venue,
    m.venue_agreed,
    m.created_at
FROM matches m
WHERE m.user1_name ILIKE '%rachel%' OR m.user2_name ILIKE '%rachel%'
   OR m.user1_name ILIKE '%green%' OR m.user2_name ILIKE '%green%'
ORDER BY m.created_at DESC;
```

## Step 2: Update the Match
Once you have the match ID, run this SQL to confirm Rachel's venue choice:

```sql
-- Replace 'YOUR_MATCH_ID' with the actual match ID from Step 1
UPDATE matches 
SET 
    -- Set Rachel's proposed venue to Regina's Pizza
    user1_proposed_venue = CASE 
        WHEN user1_name ILIKE '%rachel%' OR user1_name ILIKE '%green%' THEN 
            '{"name": "Regina''s Pizza", "location": {"address": "123 Main St, Boston, MA 02101"}, "rating": 4.5, "priceLevel": 2, "categories": ["restaurant", "pizza"]}'::jsonb
        ELSE user1_proposed_venue
    END,
    user2_proposed_venue = CASE 
        WHEN user2_name ILIKE '%rachel%' OR user2_name ILIKE '%green%' THEN 
            '{"name": "Regina''s Pizza", "location": {"address": "123 Main St, Boston, MA 02101"}, "rating": 4.5, "priceLevel": 2, "categories": ["restaurant", "pizza"]}'::jsonb
        ELSE user2_proposed_venue
    END,
    
    -- Mark venue as agreed
    venue_agreed = true,
    agreed_venue = '{"name": "Regina''s Pizza", "location": {"address": "123 Main St, Boston, MA 02101"}, "rating": 4.5, "priceLevel": 2, "categories": ["restaurant", "pizza"]}'::jsonb,
    
    -- Set both users to propose the same time (tomorrow at 7 PM)
    user1_proposed_time = 'Tomorrow_7:00_PM',
    user2_proposed_time = 'Tomorrow_7:00_PM',
    
    -- Set meeting details
    meeting_type = 'in-person',
    suggested_activity = 'Dinner at Regina''s Pizza',
    suggested_venue = 'Regina''s Pizza - 123 Main St, Boston, MA',
    
    -- Mark as scheduled
    status = 'scheduled',
    updated_at = NOW()
WHERE id = 'YOUR_MATCH_ID';
```

## Step 3: Verify the Calendar Event
After running the update, the match should now appear in the Calendar tab because:
- ✅ **Status is 'scheduled'** - The Calendar screen filters for scheduled matches
- ✅ **Both users have the same proposed time** - This triggers the auto-scheduling
- ✅ **Venue is agreed** - Both users want to go to Regina's Pizza
- ✅ **Meeting type is set** - In-person dinner

## What You'll See in the Calendar
The calendar event will show:
- **Partner**: Rachel Green
- **Time**: Tomorrow 7:00 PM
- **Type**: In-person date
- **Activity**: Dinner at Regina's Pizza
- **Venue**: Regina's Pizza - 123 Main St, Boston, MA

## Files Created
- `find_rachel_match.sql` - Find Rachel's profile and matches
- `confirm_rachel_venue.sql` - Confirm venue choice
- `complete_rachel_confirmation.sql` - Complete solution
- `rachel_confirmation_guide.md` - This guide

## Next Steps
1. Run the SQL queries in order
2. Check the Calendar tab in your app
3. You should see the new event with Rachel Green at Regina's Pizza!
