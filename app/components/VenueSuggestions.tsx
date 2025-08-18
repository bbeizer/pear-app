import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVenues } from '../../lib/hooks/useVenues';
import { colors } from '../../theme/colors';
import type { Venue } from '../../lib/venueClient';
import { formatDistanceInMiles } from '../../utils/locationUtils';
import VenueCard from './VenueCard';

interface VenueSuggestionsProps {
    venues: Venue[];
    onVenueSelect?: (venue: Venue) => void;
    selectedVenue?: Venue | null;
}

const VenueSuggestions: React.FC<VenueSuggestionsProps> = ({
    venues,
    onVenueSelect,
    selectedVenue,
}) => {
    console.log('🔍 Debug - VenueSuggestions received venues:', venues);
    console.log('🔍 Debug - VenueSuggestions venues length:', venues?.length);

    const [activeCategory, setActiveCategory] = useState<'all' | 'restaurants' | 'cafes' | 'bars' | 'activities'>('all');

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
        if (!venues || venues.length === 0) return [];

        // Show all venues if 'all' is selected
        if (category === 'all') {
            return venues;
        }

        // If no categories are set, show all venues for now
        if (venues.every(venue => !venue.categories || venue.categories.length === 0)) {
            console.log('🔍 Debug - No categories found, showing all venues');
            return venues;
        }

        const filtered = venues.filter(venue => {
            if (category === 'restaurants') return venue.categories?.some(cat => cat === 'restaurant');
            if (category === 'cafes') return venue.categories?.some(cat => cat === 'cafe');
            if (category === 'bars') return venue.categories?.some(cat => cat === 'bar');
            if (category === 'activities') return venue.categories?.some(cat => cat === 'activity');
            return false;
        });

        console.log(`🔍 Debug - Filtered ${category}:`, filtered.length);
        return filtered;
    };

    const filteredVenues = getVenuesForCategory(activeCategory);

    // Validate and clean venue data before rendering
    const validVenues = filteredVenues.filter(venue => {
        if (!venue || typeof venue !== 'object') {
            console.warn('🔍 Invalid venue object:', venue);
            return false;
        }

        if (!venue.id || !venue.name) {
            console.warn('🔍 Venue missing required fields:', venue);
            return false;
        }

        if (typeof venue.name !== 'string') {
            console.warn('🔍 Venue name is not a string:', venue.name);
            return false;
        }

        return true;
    });

    console.log('🔍 Debug - activeCategory:', activeCategory);
    console.log('🔍 Debug - filteredVenues:', filteredVenues.length);
    console.log('🔍 Debug - validVenues:', validVenues.length);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Venue Suggestions</Text>

            {/* Category Tabs */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryTabs}
                contentContainerStyle={styles.categoryTabsContent}
            >
                {categories.map((category) => (
                    <TouchableOpacity
                        key={category.key}
                        style={[
                            styles.categoryTab,
                            activeCategory === category.key && styles.activeCategoryTab,
                        ]}
                        onPress={() => setActiveCategory(category.key)}
                    >
                        <Ionicons
                            name={category.icon as any}
                            size={16}
                            color={activeCategory === category.key ? colors.white : colors.primaryGreen}
                        />
                        <Text
                            style={[
                                styles.categoryTabText,
                                activeCategory === category.key && styles.activeCategoryTabText,
                            ]}
                        >
                            {category.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Venues List */}
            <ScrollView
                style={styles.venuesList}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.venuesListContent}
            >
                {validVenues.length > 0 ? (
                    validVenues
                        .map((venue) => (
                            <VenueCard
                                key={venue.id}
                                venue={venue}
                                onPress={() => handleVenueSelect(venue)}
                                isSelected={selectedVenue?.id === venue.id}
                            />
                        ))
                ) : venues.length > 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="filter-outline" size={48} color={colors.gray300} />
                        <Text style={styles.emptyText}>No {activeCategory} found in this area</Text>
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="search-outline" size={48} color={colors.gray300} />
                        <Text style={styles.emptyText}>Search for venues above to see suggestions</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        minHeight: 200, // Give it a minimum height instead of flex: 1
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.gray900,
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    categoryTabs: {
        marginBottom: 16,
    },
    categoryTabsContent: {
        paddingHorizontal: 16,
    },
    categoryTab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        borderRadius: 20,
        backgroundColor: colors.gray100,
        borderWidth: 1,
        borderColor: colors.gray200,
    },
    activeCategoryTab: {
        backgroundColor: colors.primaryGreen,
        borderColor: colors.primaryGreen,
    },
    categoryTabText: {
        marginLeft: 6,
        fontSize: 14,
        fontWeight: '600',
        color: colors.primaryGreen,
    },
    activeCategoryTabText: {
        color: colors.white,
    },
    venuesList: {
        maxHeight: 400, // Set a max height instead of flex: 1
    },
    venuesListContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: colors.gray700,
    },
    errorContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    errorText: {
        marginTop: 12,
        fontSize: 16,
        color: colors.gray700,
        textAlign: 'center',
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: colors.primaryGreen,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: '600',
    },
    emptyState: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 16,
        color: colors.gray700,
        textAlign: 'center',
    },
});

export default VenueSuggestions; 