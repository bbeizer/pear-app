import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useHaptics } from '../../lib/hooks/useHaptics';
import { usePool } from '../../lib/hooks/usePool';
import { useVenueHandler } from '../../lib/hooks/useVenueHandler';
import { useRouter } from 'expo-router';

// Import components
import ProfileInfoCard from '../components/ProfileInfoCard';
import PoolImageCard from '../components/PoolImageCard';
import ActionButtons from '../components/ActionButtons';
import DiscoveryFilters from '../components/DiscoveryFilters';
import VenueSuggestionModal from '../components/VenueSuggestionModal';

export default function Pool() {
    const { lightImpact, successNotification } = useHaptics();
    const router = useRouter();

    // Custom hooks
    const pool = usePool();
    const venueHandler = useVenueHandler();

    // Local UI state
    const [showDiscoverySettings, setShowDiscoverySettings] = useState(false);

    const handleSwipe = async (liked: boolean) => {
        lightImpact();

        await pool.handleSwipe(liked, (matchedProfile) => {
            // This shouldn't happen in Pool page - matches only happen in Likes page
            console.log('Unexpected match in Pool page:', matchedProfile);
        });

        // If it's a right swipe (like), show venue suggestion modal immediately
        if (liked && pool.profiles[pool.currentIndex]) {
            const currentProfile = pool.profiles[pool.currentIndex];
            venueHandler.handleMatch(currentProfile);
        }
    };

    const handleVenueAccept = async (venue: any) => {
        await venueHandler.handleVenueAccept(venue, pool.handleVenueAction);
    };

    const handleVenueSuggest = async (venue: any) => {
        await venueHandler.handleVenueSuggest(venue, pool.handleVenueAction);
    };

    const currentProfile = pool.profiles[pool.currentIndex];

    if (pool.isLoading) {
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
                <Ionicons name="filter" size={20} color={colors.primaryGreen} />
                {pool.profiles.length > 0 && (
                    <View style={styles.filterBadge}>
                        <Text style={styles.filterBadgeText}>{pool.profiles.length}</Text>
                    </View>
                )}
            </TouchableOpacity>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 160 }} showsVerticalScrollIndicator={false}>
                <ProfileInfoCard profile={currentProfile} />
                {currentProfile.photos && currentProfile.photos.length > 0 && (
                    currentProfile.photos.map((photo, idx) => (
                        <PoolImageCard key={photo.url + idx} photo={photo} />
                    ))
                )}
            </ScrollView>

            {/* Action Buttons */}
            <ActionButtons
                onPass={() => handleSwipe(false)}
                onLike={() => handleSwipe(true)}
                disabled={pool.isApplyingFilters}
            />

            {/* Discovery Filters Modal */}
            {showDiscoverySettings && (
                <DiscoveryFilters
                    ageRange={pool.ageRange}
                    distancePreference={pool.distancePreference}
                    genderPreference={pool.genderPreference}
                    religionDealBreakers={pool.religionDealBreakers}
                    politicsDealBreakers={pool.politicsDealBreakers}
                    heightRange={pool.heightRange}
                    datingIntentions={pool.datingIntentions}
                    relationshipTypes={pool.relationshipTypes}
                    drinkingDealBreakers={pool.drinkingDealBreakers}
                    drugsDealBreakers={pool.drugsDealBreakers}
                    onAgeRangeChange={pool.setAgeRange}
                    onDistanceChange={pool.setDistancePreference}
                    onGenderPreferenceChange={pool.setGenderPreference}
                    onReligionDealBreakersChange={pool.setReligionDealBreakers}
                    onPoliticsDealBreakersChange={pool.setPoliticsDealBreakers}
                    onHeightRangeChange={pool.setHeightRange}
                    onDatingIntentionsChange={pool.setDatingIntentions}
                    onRelationshipTypesChange={pool.setRelationshipTypes}
                    onDrinkingDealBreakersChange={pool.setDrinkingDealBreakers}
                    onDrugsDealBreakersChange={pool.setDrugsDealBreakers}
                    onApplyFilters={pool.applyDiscoveryFilters}
                    onClose={() => setShowDiscoverySettings(false)}
                    profileCount={pool.profiles.length}
                />
            )}

            {/* Venue Suggestion Modal */}
            {venueHandler.matchedProfile && pool.userProfile && (
                <VenueSuggestionModal
                    visible={venueHandler.showVenueModal}
                    onClose={venueHandler.closeVenueModal}
                    suggestedVenue={null} // No venue suggested yet
                    midpoint={pool.calculateMidpoint(venueHandler.matchedProfile) || { latitude: 40.7128, longitude: -74.0060 }}
                    onVenueAccept={handleVenueAccept}
                    onVenueSuggest={handleVenueSuggest}
                    matchName={venueHandler.matchedProfile.name}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    absoluteContainer: {
        flex: 1,
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
        backgroundColor: colors.primaryGreen,
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
        backgroundColor: colors.primaryGreen,
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
