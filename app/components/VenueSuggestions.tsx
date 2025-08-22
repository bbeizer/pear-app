import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { venueClient } from '../../lib/venueClient';
import { colors } from '../../theme/colors';
import type { Venue } from '../../lib/venueClient';
import { formatDistanceInMiles } from '../../utils/locationUtils';
import VenueCard from './VenueCard';

interface VenueSuggestionsProps {
    venues?: Venue[];
    onVenueSelect?: (venue: Venue) => void;
    selectedVenue?: Venue | null;
    latitude?: number;
    longitude?: number;
}

const VenueSuggestions: React.FC<VenueSuggestionsProps> = ({
    venues,
    onVenueSelect,
    selectedVenue,
    latitude,
    longitude,
}) => {
    console.log('🔍 Debug - VenueSuggestions received venues:', venues);
    console.log('🔍 Debug - VenueSuggestions venues length:', venues?.length);
    console.log('🔍 Debug - VenueSuggestions coordinates:', { latitude, longitude });

    const [activeCategory, setActiveCategory] = useState<'all' | 'restaurants' | 'cafes' | 'bars' | 'activities'>('all');
    const [localVenues, setLocalVenues] = useState<Venue[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Use provided venues or fetch based on coordinates
    const effectiveVenues = venues || localVenues;

    // Fetch venues if coordinates are provided and no venues are passed
    useEffect(() => {
        if (!venues && latitude && longitude) {
            fetchVenues();
        }
    }, [latitude, longitude, venues]);

    const fetchVenues = async () => {
        if (!latitude || !longitude) return;

        setIsLoading(true);
        try {
            console.log('🔍 Fetching venues for coordinates:', { latitude, longitude });
            const venueData = await venueClient.getDateVenues(latitude, longitude, 2000); // 2km radius

            const allVenues = [
                ...venueData.restaurants,
                ...venueData.cafes,
                ...venueData.bars,
                ...venueData.activities
            ];

            // Deduplicate venues
            const uniqueVenues = allVenues.filter((venue, index, self) => {
                const venueKey = `${venue.name.toLowerCase().trim()}_${venue.location.latitude.toFixed(6)}_${venue.location.longitude.toFixed(6)}`;
                return index === self.findIndex(v => {
                    const vKey = `${v.name.toLowerCase().trim()}_${v.location.latitude.toFixed(6)}_${v.location.longitude.toFixed(6)}`;
                    return vKey === venueKey;
                });
            });

            setLocalVenues(uniqueVenues);
            console.log('✅ Fetched venues:', uniqueVenues.length);
        } catch (error) {
            console.error('Error fetching venues:', error);
            Alert.alert('Error', 'Failed to fetch venue suggestions');
        } finally {
            setIsLoading(false);
        }
    };

    const categories = [
        { key: 'all' as const, label: 'All', icon: 'grid' },
        { key: 'restaurants' as const, label: 'Restaurants', icon: 'restaurant' },
        { key: 'cafes' as const, label: 'Cafes', icon: 'cafe' },
        { key: 'bars' as const, label: 'Bars', icon: 'wine' },
        { key: 'activities' as const, label: 'Activities', icon: 'bicycle' },
    ];

    const handleVenueSelect = (venue: Venue) => {
        onVenueSelect?.(venue);
    };

    // Filter venues based on selected category
    const getVenuesForCategory = (category: string) => {
        if (!effectiveVenues || effectiveVenues.length === 0) return [];

        // Show all venues if 'all' is selected
        if (category === 'all') {
            return effectiveVenues;
        }

        // If no categories are set, show all venues for now
        if (effectiveVenues.every(venue => !venue.categories || venue.categories.length === 0)) {
            console.log('🔍 Debug - No categories found, showing all venues');
            return effectiveVenues;
        }

        const filtered = effectiveVenues.filter(venue => {
            if (category === 'restaurants') return venue.categories?.some(cat => cat === 'restaurant');
            if (category === 'cafes') return venue.categories?.some(cat => cat === 'cafe');
            if (category === 'bars') return venue.categories?.some(cat => cat === 'bar');
            if (category === 'activities') return venue.categories?.some(cat => cat === 'activity');
            return false;
        });

        console.log(`🔍 Debug - Filtered ${category}:`, filtered.length);
        return filtered;
    };

    console.log('🔍 Debug - activeCategory:', activeCategory);
    console.log('🔍 Debug - effectiveVenues:', effectiveVenues.length);

    return (
        <View style={styles.container}>
            {/* Category Filter */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryFilter}
                contentContainerStyle={styles.categoryFilterContent}
            >
                {categories.map((category) => (
                    <TouchableOpacity
                        key={category.key}
                        style={[
                            styles.categoryButton,
                            activeCategory === category.key && styles.categoryButtonActive
                        ]}
                        onPress={() => setActiveCategory(category.key)}
                    >
                        <Ionicons
                            name={category.icon as any}
                            size={16}
                            color={activeCategory === category.key ? '#fff' : colors.gray600}
                        />
                        <Text style={[
                            styles.categoryButtonText,
                            activeCategory === category.key && styles.categoryButtonTextActive
                        ]}>
                            {category.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Loading State */}
            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primaryGreen} />
                    <Text style={styles.loadingText}>Finding great places nearby...</Text>
                </View>
            )}

            {/* Venues List */}
            {!isLoading && (
                <ScrollView
                    style={styles.venuesList}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.venuesListContent}
                >
                    {effectiveVenues.length > 0 ? (
                        getVenuesForCategory(activeCategory)
                            .filter(venue => venue && typeof venue === 'object' && venue.id && venue.name) // Validate venue objects
                            .map((venue) => (
                                <VenueCard
                                    key={venue.id}
                                    venue={venue}
                                    onPress={() => handleVenueSelect(venue)}
                                    isSelected={selectedVenue?.id === venue.id}
                                />
                            ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="location-outline" size={48} color={colors.gray300} />
                            <Text style={styles.emptyStateTitle}>No venues found nearby</Text>
                            <Text style={styles.emptyStateSubtitle}>
                                Try expanding your search area or check back later
                            </Text>
                        </View>
                    )}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        minHeight: 400,
        flex: 1,
    },
    categoryFilter: {
        marginBottom: 8,
        height: 40,
        minHeight: 40,
        maxHeight: 40,
    },
    categoryFilterContent: {
        paddingHorizontal: 16,
    },
    categoryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        marginRight: 8,
        borderRadius: 20,
        backgroundColor: colors.gray100,
        borderWidth: 1,
        borderColor: colors.gray200,
        height: 40
    },
    categoryButtonActive: {
        backgroundColor: colors.primaryGreen,
        borderColor: colors.primaryGreen,
    },
    categoryButtonText: {
        marginLeft: 6,
        fontSize: 14,
        fontWeight: '600',
        color: colors.gray600,
    },
    categoryButtonTextActive: {
        color: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: colors.gray600,
        textAlign: 'center',
    },
    venuesList: {
        flex: 1,
    },
    venuesListContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyStateTitle: {
        marginTop: 12,
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.gray900,
        textAlign: 'center',
    },
    emptyStateSubtitle: {
        marginTop: 4,
        fontSize: 14,
        color: colors.gray700,
        textAlign: 'center',
        marginBottom: 16,
    },
});

export default VenueSuggestions; 