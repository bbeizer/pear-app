# Pear App Roadmap

## 1. Profile Setup Improvements
- [ ] Add additional profile fields (bio, interests, etc.)
- [ ] Implement input validation (required fields, email format, etc.)
- [ ] Add user feedback for incomplete/invalid profiles
- [ ] Allow users to edit their profile after initial setup

## 2. Photo Handling & UI
- [ ] Allow users to upload multiple photos during profile setup
- [ ] Add ability to scroll/swipe between photos in the Pool screen
- [ ] Set a main photo as the user's icon/avatar throughout the app
- [ ] Improve photo display quality and aspect ratio
- [ ] Add fallback/default avatar if no photo is uploaded

## 3. Pool Screen Enhancements
- [ ] Display user photos in a swipeable carousel
- [ ] Show main photo as the user's icon in match cards and other UI
- [ ] Add smooth transitions/animations between photos

## 4. Validation & User Experience
- [ ] Add real-time validation for all forms (profile, signup, etc.)
- [ ] Show clear error messages and success feedback
- [ ] Prevent navigation if required fields are missing

## 5. Stretch Goals
- [ ] Add photo cropping or editing tools
- [ ] Allow users to reorder or delete photos
- [ ] Add profile completeness progress bar
- [ ] Integrate haptic feedback for key actions

## 6. Video Chat Integration & Calendar Linking
- [ ] Integrate video chat API (e.g., Daily, Twilio, or similar)
- [ ] Automatically join the video room at the scheduled match time
- [ ] Add calendar events for scheduled video chats
- [ ] Make calendar events clickable to join the video room
- [ ] Handle notifications/reminders for upcoming video chats
- [ ] Ensure smooth transition from app to video chat and back

## 7. Profile Data Model & UI Expansion (in progress)
- [ ] Update Supabase `profiles` table:
    - [ ] Add columns: gender, sexuality, age, age_range_min, age_range_max, religion, politics, deal_breakers (jsonb)
- [ ] Update TypeScript `Profile` type/interface
- [ ] Add new fields to profile setup UI
- [ ] Add deal-breaker toggles for each field
- [ ] Save and load new fields and deal-breakers from Supabase
- [ ] Add validation for new fields

---

**Next Steps:**
- Prioritize profile setup and validation improvements
- Then focus on photo upload and carousel UI for the Pool screen
- Use this roadmap to track progress and add new ideas as needed! 