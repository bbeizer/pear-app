import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../supabaseClient';
import { useRouter } from 'expo-router';
import type { Profile } from '../../types';
import type { Venue } from '../venueClient';
import { calculateMidpointFromProfiles } from '../../utils/locationUtils';
import { transformVenueForDatabase } from '../../utils/venueUtils';

export function usePool() {
    // Core state
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userId, setUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<Profile | null>(null);

    // Discovery filters state
    const [ageRange, setAgeRange] = useState<[number, number]>([18, 99]);
    const [distancePreference, setDistancePreference] = useState<number>(100);
    const [genderPreference, setGenderPreference] = useState<string[]>([]);
    const [religionDealBreakers, setReligionDealBreakers] = useState<string[]>([]);
    const [politicsDealBreakers, setPoliticsDealBreakers] = useState<string[]>([]);
    const [heightRange, setHeightRange] = useState<[number, number]>([0, 35]);
    const [datingIntentions, setDatingIntentions] = useState<string[]>([]);
    const [relationshipTypes, setRelationshipTypes] = useState<string[]>([]);
    const [drinkingDealBreakers, setDrinkingDealBreakers] = useState<string[]>([]);
    const [drugsDealBreakers, setDrugsDealBreakers] = useState<string[]>([]);
    const [isApplyingFilters, setIsApplyingFilters] = useState(false);

    const router = useRouter();

    useEffect(() => {
        initializePool();
    }, []);

    const initializePool = async () => {
        try {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData?.user) {
                router.replace('/auth/Login');
                return;
            }

            setUserId(userData.user.id);

            // Fetch user's own profile
            const { data: userProfileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userData.user.id)
                .single();

            if (userProfileData) {
                setUserProfile(userProfileData);
            }

            await fetchProfiles(userData.user.id);
        } catch (error) {
            console.error('Error initializing pool:', error);
            Alert.alert('Error', 'Failed to load profiles. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchProfiles = async (uid: string) => {
        try {
            // Get user's profile to access their preferences
            const { data: userProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', uid)
                .single();

            if (!userProfile) {
                console.log('No user profile found');
                return;
            }

            // Build filter query
            let query = supabase
                .from('profiles')
                .select('*')
                .neq('id', uid);

            // Apply age filter
            query = query.gte('age', ageRange[0]).lte('age', ageRange[1]);

            // Apply gender preference
            if (genderPreference.length > 0) {
                query = query.in('gender', genderPreference);
            }

            // Apply distance filter (if user has location)
            if (userProfile.latitude && userProfile.longitude && distancePreference < 100) {
                // This is a simplified distance filter - in production you'd use PostGIS
                const latDelta = distancePreference / 111; // Rough conversion
                const lngDelta = distancePreference / (111 * Math.cos(userProfile.latitude * Math.PI / 180));

                query = query
                    .gte('latitude', userProfile.latitude - latDelta)
                    .lte('latitude', userProfile.latitude + latDelta)
                    .gte('longitude', userProfile.longitude - lngDelta)
                    .lte('longitude', userProfile.longitude + lngDelta);
            }

            const { data: filteredProfiles, error } = await query;

            if (error) {
                console.error('Error fetching profiles:', error);
                return;
            }

            // Shuffle the profiles for random order
            const shuffledProfiles = filteredProfiles?.sort(() => Math.random() - 0.5) || [];
            setProfiles(shuffledProfiles);
        } catch (error) {
            console.error('Error in fetchProfiles:', error);
        }
    };

    const applyDiscoveryFilters = async () => {
        setIsApplyingFilters(true);
        try {
            await fetchProfiles(userId!);
        } catch (error) {
            console.error('Error applying filters:', error);
            Alert.alert('Error', 'Failed to apply filters. Please try again.');
        } finally {
            setIsApplyingFilters(false);
        }
    };

    const handleSwipe = async (liked: boolean, onMatch?: (profile: Profile) => void) => {
        const target = profiles[currentIndex];
        if (!target || !userId) {
            console.log('No target profile or userId, returning early');
            return;
        }

        try {
            const swipeData = {
                swiper_id: userId,
                swipee_id: target.id,
                liked,
            };

            const { error } = await supabase.from('swipes').insert(swipeData);
            if (error) {
                console.error('Error inserting swipe:', error);
                Alert.alert('Error', 'Failed to record swipe. Please try again.');
                return;
            }

            console.log(`${liked ? 'Liked' : 'Passed'} ${target.name}`);

            // If it's a like, check if it's a match
            if (liked) {
                const { data: existingSwipe } = await supabase
                    .from('swipes')
                    .select('*')
                    .eq('swiper_id', target.id)
                    .eq('swipee_id', userId)
                    .eq('liked', true)
                    .single();

                if (existingSwipe) {
                    // It's a match! Call the callback
                    onMatch?.(target);
                }
            }

            // Move to next profile
            const newIndex = currentIndex + 1;
            setCurrentIndex(newIndex);

            // If we're running low on profiles, fetch more
            if (newIndex >= profiles.length - 5) {
                await fetchProfiles(userId);
            }
        } catch (error) {
            console.error('Error in handleSwipe:', error);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        }
    };

    const handleVenueAction = async (venue: Venue, matchedProfile: Profile): Promise<boolean> => {
        if (!userId) return false;

        try {
            const venueData = transformVenueForDatabase(venue, userId);
            const { error } = await supabase
                .from('matches')
                .insert({
                    user1_id: userId,
                    user2_id: matchedProfile.id,
                    status: 'proposed',
                    ...venueData
                });

            if (error) {
                console.error('Error creating match with venue:', error);
                Alert.alert('Error', 'Failed to create match. Please try again.');
                return false;
            }

            Alert.alert('Success', `You matched with ${matchedProfile.name}! Venue suggested.`);
            return true;
        } catch (error) {
            console.error('Error handling venue action:', error);
            Alert.alert('Error', 'Something went wrong. Please try again.');
            return false;
        }
    };

    return {
        // State
        profiles,
        currentIndex,
        userId,
        isLoading,
        userProfile,
        ageRange,
        distancePreference,
        genderPreference,
        religionDealBreakers,
        politicsDealBreakers,
        heightRange,
        datingIntentions,
        relationshipTypes,
        drinkingDealBreakers,
        drugsDealBreakers,
        isApplyingFilters,
        
        // Actions
        setAgeRange,
        setDistancePreference,
        setGenderPreference,
        setReligionDealBreakers,
        setPoliticsDealBreakers,
        setHeightRange,
        setDatingIntentions,
        setRelationshipTypes,
        setDrinkingDealBreakers,
        setDrugsDealBreakers,
        applyDiscoveryFilters,
        handleSwipe,
        handleVenueAction,
        calculateMidpoint: (matchedProfile: Profile) => 
            userProfile ? calculateMidpointFromProfiles(userProfile, matchedProfile) : null,
    };
} 