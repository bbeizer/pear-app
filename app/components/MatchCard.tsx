import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Match } from '../../types';

interface MatchCardProps {
    match: Match;
    onPress: () => void;
}

export default function MatchCard({ match, onPress }: MatchCardProps) {
    const profile = match.other_user_profile;
    const photos = profile?.photos || [];
    const primaryPhoto = photos.find(p => p.is_primary) || photos[0];

    const getStatusColor = (item: Match) => {
        switch (item.status) {
            case 'unscheduled': return '#999'; // Grey
            case 'proposed': return '#007AFF'; // Blue
            case 'scheduled': return '#00C48C'; // Green
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
                            color="#00C48C"
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
                {match.suggested_venue && (
                    <Text style={styles.suggestedVenue}>
                        📍 {match.suggested_venue}
                    </Text>
                )}

                {/* Match Date */}
                <Text style={styles.matchDate}>
                    Matched {new Date(match.created_at).toLocaleDateString()}
                </Text>
            </View>

            {/* Action Arrow */}
            <View style={styles.actionArrow}>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
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
        color: '#00C48C',
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
    actionArrow: {
        justifyContent: 'center',
        paddingRight: 16,
    },
}); 