import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import type { Venue } from '../../lib/venueClient';
import { formatDistanceInMiles } from '../../utils/locationUtils';

interface VenueCardProps {
    venue: Venue;
    onPress: () => void;
    isSelected: boolean;
}

const VenueCard: React.FC<VenueCardProps> = ({ venue, onPress, isSelected }) => {
    const [imageError, setImageError] = useState(false);

    const handleImageError = () => {
        setImageError(true);
    };

    // Ensure all text fields are strings to prevent rendering issues
    const safeName = typeof venue.name === 'string' ? venue.name : 'Unknown Venue';
    const safeAddress = typeof venue.location?.address === 'string' ? venue.location.address : 'Address not available';
    const safeCategory = venue.categories && venue.categories.length > 0
        ? venue.categories.join(', ')
        : '';

    // Additional validation to prevent undefined/null values
    const safeRating = typeof venue.rating === 'number' && !isNaN(venue.rating) ? venue.rating : 0;
    const safeReviewCount = typeof venue.reviewCount === 'number' && !isNaN(venue.reviewCount) && venue.reviewCount > 0 ? venue.reviewCount : 0;
    const safePriceLevel = typeof venue.priceLevel === 'number' && venue.priceLevel >= 1 && venue.priceLevel <= 4 ? venue.priceLevel : 1;
    const safeDistance = typeof venue.distance === 'number' && !isNaN(venue.distance) ? venue.distance : 0;

    console.log('🔍 VenueCard rendering:', {
        id: venue.id,
        name: safeName,
        address: safeAddress,
        categories: venue.categories,
        rating: safeRating,
        reviewCount: safeReviewCount,
        priceLevel: safePriceLevel,
        distance: safeDistance
    });

    return (
        <TouchableOpacity
            style={[styles.card, isSelected && styles.selectedCard]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.imageContainer}>
                {venue.imageUrl && !imageError ? (
                    <Image
                        source={{ uri: venue.imageUrl }}
                        style={styles.image}
                        onError={handleImageError}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.placeholderImage}>
                        <Ionicons name="restaurant" size={24} color={colors.gray300} />
                    </View>
                )}
            </View>

            <View style={styles.content}>
                <Text style={styles.name} numberOfLines={2}>
                    {safeName}
                </Text>

                <View style={styles.ratingContainer}>
                    <View style={styles.stars}>
                        {[1, 2, 3, 4, 5].map((star) => {
                            if (star <= safeRating) {
                                return <Ionicons key={star} name="star" size={12} color="#FFD700" />;
                            } else if (star === Math.ceil(safeRating) && safeRating % 1 !== 0) {
                                return <Ionicons key={star} name="star-half" size={12} color="#FFD700" />;
                            } else {
                                return <Ionicons key={star} name="star-outline" size={12} color="#FFD700" />;
                            }
                        })}
                    </View>
                    <Text style={styles.rating}>{safeRating.toFixed(1)}</Text>
                </View>

                {safeCategory && (
                    <Text style={styles.category} numberOfLines={1}>
                        {safeCategory}
                    </Text>
                )}

                {safeAddress !== 'Address not available' && (
                    <Text style={styles.address} numberOfLines={1}>
                        {safeAddress}
                    </Text>
                )}

                <View style={styles.bottomRow}>
                    <Text style={styles.distance}>
                        {formatDistanceInMiles(venue.distance)}
                    </Text>
                </View>
            </View>

            {isSelected && (
                <View style={styles.selectedIndicator}>
                    <Ionicons name="checkmark-circle" size={24} color={colors.primaryGreen} />
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
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
    selectedCard: {
        borderColor: colors.primaryGreen,
        backgroundColor: colors.gray50,
    },
    imageContainer: {
        marginRight: 12,
    },
    image: {
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
    content: {
        flex: 1,
        justifyContent: 'space-between',
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.gray900,
        marginBottom: 4,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    stars: {
        flexDirection: 'row',
        marginRight: 4,
    },
    rating: {
        fontSize: 12,
        color: colors.gray700,
        marginLeft: 4,
    },
    category: {
        fontSize: 12,
        color: colors.gray700,
        marginBottom: 4,
    },
    address: {
        fontSize: 12,
        color: colors.gray700,
        marginBottom: 4,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    distance: {
        fontSize: 12,
        color: colors.gray700,
        fontWeight: '500',
    },
    selectedIndicator: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
});

export default VenueCard;
