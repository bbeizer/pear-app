import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Dimensions,
    TextInput,
    FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from 'lib/supabaseClient';
import { getSupabaseWithAuth } from 'lib/supabaseWithAuth';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { Profile } from '../../types';
import { fetchAvailableProfiles, fetchUserMatches } from '../../lib/supabaseUtils';
import { useHaptics } from '../../lib/hooks/useHaptics';
import Slider from '@react-native-community/slider';
import MultiSlider from '@ptomasroos/react-native-multi-slider';

const { height: screenHeight } = Dimensions.get('window');

const GENDERS = ['Man', 'Woman', 'Non-binary', 'Other'];
const RELIGIONS = ['None', 'Christian', 'Jewish', 'Muslim', 'Hindu', 'Buddhist', 'Spiritual', 'Other'];
const POLITICS = ['Liberal', 'Moderate', 'Conservative', 'Other'];
const HEIGHTS = ['4\'0"', '4\'1"', '4\'2"', '4\'3"', '4\'4"', '4\'5"', '4\'6"', '4\'7"', '4\'8"', '4\'9"', '4\'10"', '4\'11"', '5\'0"', '5\'1"', '5\'2"', '5\'3"', '5\'4"', '5\'5"', '5\'6"', '5\'7"', '5\'8"', '5\'9"', '5\'10"', '5\'11"', '6\'0"', '6\'1"', '6\'2"', '6\'3"', '6\'4"', '6\'5"', '6\'6"', '6\'7"', '6\'8"', '6\'9"', '6\'10"', '6\'11"', '7\'0"'];
const DATING_INTENTIONS = ['Long-term relationship', 'Short-term relationship', 'Casual dating', 'Friendship', 'Marriage', 'Not sure yet'];
const RELATIONSHIP_TYPES = ['Monogamous', 'Non-monogamous', 'Polyamorous', 'Open relationship', 'Not sure yet'];
const DRINKING_FREQUENCY = ['Never', 'Rarely', 'Socially', 'Often', 'Very often'];
const DRUGS_FREQUENCY = ['Never', 'Rarely', 'Socially', 'Often', 'Very often'];

interface Venue {
    place_id: string;
    name: string;
    address: string;
    rating?: number;
    types: string[];
}

export default function Pool() {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userId, setUserId] = useState<string | null>(null);
    const [showMeetingModal, setShowMeetingModal] = useState(false);
    const [selectedMeetingType, setSelectedMeetingType] = useState<'in-person' | 'video' | null>(null);
    const [selectedActivity, setSelectedActivity] = useState<string>('');
    const [locationQuery, setLocationQuery] = useState<string>('');
    const [venues, setVenues] = useState<Venue[]>([]);
    const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
    const [showVenueSearch, setShowVenueSearch] = useState(false);

    // Discovery settings state
    const [showDiscoverySettings, setShowDiscoverySettings] = useState(false);
    const [ageRange, setAgeRange] = useState<[number, number]>([25, 35]);
    const [distancePreference, setDistancePreference] = useState<number>(25);
    const [genderPreference, setGenderPreference] = useState<string[]>([]);
    const [religionDealBreakers, setReligionDealBreakers] = useState<string[]>([]);
    const [politicsDealBreakers, setPoliticsDealBreakers] = useState<string[]>([]);
    const [heightRange, setHeightRange] = useState<[number, number]>([0, 35]); // HEIGHTS array indices
    const [datingIntentions, setDatingIntentions] = useState<string[]>([]);
    const [relationshipTypes, setRelationshipTypes] = useState<string[]>([]);
    const [drinkingDealBreakers, setDrinkingDealBreakers] = useState<string[]>([]);
    const [drugsDealBreakers, setDrugsDealBreakers] = useState<string[]>([]);
    const [isApplyingFilters, setIsApplyingFilters] = useState(false);

    const router = useRouter();
    const { lightImpact, successNotification } = useHaptics();

    const activities = [
        'Coffee ☕️',
        'Dinner 🍽️',
        'Drinks 🍸',
        'Walk in the park 🌳',
        'Museum visit 🏛️',
        'Movie 🎬',
        'Bowling 🎳',
        'Escape room 🧩',
        'Mini golf ⛳',
        'Art gallery 🎨'
    ];

    // Google Places API search
    const searchVenues = async (query: string) => {
        if (!query.trim()) {
            setVenues([]);
            return;
        }

        try {
            // For MVP, we'll use a mock API response
            // In production, you'd use: `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=YOUR_API_KEY`

            // Mock venues for now
            const mockVenues: Venue[] = [
                {
                    place_id: '1',
                    name: 'Blue Bottle Coffee',
                    address: '123 Main St, San Francisco, CA',
                    rating: 4.5,
                    types: ['cafe', 'food']
                },
                {
                    place_id: '2',
                    name: 'The Mission Restaurant',
                    address: '456 Mission St, San Francisco, CA',
                    rating: 4.2,
                    types: ['restaurant', 'food']
                },
                {
                    place_id: '3',
                    name: 'Golden Gate Park',
                    address: 'Golden Gate Park, San Francisco, CA',
                    rating: 4.8,
                    types: ['park', 'natural_feature']
                }
            ];

            setVenues(mockVenues.filter(venue =>
                venue.name.toLowerCase().includes(query.toLowerCase()) ||
                venue.address.toLowerCase().includes(query.toLowerCase())
            ));
        } catch (error) {
            console.error('Error searching venues:', error);
            setVenues([]);
        }
    };

    // Function to apply discovery filters to profiles
    const applyDiscoveryFilters = async () => {
        setIsApplyingFilters(true);
        const { data: userData } = await supabase.auth.getUser();
        const uid = userData?.user?.id;
        if (!uid) return;

        setUserId(uid);

        // Get user's profile to access location data
        const { data: userProfile } = await supabase
            .from('profiles')
            .select('latitude, longitude, distance_preference')
            .eq('id', uid)
            .single();

        const matches = await fetchUserMatches(uid);
        const excludedIds = [uid, ...matches.map(m => m.user1_id === uid ? m.user2_id : m.user1_id)];

        // Get all available profiles first
        let available = await fetchAvailableProfiles(
            excludedIds,
            userProfile?.latitude,
            userProfile?.longitude,
            distancePreference // Use discovery setting instead of profile setting
        );

        // Apply discovery filters
        available = available.filter(profile => {
            // Age filter
            if (profile.age && (profile.age < ageRange[0] || profile.age > ageRange[1])) {
                return false;
            }

            // Gender preference filter
            if (genderPreference.length > 0 && profile.gender && !genderPreference.includes(profile.gender)) {
                return false;
            }

            // Religion deal breaker filter
            if (religionDealBreakers.length > 0 && profile.religion && religionDealBreakers.includes(profile.religion)) {
                return false;
            }

            // Politics deal breaker filter
            if (politicsDealBreakers.length > 0 && profile.politics && politicsDealBreakers.includes(profile.politics)) {
                return false;
            }

            // Height range filter
            if (profile.height) {
                const profileHeightIndex = HEIGHTS.indexOf(profile.height);
                if (profileHeightIndex !== -1 && (profileHeightIndex < heightRange[0] || profileHeightIndex > heightRange[1])) {
                    return false;
                }
            }

            // Dating intentions filter
            if (datingIntentions.length > 0 && profile.dating_intentions && !datingIntentions.includes(profile.dating_intentions)) {
                return false;
            }

            // Relationship type filter
            if (relationshipTypes.length > 0 && profile.relationship_type && !relationshipTypes.includes(profile.relationship_type)) {
                return false;
            }

            // Drinking frequency deal breaker filter
            if (drinkingDealBreakers.length > 0 && profile.drinking_frequency && drinkingDealBreakers.includes(profile.drinking_frequency)) {
                return false;
            }

            // Drugs frequency deal breaker filter
            if (drugsDealBreakers.length > 0 && profile.drugs_frequency && drugsDealBreakers.includes(profile.drugs_frequency)) {
                return false;
            }

            return true;
        });

        setProfiles(available);
        setCurrentIndex(0); // Reset to first profile after filtering
        setIsApplyingFilters(false);
    };

    useEffect(() => {
        applyDiscoveryFilters();
    }, []);

    const handlePearClick = () => {
        lightImpact();
        setShowMeetingModal(true);
    };

    const handleMeetingTypeSelect = (type: 'in-person' | 'video') => {
        setSelectedMeetingType(type);
        if (type === 'video') {
            // For video, we can proceed directly
            handleSwipe(true);
            setShowMeetingModal(false);
            setSelectedMeetingType(null);
        } else {
            // For in-person, show venue search
            setShowVenueSearch(true);
        }
    };

    const handleVenueSelect = (venue: Venue) => {
        lightImpact();
        setSelectedVenue(venue);
        setShowVenueSearch(false);
        setLocationQuery(venue.name);
    };

    const handleActivitySelect = (activity: string) => {
        successNotification();
        setSelectedActivity(activity);
        // Proceed with the like and selected activity/venue
        handleSwipe(true);
        setShowMeetingModal(false);
        setSelectedMeetingType(null);
        setSelectedActivity('');
        setSelectedVenue(null);
        setLocationQuery('');
        setShowVenueSearch(false);
    };

    const handleSwipe = async (liked: boolean) => {
        const target = profiles[currentIndex];
        if (!target || !userId) return;

        const session = await supabase.auth.getSession();
        const uid = session.data.session?.user?.id;
        const token = session.data.session?.access_token;
        if (!uid || !token) return;

        const authedSupabase = await getSupabaseWithAuth();

        // Prepare swipe data
        const swipeData: any = {
            swiper_id: uid,
            swipee_id: target.id,
            liked,
        };

        // If they liked and selected meeting type, save that info
        if (liked && selectedMeetingType) {
            swipeData.meeting_type = selectedMeetingType;
            if (selectedActivity) {
                swipeData.suggested_activity = selectedActivity;
            }
            if (selectedVenue) {
                swipeData.suggested_venue = selectedVenue.name;
            }
        }

        await authedSupabase.from('swipes').insert(swipeData);

        console.log(`${liked ? 'Liked' : 'Passed'} ${target.name}`);
        if (liked && selectedActivity) {
            console.log(`Suggested activity: ${selectedActivity}`);
            if (selectedVenue) {
                console.log(`Suggested venue: ${selectedVenue.name} at ${selectedVenue.address}`);
            }
        }
        setCurrentIndex(prev => prev + 1);
    };

    const currentProfile = profiles[currentIndex];

    if (!currentProfile) {
        return (
            <View style={styles.absoluteContainer}>
                <StatusBar translucent backgroundColor="transparent" style="light" />
                <Text style={styles.emptyText}>You've seen everyone!</Text>
                <TouchableOpacity onPress={() => window.location.reload()} style={styles.refreshButton}>
                    <Text style={styles.refreshText}>Refresh</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const photos = currentProfile.photos ?? [];
    const prompts = currentProfile.prompts ?? [];

    const interleaved: React.ReactNode[] = [];

    // Profile info card at the top
    interleaved.push(
        <View key="profile-info-card" style={styles.profileInfoCard}>
            <Text style={styles.profileNameLarge}>{currentProfile.name}</Text>
            <Text style={styles.profileDetails}>
                {currentProfile.age} • {currentProfile.gender} • {currentProfile.height}
            </Text>
            {!!currentProfile.bio && (
                <Text style={styles.profileBio}>{currentProfile.bio}</Text>
            )}
            <View style={styles.profileTagsRow}>
                {currentProfile.religion && currentProfile.religion !== 'None' && (
                    <Text style={styles.profileTag}>{currentProfile.religion}</Text>
                )}
                {currentProfile.politics && (
                    <Text style={styles.profileTag}>{currentProfile.politics}</Text>
                )}
                {currentProfile.city && currentProfile.state && (
                    <Text style={styles.profileTag}>📍 {currentProfile.city}, {currentProfile.state}</Text>
                )}
            </View>
        </View>
    );

    // All photos flow normally
    for (let i = 0; i < photos.length; i++) {
        interleaved.push(
            <Image
                key={`photo-${i}`}
                source={{ uri: photos[i].url }}
                style={styles.fullScreenPhoto}
                resizeMode="cover"
            />
        );

        if (i < prompts.length) {
            const prompt = prompts[i];
            interleaved.push(
                <View key={`prompt-paired-${i}`} style={styles.promptCard}>
                    <Text style={styles.promptQuestion}>{prompt.question}</Text>
                    <Text style={styles.promptAnswer}>{prompt.answer}</Text>
                </View>
            );
        }
    }

    // Extra prompts if more prompts than photos
    for (let j = photos.length; j < prompts.length; j++) {
        const prompt = prompts[j];
        interleaved.push(
            <View key={`prompt-extra-${j}`} style={styles.promptCard}>
                <Text style={styles.promptQuestion}>{prompt.question}</Text>
                <Text style={styles.promptAnswer}>{prompt.answer}</Text>
            </View>
        );
    }

    return (
        <View style={styles.absoluteContainer}>
            <StatusBar translucent backgroundColor="transparent" style="light" />

            {/* Discovery Settings Widget - Top Left */}
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

            <ScrollView
                style={styles.cardsList}
                contentContainerStyle={{ paddingBottom: 160 }}
                showsVerticalScrollIndicator={false}
            >
                {interleaved}
            </ScrollView>

            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.passButton]}
                    onPress={() => handleSwipe(false)}
                >
                    <Ionicons name="close" size={32} color="#FF6B6B" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, styles.likeButton]}
                    onPress={handlePearClick}
                >
                    <Text style={styles.pearEmoji}>🍐</Text>
                </TouchableOpacity>
            </View>

            {/* Discovery Settings Modal */}
            {showDiscoverySettings && (
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowDiscoverySettings(false)}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View style={[styles.meetingModal, { maxHeight: '85%', width: '95%' }]}>
                            <Text style={styles.modalTitle}>Discovery Settings</Text>
                            <ScrollView
                                style={{ flex: 1 }}
                                showsVerticalScrollIndicator={true}
                                contentContainerStyle={{ paddingBottom: 20 }}
                            >
                                {/* Debug: Show current filter count */}
                                <View style={styles.settingSection}>
                                    <Text style={styles.settingLabel}>Current Filters Active</Text>
                                    <Text style={styles.debugText}>
                                        Age: {ageRange[0]}-{ageRange[1]} |
                                        Distance: {distancePreference}mi |
                                        Gender: {genderPreference.length > 0 ? genderPreference.join(', ') : 'Any'} |
                                        Religion Deal-breakers: {religionDealBreakers.length} |
                                        Politics Deal-breakers: {politicsDealBreakers.length}
                                    </Text>
                                </View>

                                {/* Age Range */}
                                <View style={styles.settingSection}>
                                    <Text style={styles.settingLabel}>Age Range</Text>
                                    <View style={styles.rangeSliderRow}>
                                        <Text style={styles.rangeSliderLabel}>Min: {ageRange[0]}</Text>
                                        <Text style={styles.rangeSliderLabel}>Max: {ageRange[1]}</Text>
                                    </View>
                                    <MultiSlider
                                        values={ageRange}
                                        min={18}
                                        max={99}
                                        step={1}
                                        onValuesChange={(values) => setAgeRange([values[0], values[1]])}
                                        selectedStyle={{ backgroundColor: '#00C48C' }}
                                        unselectedStyle={{ backgroundColor: '#E0E0E0' }}
                                        containerStyle={{ height: 40 }}
                                        trackStyle={{ height: 4, borderRadius: 2 }}
                                        markerStyle={{ backgroundColor: '#00C48C', width: 20, height: 20, borderRadius: 10 }}
                                        pressedMarkerStyle={{ backgroundColor: '#009973', transform: [{ scale: 1.2 }] }}
                                    />
                                </View>

                                {/* Distance */}
                                <View style={styles.settingSection}>
                                    <Text style={styles.settingLabel}>Distance</Text>
                                    <Text style={styles.distanceValue}>{distancePreference.toFixed(1)} miles</Text>
                                    <Slider
                                        style={{ width: '100%', height: 40 }}
                                        minimumValue={1}
                                        maximumValue={100}
                                        value={distancePreference}
                                        onValueChange={(val) => setDistancePreference(Math.round(val * 10) / 10)}
                                        minimumTrackTintColor="#00C48C"
                                        maximumTrackTintColor="#E0E0E0"
                                        step={0.1}
                                    />
                                    <Text style={styles.settingDescription}>Only show me people within this distance</Text>
                                </View>

                                {/* Gender Preference */}
                                <View style={styles.settingSection}>
                                    <Text style={styles.settingLabel}>Show me</Text>
                                    <View style={styles.chipContainer}>
                                        {GENDERS.map(gender => (
                                            <TouchableOpacity
                                                key={gender}
                                                style={[
                                                    styles.chip,
                                                    genderPreference.includes(gender) && styles.chipSelected
                                                ]}
                                                onPress={() => {
                                                    if (genderPreference.includes(gender)) {
                                                        setGenderPreference(genderPreference.filter(g => g !== gender));
                                                    } else {
                                                        setGenderPreference([...genderPreference, gender]);
                                                    }
                                                }}
                                            >
                                                <Text style={[
                                                    styles.chipText,
                                                    genderPreference.includes(gender) && styles.chipTextSelected
                                                ]}>
                                                    {gender}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                {/* Religion Deal Breakers */}
                                <View style={styles.settingSection}>
                                    <Text style={styles.settingLabel}>Religion (Deal Breakers)</Text>
                                    <View style={styles.chipContainer}>
                                        {RELIGIONS.map(religion => (
                                            <TouchableOpacity
                                                key={religion}
                                                style={[
                                                    styles.chip,
                                                    religionDealBreakers.includes(religion) && styles.chipSelected
                                                ]}
                                                onPress={() => {
                                                    if (religionDealBreakers.includes(religion)) {
                                                        setReligionDealBreakers(religionDealBreakers.filter(r => r !== religion));
                                                    } else {
                                                        setReligionDealBreakers([...religionDealBreakers, religion]);
                                                    }
                                                }}
                                            >
                                                <Text style={[
                                                    styles.chipText,
                                                    religionDealBreakers.includes(religion) && styles.chipTextSelected
                                                ]}>
                                                    {religion}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                {/* Politics Deal Breakers */}
                                <View style={styles.settingSection}>
                                    <Text style={styles.settingLabel}>Politics (Deal Breakers)</Text>
                                    <View style={styles.chipContainer}>
                                        {POLITICS.map(politics => (
                                            <TouchableOpacity
                                                key={politics}
                                                style={[
                                                    styles.chip,
                                                    politicsDealBreakers.includes(politics) && styles.chipSelected
                                                ]}
                                                onPress={() => {
                                                    if (politicsDealBreakers.includes(politics)) {
                                                        setPoliticsDealBreakers(politicsDealBreakers.filter(p => p !== politics));
                                                    } else {
                                                        setPoliticsDealBreakers([...politicsDealBreakers, politics]);
                                                    }
                                                }}
                                            >
                                                <Text style={[
                                                    styles.chipText,
                                                    politicsDealBreakers.includes(politics) && styles.chipTextSelected
                                                ]}>
                                                    {politics}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                {/* Height Range */}
                                <View style={styles.settingSection}>
                                    <Text style={styles.settingLabel}>Height Range</Text>
                                    <View style={styles.rangeSliderRow}>
                                        <Text style={styles.rangeSliderLabel}>Min: {HEIGHTS[heightRange[0]]}</Text>
                                        <Text style={styles.rangeSliderLabel}>Max: {HEIGHTS[heightRange[1]]}</Text>
                                    </View>
                                    <MultiSlider
                                        values={heightRange}
                                        min={0}
                                        max={HEIGHTS.length - 1}
                                        step={1}
                                        onValuesChange={(values) => setHeightRange([values[0], values[1]])}
                                        selectedStyle={{ backgroundColor: '#00C48C' }}
                                        unselectedStyle={{ backgroundColor: '#E0E0E0' }}
                                        containerStyle={{ height: 40 }}
                                        trackStyle={{ height: 4, borderRadius: 2 }}
                                        markerStyle={{ backgroundColor: '#00C48C', width: 20, height: 20, borderRadius: 10 }}
                                        pressedMarkerStyle={{ backgroundColor: '#009973', transform: [{ scale: 1.2 }] }}
                                    />
                                    <Text style={styles.settingDescription}>Only show me people within this height range</Text>
                                </View>

                                {/* Dating Intentions */}
                                <View style={styles.settingSection}>
                                    <Text style={styles.settingLabel}>Dating Intentions</Text>
                                    <View style={styles.chipContainer}>
                                        {DATING_INTENTIONS.map(intention => (
                                            <TouchableOpacity
                                                key={intention}
                                                style={[
                                                    styles.chip,
                                                    datingIntentions.includes(intention) && styles.chipSelected
                                                ]}
                                                onPress={() => {
                                                    if (datingIntentions.includes(intention)) {
                                                        setDatingIntentions(datingIntentions.filter(i => i !== intention));
                                                    } else {
                                                        setDatingIntentions([...datingIntentions, intention]);
                                                    }
                                                }}
                                            >
                                                <Text style={[
                                                    styles.chipText,
                                                    datingIntentions.includes(intention) && styles.chipTextSelected
                                                ]}>
                                                    {intention}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                {/* Relationship Types */}
                                <View style={styles.settingSection}>
                                    <Text style={styles.settingLabel}>Relationship Types</Text>
                                    <View style={styles.chipContainer}>
                                        {RELATIONSHIP_TYPES.map(type => (
                                            <TouchableOpacity
                                                key={type}
                                                style={[
                                                    styles.chip,
                                                    relationshipTypes.includes(type) && styles.chipSelected
                                                ]}
                                                onPress={() => {
                                                    if (relationshipTypes.includes(type)) {
                                                        setRelationshipTypes(relationshipTypes.filter(t => t !== type));
                                                    } else {
                                                        setRelationshipTypes([...relationshipTypes, type]);
                                                    }
                                                }}
                                            >
                                                <Text style={[
                                                    styles.chipText,
                                                    relationshipTypes.includes(type) && styles.chipTextSelected
                                                ]}>
                                                    {type}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                {/* Drinking Frequency (Deal Breakers) */}
                                <View style={styles.settingSection}>
                                    <Text style={styles.settingLabel}>Drinking Frequency (Deal Breakers)</Text>
                                    <View style={styles.chipContainer}>
                                        {DRINKING_FREQUENCY.map(frequency => (
                                            <TouchableOpacity
                                                key={frequency}
                                                style={[
                                                    styles.chip,
                                                    drinkingDealBreakers.includes(frequency) && styles.chipSelected
                                                ]}
                                                onPress={() => {
                                                    if (drinkingDealBreakers.includes(frequency)) {
                                                        setDrinkingDealBreakers(drinkingDealBreakers.filter(f => f !== frequency));
                                                    } else {
                                                        setDrinkingDealBreakers([...drinkingDealBreakers, frequency]);
                                                    }
                                                }}
                                            >
                                                <Text style={[
                                                    styles.chipText,
                                                    drinkingDealBreakers.includes(frequency) && styles.chipTextSelected
                                                ]}>
                                                    {frequency}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                {/* Drugs Frequency (Deal Breakers) */}
                                <View style={styles.settingSection}>
                                    <Text style={styles.settingLabel}>Drugs Frequency (Deal Breakers)</Text>
                                    <View style={styles.chipContainer}>
                                        {DRUGS_FREQUENCY.map(frequency => (
                                            <TouchableOpacity
                                                key={frequency}
                                                style={[
                                                    styles.chip,
                                                    drugsDealBreakers.includes(frequency) && styles.chipSelected
                                                ]}
                                                onPress={() => {
                                                    if (drugsDealBreakers.includes(frequency)) {
                                                        setDrugsDealBreakers(drugsDealBreakers.filter(f => f !== frequency));
                                                    } else {
                                                        setDrugsDealBreakers([...drugsDealBreakers, frequency]);
                                                    }
                                                }}
                                            >
                                                <Text style={[
                                                    styles.chipText,
                                                    drugsDealBreakers.includes(frequency) && styles.chipTextSelected
                                                ]}>
                                                    {frequency}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </ScrollView>

                            <TouchableOpacity
                                style={[styles.saveButton, isApplyingFilters && styles.saveButtonDisabled]}
                                onPress={async () => {
                                    if (isApplyingFilters) return;
                                    setShowDiscoverySettings(false);
                                    await applyDiscoveryFilters();
                                }}
                                disabled={isApplyingFilters}
                            >
                                <Text style={styles.saveButtonText}>
                                    {isApplyingFilters ? 'Applying...' : 'Apply Filters'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            )}

            {/* Meeting Type Modal */}
            {showMeetingModal && (
                <View style={styles.modalOverlay}>
                    <View style={styles.meetingModal}>
                        <Text style={styles.modalTitle}>How would you like to meet?</Text>

                        {!selectedMeetingType ? (
                            <View style={styles.meetingOptions}>
                                <TouchableOpacity
                                    style={styles.meetingOption}
                                    onPress={() => handleMeetingTypeSelect('in-person')}
                                >
                                    <Text style={styles.meetingOptionText}>In Person 🤝</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.meetingOption}
                                    onPress={() => handleMeetingTypeSelect('video')}
                                >
                                    <Text style={styles.meetingOptionText}>Video Call 📹</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => setShowMeetingModal(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        ) : selectedMeetingType === 'in-person' ? (
                            <View style={styles.activityOptions}>
                                {!showVenueSearch ? (
                                    <>
                                        <Text style={styles.activityTitle}>Suggest an activity:</Text>
                                        <ScrollView style={styles.activityScroll}>
                                            {activities.map((activity, index) => (
                                                <TouchableOpacity
                                                    key={index}
                                                    style={styles.activityOption}
                                                    onPress={() => handleActivitySelect(activity)}
                                                >
                                                    <Text style={styles.activityOptionText}>{activity}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                        <TouchableOpacity
                                            style={styles.backButton}
                                            onPress={() => setSelectedMeetingType(null)}
                                        >
                                            <Text style={styles.backButtonText}>Back</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <View style={styles.venueSearchContainer}>
                                        <Text style={styles.activityTitle}>Where should we meet?</Text>
                                        <TextInput
                                            style={styles.locationInput}
                                            placeholder="Search for a place..."
                                            value={locationQuery}
                                            onChangeText={(text) => {
                                                setLocationQuery(text);
                                                searchVenues(text);
                                            }}
                                        />
                                        {venues.length > 0 && (
                                            <FlatList
                                                data={venues}
                                                keyExtractor={(item) => item.place_id}
                                                renderItem={({ item }) => (
                                                    <TouchableOpacity
                                                        style={styles.venueOption}
                                                        onPress={() => handleVenueSelect(item)}
                                                    >
                                                        <Text style={styles.venueName}>{item.name}</Text>
                                                        <Text style={styles.venueAddress}>{item.address}</Text>
                                                        {item.rating && (
                                                            <Text style={styles.venueRating}>⭐ {item.rating}</Text>
                                                        )}
                                                    </TouchableOpacity>
                                                )}
                                                style={styles.venueList}
                                            />
                                        )}
                                        <TouchableOpacity
                                            style={styles.backButton}
                                            onPress={() => setShowVenueSearch(false)}
                                        >
                                            <Text style={styles.backButtonText}>Back</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        ) : null}
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    absoluteContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    cardsList: {
        flex: 1,
    },
    fullScreenPhoto: {
        width: '100%',
        height: screenHeight * 0.8,
        padding: 20,
    },
    profileInfoCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
        marginTop: 60, // ✅ Pull up to eliminate forehead space
        marginHorizontal: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 5,
        zIndex: 10,
    },
    profileNameLarge: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    profileDetails: {
        fontSize: 16,
        color: '#555',
        marginVertical: 4,
    },
    profileBio: {
        fontSize: 15,
        color: '#333',
        marginTop: 8,
    },
    profileTagsRow: {
        flexDirection: 'row',
        marginTop: 10,
        gap: 8,
        flexWrap: 'wrap',
    },
    profileTag: {
        backgroundColor: '#E0E7FF',
        color: '#1E3A8A',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        fontSize: 13,
    },
    promptCard: {
        backgroundColor: '#fff',
        padding: 18,
        borderRadius: 20,
        margin: 10,
        marginTop: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 6,
        elevation: 3,
    },
    promptQuestion: {
        fontWeight: '600',
        fontSize: 16,
        color: '#222',
        marginBottom: 6,
    },
    promptAnswer: {
        fontSize: 15,
        color: '#444',
    },
    actionButtons: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        zIndex: 100,
    },
    actionButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,
        elevation: 4,
    },
    passButton: {
        borderWidth: 3,
        borderColor: '#FF6B6B',
    },
    likeButton: {
        borderWidth: 3,
        borderColor: '#00C48C',
    },
    pearEmoji: {
        fontSize: 30,
    },
    emptyText: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 60,
        color: '#999',
    },
    refreshButton: {
        alignSelf: 'center',
        marginTop: 20,
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#f2f2f2',
        borderRadius: 8,
    },
    refreshText: {
        color: '#333',
        fontWeight: '500',
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    meetingModal: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        margin: 20,
        maxWidth: 400,
        width: '95%',
        maxHeight: '85%',
        minHeight: 400,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 24,
        color: '#1A1A1A',
    },
    meetingOptions: {
        gap: 12,
    },
    meetingOption: {
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    meetingOptionText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1A1A1A',
    },
    cancelButton: {
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#6c757d',
    },
    activityOptions: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
        color: '#1A1A1A',
    },
    activityScroll: {
        maxHeight: 300,
    },
    activityOption: {
        backgroundColor: '#f8f9fa',
        padding: 14,
        borderRadius: 10,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    activityOptionText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#1A1A1A',
    },
    backButton: {
        backgroundColor: '#f8f9fa',
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 12,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    backButtonText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#6c757d',
    },
    venueSearchContainer: {
        flex: 1,
    },
    locationInput: {
        backgroundColor: '#f8f9fa',
        padding: 14,
        borderRadius: 10,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e9ecef',
        fontSize: 16,
    },
    venueList: {
        maxHeight: 200,
        marginBottom: 16,
    },
    venueOption: {
        backgroundColor: '#fff',
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
        borderRadius: 8,
        marginBottom: 4,
    },
    venueName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1A1A1A',
    },
    venueAddress: {
        fontSize: 14,
        color: '#555',
        marginTop: 2,
    },
    venueRating: {
        fontSize: 14,
        color: '#FFD700', // Gold color for rating
        marginTop: 4,
    },
    discoverySettingsButton: {
        position: 'absolute',
        top: 60,
        left: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,
        elevation: 4,
        zIndex: 200,
    },
    settingSection: {
        marginBottom: 24,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 12,
    },
    rangeSliderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    rangeSliderLabel: {
        fontSize: 14,
        color: '#666',
    },
    distanceValue: {
        fontSize: 16,
        fontWeight: '500',
        color: '#00C48C',
        textAlign: 'center',
        marginBottom: 8,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    chipSelected: {
        backgroundColor: '#00C48C',
        borderColor: '#00C48C',
    },
    chipText: {
        fontSize: 14,
        color: '#666',
    },
    chipTextSelected: {
        color: '#fff',
        fontWeight: '500',
    },
    saveButton: {
        backgroundColor: '#00C48C',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 16,
    },
    saveButtonDisabled: {
        backgroundColor: '#ccc',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
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
        paddingHorizontal: 4,
    },
    filterBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    debugText: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
        marginTop: 4,
    },
    settingDescription: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
        fontStyle: 'italic',
    },
});
