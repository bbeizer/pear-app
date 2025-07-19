# Pear App Roadmap

## 1. Profile Setup Improvements
- [x] Add additional profile fields (bio, interests, etc.)
- [x] Implement input validation (required fields, email format, etc.)
- [x] Add user feedback for incomplete/invalid profiles
- [ ] Allow users to edit their profile after initial setup

## 2. Photo Handling & UI
- [x] Allow users to upload multiple photos during profile setup
- [x] Add ability to scroll/swipe between photos in the Pool screen
- [x] Set a main photo as the user's icon/avatar throughout the app
- [x] Improve photo display quality and aspect ratio
- [x] Add fallback/default avatar if no photo is uploaded

## 3. Pool Screen Enhancements
- [x] Display user photos in a swipeable carousel
- [x] Show main photo as the user's icon in match cards and other UI
- [x] Add smooth transitions/animations between photos

## 4. Validation & User Experience
- [x] Add real-time validation for all forms (profile, signup, etc.)
- [x] Show clear error messages and success feedback
- [x] Prevent navigation if required fields are missing

## 5. Stretch Goals
- [ ] Add photo cropping or editing tools
- [ ] Allow users to reorder or delete photos
- [x] Add profile completeness progress bar
- [x] Integrate haptic feedback for key actions

## 6. Video Chat Integration & Calendar Linking
- [x] Integrate video chat API (e.g., Daily, Twilio, or similar) - MVP with modal selection
- [ ] Automatically join the video room at the scheduled match time
- [ ] Add calendar events for scheduled video chats
- [ ] Make calendar events clickable to join the video room
- [ ] Handle notifications/reminders for upcoming video chats
- [ ] Ensure smooth transition from app to video chat and back

## 7. Profile Data Model & UI Expansion (COMPLETED ✅)
- [x] Update Supabase `profiles` table:
    - [x] Add columns: gender, sexuality, age, age_range_min, age_range_max, religion, politics, deal_breakers (jsonb)
- [x] Update TypeScript `Profile` type/interface
- [x] Add new fields to profile setup UI
- [x] Add deal-breaker toggles for each field
- [x] Save and load new fields and deal-breakers from Supabase
- [x] Add validation for new fields

## 8. NEW: Meeting Preferences & Activity Suggestions
- [x] Add modal for meeting type selection (in-person vs video)
- [x] Implement activity suggestions for in-person meetings
- [x] Integrate with swipe/like functionality
- [ ] Add Google Maps/Yelp API integration for location suggestions
- [ ] Add location-based activity recommendations

---

**Next Steps:**
- ✅ Profile setup and validation improvements - COMPLETED
- ✅ Photo upload and carousel UI for the Pool screen - COMPLETED  
- ✅ Meeting preferences modal - COMPLETED
- 🎯 Focus on: Google Maps/Yelp API integration for location suggestions
- 🎯 Future: Full video chat integration with calendar linking 