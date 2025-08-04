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

interface VenueSuggestionsProps {
    latitude: number;
    longitude: number;
    onVenueSelect?: (venue: Venue) => void;
    selectedVenue?: Venue | null;
}

interface VenueCardProps {
    venue: Venue;
    onPress: () => void;
    isSelected: boolean;
}

const VenueCard: React.FC<VenueCardProps> = ({ venue, onPress, isSelected }) => {


    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<Ionicons key={i} name="star" size={12} color="#FFD700" />);
        }
        if (hasHalfStar) {
            stars.push(<Ionicons key="half" name="star-half" size={12} color="#FFD700" />);
        }
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<Ionicons key={`empty-${i}`} name="star-outline" size={12} color="#ccc" />);
        }

        return <View style={styles.starsContainer}>{stars}</View>;
    };

    return (
        <TouchableOpacity
            style={[styles.venueCard, isSelected && styles.selectedVenueCard]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.venueImageContainer}>
                {venue.imageUrl ? (
                    <Image source={{ uri: venue.imageUrl }} style={styles.venueImage} />
                ) : (
                    <View style={styles.placeholderImage}>
                        <Ionicons name="restaurant-outline" size={24} color={colors.gray300} />
                    </View>
                )}
            </View>

            <View style={styles.venueInfo}>
                <Text style={styles.venueName} numberOfLines={1}>
                    {venue.name}
                </Text>

                <View style={styles.venueMeta}>
                    {renderStars(venue.rating)}
                    <Text style={styles.venueRating}>{venue.rating}</Text>
                    <Text style={styles.venueReviewCount}>({venue.reviewCount || 0})</Text>
                </View>

                <View style={styles.venueDetails}>
                    <Text style={styles.venueCategory} numberOfLines={1}>
                        {venue.categories.join(', ')}
                    </Text>
                    <Text style={styles.venueDistance}>
                        {formatDistanceInMiles(venue.distance)}
                    </Text>
                </View>

                <Text style={styles.venueAddress} numberOfLines={1}>
                    {venue.location.address}
                </Text>

                <View style={styles.venuePriceContainer}>
                    <Text style={styles.venuePrice}>{'$'.repeat(venue.priceLevel)}</Text>
                    {venue.openNow === false && (
                        <Text style={styles.closedText}>Closed</Text>
                    )}
                </View>
            </View>

            {isSelected && (
                <View style={styles.selectedIndicator}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.primaryGreen} />
                </View>
            )}
        </TouchableOpacity>
    );
};

const VenueSuggestions: React.FC<VenueSuggestionsProps> = ({
    latitude,
    longitude,
    onVenueSelect,
    selectedVenue,
}) => {
    const { venues, isLoading, error, searchVenues } = useVenues();
    const [activeCategory, setActiveCategory] = useState<'restaurants' | 'cafes' | 'bars' | 'activities'>('restaurants');

    useEffect(() => {
        if (latitude && longitude) {
            searchVenues(latitude, longitude);
        }
    }, [latitude, longitude, searchVenues]);

    const categories = [
        { key: 'restaurants' as const, label: 'Restaurants', icon: 'restaurant' },
        { key: 'cafes' as const, label: 'Cafes', icon: 'cafe' },
        { key: 'bars' as const, label: 'Bars', icon: 'wine' },
        { key: 'activities' as const, label: 'Activities', icon: 'bicycle' },
    ];

    const handleVenueSelect = (venue: Venue) => {
        onVenueSelect?.(venue);
    };

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={48} color={colors.gray300} />
                <Text style={styles.errorText}>Unable to load venue suggestions</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => searchVenues(latitude, longitude)}
                >
                    <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
            </View>
        );
    }

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
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primaryGreen} />
                    <Text style={styles.loadingText}>Finding great places nearby...</Text>
                </View>
            ) : (
                <ScrollView
                    style={styles.venuesList}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.venuesListContent}
                >
                    {venues[activeCategory].length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="search-outline" size={48} color={colors.gray300} />
                            <Text style={styles.emptyText}>No {activeCategory} found nearby</Text>
                        </View>
                    ) : (
                        venues[activeCategory].map((venue) => (
                            <VenueCard
                                key={venue.id}
                                venue={venue}
                                onPress={() => handleVenueSelect(venue)}
                                isSelected={selectedVenue?.id === venue.id}
                            />
                        ))
                    )}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
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
        flex: 1,
    },
    venuesListContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    venueCard: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.gray200,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    selectedVenueCard: {
        borderColor: colors.primaryGreen,
        backgroundColor: colors.gray50,
    },
    venueImageContainer: {
        marginRight: 12,
    },
    venueImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
    },
    placeholderImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: colors.gray100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    venueInfo: {
        flex: 1,
        justifyContent: 'space-between',
    },
    venueName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.gray900,
        marginBottom: 4,
    },
    venueMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    starsContainer: {
        flexDirection: 'row',
        marginRight: 4,
    },
    venueRating: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.gray700,
        marginRight: 4,
    },
    venueReviewCount: {
        fontSize: 12,
        color: colors.gray700,
    },
    venueDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    venueCategory: {
        fontSize: 12,
        color: colors.gray700,
        flex: 1,
    },
    venueDistance: {
        fontSize: 12,
        color: colors.gray700,
        fontWeight: '500',
    },
    venueAddress: {
        fontSize: 12,
        color: colors.gray700,
        marginBottom: 4,
    },
    venuePriceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    venuePrice: {
        fontSize: 12,
        color: colors.gray700,
        marginRight: 8,
    },
    closedText: {
        fontSize: 12,
        color: '#dc3545',
        fontWeight: '500',
    },
    selectedIndicator: {
        position: 'absolute',
        top: 8,
        right: 8,
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
        color: colors.gray700,
    },
    errorContainer: {
        flex: 1,
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
        flex: 1,
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