
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabaseClient';
import { Ionicons } from '@expo/vector-icons';
import type { Profile, Match } from '../../types';
import { useHaptics } from '../../lib/hooks/useHaptics';
import { fetchUserMatches } from '../../lib/supabaseUtils';
import MatchModal from '../components/MatchModal';

export default function MatchesScreen() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const router = useRouter();
    const { lightImpact } = useHaptics();

    useEffect(() => {
        fetchMatches();
    }, []);

    const fetchMatches = async () => {
        try {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData?.user) return;

            const userId = userData.user.id;
            const userMatches = await fetchUserMatches(userId);

            // Get profiles for the other users in each match
            const matchesWithProfiles = await Promise.all(
                userMatches.map(async (match) => {
                    const otherUserId = match.user1_id === userId ? match.user2_id : match.user1_id;

                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', otherUserId)
                        .single();

                    return {
                        ...match,
                        other_user_profile: profile
                    };
                })
            );

            setMatches(matchesWithProfiles);
        } catch (error) {
            console.error('Error fetching matches:', error);
        } finally {
            setLoading(false);
        }
    };

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

    const handleMatchPress = (match: Match) => {
        lightImpact();
        setSelectedMatch(match);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedMatch(null);
    };

    const handleMatchUpdate = () => {
        fetchMatches();
    };

    const renderMatch = ({ item }: { item: Match }) => {
        const profile = item.other_user_profile;
        const photos = profile?.photos || [];
        const primaryPhoto = photos.find(p => p.is_primary) || photos[0];

        return (
            <TouchableOpacity
                style={styles.matchCard}
                onPress={() => handleMatchPress(item)}
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
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item) }]}>
                            <Text style={styles.statusText}>{getStatusText(item)}</Text>
                        </View>
                    </View>

                    <Text style={styles.matchDetails}>
                        {profile?.age} • {profile?.gender} • {profile?.height}
                    </Text>

                    {/* Meeting Type */}
                    {item.meeting_type && (
                        <View style={styles.meetingType}>
                            <Ionicons
                                name={item.meeting_type === 'video' ? 'videocam' : 'location'}
                                size={16}
                                color="#00C48C"
                            />
                            <Text style={styles.meetingTypeText}>
                                {item.meeting_type === 'video' ? 'Video Call' : 'In Person'}
                            </Text>
                        </View>
                    )}

                    {/* Suggested Activity/Venue */}
                    {item.suggested_activity && (
                        <Text style={styles.suggestedActivity}>
                            💡 {item.suggested_activity}
                        </Text>
                    )}
                    {item.suggested_venue && (
                        <Text style={styles.suggestedVenue}>
                            📍 {item.suggested_venue}
                        </Text>
                    )}

                    {/* Match Date */}
                    <Text style={styles.matchDate}>
                        Matched {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                </View>

                {/* Action Arrow */}
                <View style={styles.actionArrow}>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Loading matches...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Matches</Text>
            <Text style={styles.subtitle}>
                {matches.length === 0
                    ? "No matches yet. Keep swiping!"
                    : `${matches.length} match${matches.length !== 1 ? 'es' : ''}`}
            </Text>

            {matches.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="sparkles-outline" size={64} color="#ccc" />
                    <Text style={styles.emptyStateText}>
                        When you and someone else like each other, you'll have a match here!
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={matches}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMatch}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContainer}
                />
            )}

            {/* Match Modal */}
            <MatchModal
                visible={modalVisible}
                match={selectedMatch}
                onClose={handleCloseModal}
                onMatchUpdate={handleMatchUpdate}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 60,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        marginTop: 16,
        lineHeight: 24,
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    matchCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 5,
        overflow: 'hidden',
        flexDirection: 'row',
    },
    photoContainer: {
        width: 80,
        height: 80,
        backgroundColor: '#f8f9fa',
    },
    profilePhoto: {
        width: '100%',
        height: '100%',
    },
    placeholderPhoto: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    matchInfo: {
        flex: 1,
        padding: 16,
        justifyContent: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    profileName: {
        fontSize: 18,
        fontWeight: '700',
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
        marginBottom: 6,
    },
    meetingTypeText: {
        fontSize: 12,
        color: '#00C48C',
        fontWeight: '600',
        marginLeft: 4,
    },
    suggestedActivity: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
        marginBottom: 2,
    },
    suggestedVenue: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
        marginBottom: 6,
    },
    matchDate: {
        fontSize: 12,
        color: '#999',
    },
    actionArrow: {
        justifyContent: 'center',
        paddingRight: 16,
    },
}); 