#!/bin/bash

# Script to seed the database with sample profiles
echo "Seeding database with sample profiles..."

# Run the seed data SQL file
psql "$DATABASE_URL" -f supabase/seed_data.sql

echo "Seed data inserted successfully!"
echo "You should now see 16 sample profiles from the Newton/Boston area." 