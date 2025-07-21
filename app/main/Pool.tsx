import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'expo-router';
import type { Profile } from '../../types';
import { useHaptics } from '../../lib/hooks/useHaptics';

// Import our new components
import SwipeCard from '../components/SwipeCard';
import ActionButtons from '../components/ActionButtons';
import DiscoveryFilters from '../components/DiscoveryFilters';

export default function Pool() {
    // Core state
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userId, setUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Discovery filters state
    const [showDiscoverySettings, setShowDiscoverySettings] = useState(false);
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
    const { lightImpact, successNotification } = useHaptics();

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
                // For now, we'll just filter by state/city if available
                if (userProfile.state) {
                    query = query.eq('state', userProfile.state);
                }
            }

            // Apply deal breakers
            if (religionDealBreakers.length > 0) {
                query = query.not('religion', 'in', `(${religionDealBreakers.map(r => `"${r}"`).join(',')})`);
            }

            if (politicsDealBreakers.length > 0) {
                query = query.not('politics', 'in', `(${politicsDealBreakers.map(p => `"${p}"`).join(',')})`);
            }

            // Get swipes to exclude already swiped users
            const { data: swipes } = await supabase
                .from('swipes')
                .select('swipee_id')
                .eq('swiper_id', uid);

            const swipedUserIds = swipes?.map(s => s.swipee_id) || [];
            if (swipedUserIds.length > 0) {
                query = query.not('id', 'in', `(${swipedUserIds.map(id => `"${id}"`).join(',')})`);
            }

            // Get matches to exclude matched users
            const { data: matches } = await supabase
                .from('matches')
                .select('user1_id, user2_id')
                .or(`user1_id.eq.${uid},user2_id.eq.${uid}`);

            const matchedUserIds = matches?.map(m =>
                m.user1_id === uid ? m.user2_id : m.user1_id
            ) || [];
            if (matchedUserIds.length > 0) {
                query = query.not('id', 'in', `(${matchedUserIds.map(id => `"${id}"`).join(',')})`);
            }

            const { data: profiles, error } = await query.limit(50);

            if (error) {
                console.error('Error fetching profiles:', error);
                return;
            }

            setProfiles(profiles || []);
            setCurrentIndex(0);
        } catch (error) {
            console.error('Error in fetchProfiles:', error);
        }
    };

    const applyDiscoveryFilters = async () => {
        setIsApplyingFilters(true);
        try {
            await fetchProfiles(userId!);
            setShowDiscoverySettings(false);
            successNotification();
        } catch (error) {
            console.error('Error applying filters:', error);
            Alert.alert('Error', 'Failed to apply filters. Please try again.');
        } finally {
            setIsApplyingFilters(false);
        }
    };

    const handleSwipe = async (liked: boolean) => {
        lightImpact();

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

    const currentProfile = profiles[currentIndex];

    if (isLoading) {
        return (
            <View style={styles.absoluteContainer}>
                <StatusBar translucent backgroundColor="transparent" style="light" />
                <Text style={styles.emptyText}>Loading profiles...</Text>
            </View>
        );
    }

    if (!currentProfile) {
        return (
            <View style={styles.absoluteContainer}>
                <StatusBar translucent backgroundColor="transparent" style="light" />
                <Text style={styles.emptyText}>You've seen everyone!</Text>
                <TouchableOpacity
                    onPress={() => window.location.reload()}
                    style={styles.refreshButton}
                >
                    <Text style={styles.refreshText}>Refresh</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.absoluteContainer}>
            <StatusBar translucent backgroundColor="transparent" style="light" />

            {/* Discovery Settings Button */}
            <TouchableOpacity
                style={styles.discoverySettingsButton}
                onPress={() => setShowDiscoverySettings(true)}
            >
                <Ionicons name="filter" size={20} color="#00C48C" />
                {profiles.length > 0 && (
                    <View style={styles.filterBadge}>
                        <Text style={styles.filterBadgeText}>{profiles.length}</Text>
                    </View>
                )}
            </TouchableOpacity>

            {/* Profile Card */}
            <SwipeCard profile={currentProfile} />

            {/* Action Buttons */}
            <ActionButtons
                onPass={() => handleSwipe(false)}
                onLike={() => handleSwipe(true)}
                disabled={isApplyingFilters}
            />

            {/* Discovery Filters Modal */}
            {showDiscoverySettings && (
                <DiscoveryFilters
                    ageRange={ageRange}
                    distancePreference={distancePreference}
                    genderPreference={genderPreference}
                    religionDealBreakers={religionDealBreakers}
                    politicsDealBreakers={politicsDealBreakers}
                    heightRange={heightRange}
                    datingIntentions={datingIntentions}
                    relationshipTypes={relationshipTypes}
                    drinkingDealBreakers={drinkingDealBreakers}
                    drugsDealBreakers={drugsDealBreakers}
                    onAgeRangeChange={setAgeRange}
                    onDistanceChange={setDistancePreference}
                    onGenderPreferenceChange={setGenderPreference}
                    onReligionDealBreakersChange={setReligionDealBreakers}
                    onPoliticsDealBreakersChange={setPoliticsDealBreakers}
                    onHeightRangeChange={setHeightRange}
                    onDatingIntentionsChange={setDatingIntentions}
                    onRelationshipTypesChange={setRelationshipTypes}
                    onDrinkingDealBreakersChange={setDrinkingDealBreakers}
                    onDrugsDealBreakersChange={setDrugsDealBreakers}
                    onApplyFilters={applyDiscoveryFilters}
                    onClose={() => setShowDiscoverySettings(false)}
                    profileCount={profiles.length}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    absoluteContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    discoverySettingsButton: {
        position: 'absolute',
        top: 60,
        left: 20,
        zIndex: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 12,
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    filterBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#FF6B6B',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    emptyText: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 200,
    },
    refreshButton: {
        backgroundColor: '#00C48C',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        alignSelf: 'center',
        marginTop: 20,
    },
    refreshText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
