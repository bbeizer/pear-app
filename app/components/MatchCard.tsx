import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { colors } from '../../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import type { Match } from '../../types';

interface MatchCardProps {
    match: Match;
    onPress: () => void;
    onVenuePress?: () => void;
}

export default function MatchCard({ match, onPress, onVenuePress }: MatchCardProps) {
    const profile = match.other_user_profile;
    const photos = profile?.photos || [];
    const primaryPhoto = photos.find(p => p.is_primary) || photos[0];

    const getStatusColor = (item: Match) => {
        switch (item.status) {
            case 'unscheduled': return '#999'; // Grey
            case 'proposed': return '#007AFF'; // Blue
            case 'scheduled': return '#34C159'; // Green
            default: return '#999';
        }
    };

    const getStatusText = (item: Match) => {
        switch (item.status) {
            case 'unscheduled': return 'Unscheduled';
            case 'proposed': return 'Proposed';
            case 'scheduled': return 'Scheduled';
            default: return 'Unscheduled';
        }
    };

    return (
        <TouchableOpacity
            style={styles.matchCard}
            onPress={onPress}
        >
            {/* Profile Photo */}
            <View style={styles.photoContainer}>
                {primaryPhoto ? (
                    <Image
                        source={{ uri: primaryPhoto.url }}
                        style={styles.profilePhoto}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.placeholderPhoto}>
                        <Ionicons name="person" size={40} color="#ccc" />
                    </View>
                )}
            </View>

            {/* Match Info */}
            <View style={styles.matchInfo}>
                <View style={styles.headerRow}>
                    <Text style={styles.profileName}>{profile?.name || 'Unknown'}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(match) }]}>
                        <Text style={styles.statusText}>{getStatusText(match)}</Text>
                    </View>
                </View>

                <Text style={styles.matchDetails}>
                    {profile?.age} • {profile?.gender} • {profile?.height}
                </Text>

                {/* Meeting Type */}
                {match.meeting_type && (
                    <View style={styles.meetingType}>
                        <Ionicons
                            name={match.meeting_type === 'video' ? 'videocam' : 'location'}
                            size={16}
                            color="#34C159"
                        />
                        <Text style={styles.meetingTypeText}>
                            {match.meeting_type === 'video' ? 'Video Call' : 'In Person'}
                        </Text>
                    </View>
                )}

                {/* Suggested Activity/Venue */}
                {match.suggested_activity && (
                    <Text style={styles.suggestedActivity}>
                        💡 {match.suggested_activity}
                    </Text>
                )}
                {match.venue_name && (
                    <Text style={styles.suggestedVenue}>
                        📍 {match.venue_name}
                    </Text>
                )}

                {/* Venue Suggestions */}
                {(match.user1_proposed_venue || match.user2_proposed_venue) && (
                    <View style={styles.venueSuggestions}>
                        {match.venue_agreed && match.agreed_venue ? (
                            <View style={styles.agreedVenue}>
                                <Ionicons name="checkmark-circle" size={16} color={colors.primaryGreen} />
                                <Text style={styles.agreedVenueText}>
                                    Venue confirmed: {match.agreed_venue.name}
                                </Text>
                            </View>
                        ) : (
                            <>
                                {match.user1_proposed_venue && (
                                    <View style={styles.venueProposal}>
                                        <Ionicons name="location" size={14} color="#007AFF" />
                                        <Text style={styles.venueProposalText}>
                                            {match.user1_name || 'User 1'} suggested: {match.user1_proposed_venue.name}
                                        </Text>
                                    </View>
                                )}
                                {match.user2_proposed_venue && (
                                    <View style={styles.venueProposal}>
                                        <Ionicons name="location" size={14} color="#007AFF" />
                                        <Text style={styles.venueProposalText}>
                                            {match.user2_name || 'User 2'} suggested: {match.user2_proposed_venue.name}
                                        </Text>
                                    </View>
                                )}
                            </>
                        )}
                    </View>
                )}

                {/* Match Date */}
                <Text style={styles.matchDate}>
                    Matched {new Date(match.created_at).toLocaleDateString()}
                </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
                {onVenuePress && (
                    <TouchableOpacity
                        style={styles.venueButton}
                        onPress={(e) => {
                            e.stopPropagation();
                            onVenuePress();
                        }}
                    >
                        <Ionicons name="location" size={16} color={colors.primaryGreen} />
                    </TouchableOpacity>
                )}

                <View style={styles.actionArrow}>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    matchCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginHorizontal: 20,
        marginBottom: 16,
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    photoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        overflow: 'hidden',
        margin: 16,
    },
    profilePhoto: {
        width: '100%',
        height: '100%',
    },
    placeholderPhoto: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    matchInfo: {
        flex: 1,
        paddingVertical: 16,
        paddingRight: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    profileName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1A1A1A',
        marginRight: 12,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },
    matchDetails: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    meetingType: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f9ff',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginBottom: 4,
    },
    meetingTypeText: {
        fontSize: 12,
        color: colors.primaryGreen,
        fontWeight: '600',
        marginLeft: 4,
    },
    suggestedActivity: {
        fontSize: 13,
        color: '#666',
        marginBottom: 2,
    },
    suggestedVenue: {
        fontSize: 13,
        color: '#666',
        marginBottom: 4,
    },
    matchDate: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    actionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 16,
    },
    venueButton: {
        padding: 8,
        marginRight: 8,
        borderRadius: 20,
        backgroundColor: '#f0f9ff',
    },
    actionArrow: {
        justifyContent: 'center',
    },
    venueSuggestions: {
        marginTop: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: '#f0f9ff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    agreedVenue: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    agreedVenueText: {
        fontSize: 12,
        color: colors.primaryGreen,
        fontWeight: '600',
        marginLeft: 4,
    },
    venueProposal: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    venueProposalText: {
        fontSize: 12,
        color: '#007AFF',
        fontWeight: '600',
        marginLeft: 4,
    },
}); 