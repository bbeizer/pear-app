import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import MapWithRadiusModal from './MapWithRadiusModal';
import type { Venue } from '../../lib/venueClient';

interface VenueSuggestionModalProps {
    visible: boolean;
    onClose: () => void;
    suggestedVenue?: Venue | null;
    midpoint: { latitude: number; longitude: number };
    onVenueAccept: (venue: Venue) => void;
    onVenueSuggest: (venue: Venue) => void;
    matchName: string;
}

export default function VenueSuggestionModal({
    visible,
    onClose,
    suggestedVenue,
    midpoint,
    onVenueAccept,
    onVenueSuggest,
    matchName,
}: VenueSuggestionModalProps) {
    const [showMapModal, setShowMapModal] = useState(false);
    const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

    const handleAcceptVenue = () => {
        if (suggestedVenue) {
            onVenueAccept(suggestedVenue);
            onClose();
        }
    };

    const handleSuggestDifferentVenue = () => {
        console.log('🔴 handleSuggestDifferentVenue called');
        console.log('🔴 Setting showMapModal to true');
        setShowMapModal(true);
        console.log('🔴 showMapModal should now be true');
    };

    const handleVenueSelect = (venue: Venue) => {
        console.log('🔴 handleVenueSelect called with venue:', venue.name);
        setSelectedVenue(venue);
        setShowMapModal(false);
    };

    const handleConfirmNewVenue = () => {
        console.log('🔴 handleConfirmNewVenue called');
        if (selectedVenue) {
            console.log('🔴 Calling onVenueSuggest with venue:', selectedVenue.name);
            onVenueSuggest(selectedVenue);
            onClose();
        }
    };

    // Debug logs
    console.log('🔴 VenueSuggestionModal render:', {
        visible,
        showMapModal,
        hasSelectedVenue: !!selectedVenue
    });

    const formatDistance = (meters: number) => {
        const miles = meters * 0.000621371;
        return `${miles.toFixed(1)} mi`;
    };

    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<Ionicons key={i} name="star" size={16} color="#FFD700" />);
        }
        if (hasHalfStar) {
            stars.push(<Ionicons key="half" name="star-half" size={16} color="#FFD700" />);
        }
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<Ionicons key={`empty-${i}`} name="star-outline" size={16} color="#ccc" />);
        }

        return <View style={styles.starsContainer}>{stars}</View>;
    };

    return (
        <>
            <Modal visible={visible} animationType="slide" transparent={true}>
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Meetup with {matchName}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.closeButton}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        {suggestedVenue ? (
                            <>
                                <Text style={styles.sectionTitle}>Suggested Venue</Text>

                                <View style={styles.venueCard}>
                                    <View style={styles.venueHeader}>
                                        <Text style={styles.venueName}>{suggestedVenue.name}</Text>
                                        <View style={styles.venueRating}>
                                            {renderStars(suggestedVenue.rating)}
                                            <Text style={styles.ratingText}>{suggestedVenue.rating}</Text>
                                        </View>
                                    </View>

                                    <Text style={styles.venueCategory}>
                                        {suggestedVenue.categories.join(', ')}
                                    </Text>

                                    <Text style={styles.venueAddress}>
                                        {suggestedVenue.location.address}
                                    </Text>

                                    <View style={styles.venueMeta}>
                                        <Text style={styles.venueDistance}>
                                            {formatDistance(suggestedVenue.distance)}
                                        </Text>
                                        <Text style={styles.venuePrice}>
                                            {'$'.repeat(suggestedVenue.priceLevel)}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity
                                        style={styles.acceptButton}
                                        onPress={handleAcceptVenue}
                                    >
                                        <Ionicons name="checkmark" size={20} color="#fff" />
                                        <Text style={styles.acceptButtonText}>Accept This Venue</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.suggestButton}
                                        onPress={handleSuggestDifferentVenue}
                                    >
                                        <Ionicons name="location" size={20} color={colors.primaryGreen} />
                                        <Text style={styles.suggestButtonText}>Suggest Different Place</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        ) : (
                            <>
                                <Text style={styles.sectionTitle}>No venue suggested yet</Text>
                                <Text style={styles.noVenueText}>
                                    Be the first to suggest a great place to meet!
                                </Text>

                                <TouchableOpacity
                                    style={styles.suggestButton}
                                    onPress={handleSuggestDifferentVenue}
                                >
                                    <Ionicons name="location" size={20} color={colors.primaryGreen} />
                                    <Text style={styles.suggestButtonText}>Suggest a Place</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </SafeAreaView>
            </Modal>

            <MapWithRadiusModal
                visible={showMapModal}
                onClose={() => setShowMapModal(false)}
                midpoint={midpoint}
                onVenueSelect={handleVenueSelect}
            />

            {selectedVenue && (
                <Modal visible={true} animationType="slide" transparent={true}>
                    <SafeAreaView style={styles.modalContainer}>
                        <View style={styles.header}>
                            <Text style={styles.title}>Confirm New Venue</Text>
                            <TouchableOpacity onPress={() => setSelectedVenue(null)}>
                                <Text style={styles.closeButton}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.content}>
                            <Text style={styles.sectionTitle}>Your Suggestion</Text>

                            <View style={styles.venueCard}>
                                <View style={styles.venueHeader}>
                                    <Text style={styles.venueName}>{selectedVenue.name}</Text>
                                    <View style={styles.venueRating}>
                                        {renderStars(selectedVenue.rating)}
                                        <Text style={styles.ratingText}>{selectedVenue.rating}</Text>
                                    </View>
                                </View>

                                <Text style={styles.venueCategory}>
                                    {selectedVenue.categories.join(', ')}
                                </Text>

                                <Text style={styles.venueAddress}>
                                    {selectedVenue.location.address}
                                </Text>

                                <View style={styles.venueMeta}>
                                    <Text style={styles.venueDistance}>
                                        {formatDistance(selectedVenue.distance)}
                                    </Text>
                                    <Text style={styles.venuePrice}>
                                        {'$'.repeat(selectedVenue.priceLevel)}
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.confirmButton}
                                onPress={handleConfirmNewVenue}
                            >
                                <Text style={styles.confirmButtonText}>Suggest This Venue</Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </Modal>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fafafa',
        borderBottomWidth: 1,
        borderColor: '#ddd',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
    },
    closeButton: {
        fontSize: 22,
        color: '#888',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 16,
        color: '#333',
    },
    noVenueText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 24,
        textAlign: 'center',
    },
    venueCard: {
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    venueHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    venueName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        flex: 1,
        marginRight: 8,
    },
    venueRating: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    starsContainer: {
        flexDirection: 'row',
        marginRight: 4,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    venueCategory: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    venueAddress: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    venueMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    venueDistance: {
        fontSize: 14,
        color: '#666',
    },
    venuePrice: {
        fontSize: 14,
        color: '#666',
    },
    buttonContainer: {
        gap: 12,
    },
    acceptButton: {
        backgroundColor: colors.primaryGreen,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 8,
        gap: 8,
    },
    acceptButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    suggestButton: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: colors.primaryGreen,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 8,
        gap: 8,
    },
    suggestButtonText: {
        color: colors.primaryGreen,
        fontSize: 16,
        fontWeight: '600',
    },
    confirmButton: {
        backgroundColor: colors.primaryGreen,
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
}); 