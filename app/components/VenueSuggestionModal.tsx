import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { useVenuePicker } from '../../lib/stores/venuePicker';
import { useVenueSuggestion } from '../../lib/hooks/useVenueSuggestion';
import type { Venue } from '../../lib/venueClient';

interface VenueSuggestionModalProps {
    visible: boolean;
    onClose: () => void;
    midpoint: { latitude: number; longitude: number };
    onVenueAccept: (venue: Venue) => void;
    onVenueSuggest: (venue: Venue) => void;
    matchName: string;
    matchId: string;
    currentUserId: string; // Add current user ID
    match: any; // Add full match object to access user1_id/user2_id
}

export default function VenueSuggestionModal({
    visible,
    onClose,
    midpoint,
    onVenueAccept,
    onVenueSuggest,
    matchName,
    matchId,
    currentUserId,
    match,
}: VenueSuggestionModalProps) {
    const router = useRouter();
    const { beginVenuePick } = useVenuePicker();
    const [debugLogs, setDebugLogs] = useState<string[]>([]);

    // Use the hook for all venue logic
    const venueLogic = useVenueSuggestion(matchId, currentUserId, match);

    const addDebugLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setDebugLogs(prev => [...prev.slice(-4), `${timestamp}: ${message}`]);
    };

    const handleSuggestDifferentVenue = () => {
        addDebugLog('Suggest different venue called');
        addDebugLog(`Starting venue pick for match: ${matchId}`);
        beginVenuePick({ matchId, midpoint });
        onClose();
        router.push('/map-picker');
    };

    const handleAcceptVenue = async () => {
        if (venueLogic.otherUserVenue) {
            const success = await venueLogic.acceptVenueSuggestion(venueLogic.otherUserVenue);
            if (success) {
                onClose();
                // Parent should handle refresh
            }
        }
    };

    // Debug logs
    console.log('🔴 VenueSuggestionModal render:', {
        visible,
        hasSelectedVenue: !!match?.[venueLogic.venueField],
        currentUserId,
        isUser1: venueLogic.isUser1,
        venueField: venueLogic.venueField,
        otherUserVenue: !!venueLogic.otherUserVenue,
        venueState: venueLogic.venueState,
        venueData: match?.[venueLogic.venueField] ? {
            name: match[venueLogic.venueField].name,
            address: match[venueLogic.venueField].location?.address,
            rating: match[venueLogic.venueField].rating,
            categories: match[venueLogic.venueField].categories
        } : null
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
                        {/* Show agreed venue if both users agreed */}
                        {venueLogic.venueState === 'agreed' && match?.agreed_venue ? (
                            <>
                                <Text style={styles.sectionTitle}>Agreed Venue 🎉</Text>
                                <View style={styles.venueCard}>
                                    <View style={styles.venueHeader}>
                                        <Text style={styles.venueName}>{match.agreed_venue.name}</Text>
                                        <View style={styles.venueRating}>
                                            {renderStars(match.agreed_venue.rating)}
                                            <Text style={styles.ratingText}>{match.agreed_venue.rating}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.venueCategory}>
                                        {match.agreed_venue.categories?.join(', ')}
                                    </Text>
                                    <Text style={styles.venueAddress}>
                                        {match.agreed_venue.location?.address}
                                    </Text>
                                    <View style={styles.venueMeta}>
                                        <Text style={styles.venueDistance}>
                                            {formatDistance(match.agreed_venue.distance)}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.agreedText}>You both agreed on this venue!</Text>
                            </>
                        ) : (
                            <>
                                {/* Show your current suggestion */}
                                {match?.[venueLogic.venueField] && (
                                    <>
                                        <Text style={styles.sectionTitle}>Your Suggestion</Text>
                                        <View style={styles.venueCard}>
                                            <View style={styles.venueHeader}>
                                                <Text style={styles.venueName}>{match[venueLogic.venueField].name}</Text>
                                                <View style={styles.venueRating}>
                                                    {renderStars(match[venueLogic.venueField].rating)}
                                                    <Text style={styles.ratingText}>{match[venueLogic.venueField].rating}</Text>
                                                </View>
                                            </View>
                                            <Text style={styles.venueCategory}>
                                                {match[venueLogic.venueField].categories?.join(', ')}
                                            </Text>
                                            <Text style={styles.venueAddress}>
                                                {match[venueLogic.venueField].location?.address}
                                            </Text>
                                            <View style={styles.venueMeta}>
                                                <Text style={styles.venueDistance}>
                                                    {formatDistance(match[venueLogic.venueField].distance)}
                                                </Text>
                                            </View>
                                        </View>
                                    </>
                                )}

                                {/* Show their suggestion if they have one */}
                                {venueLogic.otherUserVenue && (
                                    <>
                                        <Text style={styles.sectionTitle}>Their Suggestion</Text>
                                        <View style={styles.venueCard}>
                                            <View style={styles.venueHeader}>
                                                <Text style={styles.venueName}>{venueLogic.otherUserVenue.name}</Text>
                                                <View style={styles.venueRating}>
                                                    {renderStars(venueLogic.otherUserVenue.rating)}
                                                    <Text style={styles.ratingText}>{venueLogic.otherUserVenue.rating}</Text>
                                                </View>
                                            </View>
                                            <Text style={styles.venueCategory}>
                                                {venueLogic.otherUserVenue.categories?.join(', ')}
                                            </Text>
                                            <Text style={styles.venueAddress}>
                                                {venueLogic.otherUserVenue.location?.address}
                                            </Text>
                                            <View style={styles.venueMeta}>
                                                <Text style={styles.venueDistance}>
                                                    {formatDistance(venueLogic.otherUserVenue.distance)}
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={styles.buttonContainer}>
                                            <TouchableOpacity
                                                style={[styles.acceptButton, venueLogic.isLoading && { opacity: 0.6 }]}
                                                onPress={handleAcceptVenue}
                                                disabled={venueLogic.isLoading}
                                            >
                                                {venueLogic.isLoading ? (
                                                    <ActivityIndicator color="#fff" size="small" />
                                                ) : (
                                                    <>
                                                        <Ionicons name="checkmark" size={20} color="#fff" />
                                                        <Text style={styles.acceptButtonText}>Accept Their Venue</Text>
                                                    </>
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                    </>
                                )}

                                {/* Show suggest button if no venue suggested yet */}
                                {!match?.[venueLogic.venueField] && !venueLogic.otherUserVenue && (
                                    <>
                                        <Text style={styles.sectionTitle}>No venue suggested yet</Text>
                                        <Text style={styles.noVenueText}>
                                            Be the first to suggest a great place to meet!
                                        </Text>
                                    </>
                                )}

                                {/* Always show suggest/edit button */}
                                <TouchableOpacity
                                    style={[styles.suggestButton, venueLogic.isLoading && { opacity: 0.6 }]}
                                    onPress={handleSuggestDifferentVenue}
                                    disabled={venueLogic.isLoading}
                                >
                                    <Ionicons name="location" size={20} color={colors.primaryGreen} />
                                    <Text style={styles.suggestButtonText}>
                                        {match?.[venueLogic.venueField] ? 'Edit Your Suggestion' : 'Suggest a Place'}
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </SafeAreaView>
            </Modal>

            {/* Debug Logs Display */}
            <View style={styles.debugContainer}>
                <Text style={styles.debugTitle}>🐛 Debug Logs:</Text>
                <Text style={styles.debugText}>Venue State: {venueLogic.venueState}</Text>
                <Text style={styles.debugText}>Your Venue: {match?.[venueLogic.venueField] ? match[venueLogic.venueField].name : 'null'}</Text>
                <Text style={styles.debugText}>Their Venue: {venueLogic.otherUserVenue ? venueLogic.otherUserVenue.name : 'null'}</Text>
                {debugLogs.map((log, index) => (
                    <Text key={index} style={styles.debugLog}>{log}</Text>
                ))}
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: colors.red,
        paddingBottom: 100,
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.red,
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
    debugContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
    },
    debugTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
    },
    debugText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 3,
    },
    debugLog: {
        fontSize: 12,
        color: '#555',
        marginBottom: 1,
    },
    agreedText: {
        fontSize: 16,
        color: '#333',
        marginTop: 16,
        textAlign: 'center',
    },
}); 