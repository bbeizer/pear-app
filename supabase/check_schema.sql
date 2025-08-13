-- Check current database schema
-- Run this in Supabase SQL Editor to see what columns actually exist

-- Check profiles table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Check swipes table structure  
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'swipes' 
ORDER BY ordinal_position;

-- Check matches table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'matches' 
ORDER BY ordinal_position;

-- Check constraints
SELECT conname, contype, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass OR conrelid = 'swipes'::regclass OR conrelid = 'matches'::regclass;
