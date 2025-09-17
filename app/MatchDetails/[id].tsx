import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useMatches } from '../../lib/hooks/useMatches';
import { supabase } from '../../lib/supabaseClient';
import VenuePickerModal from '../components/VenuePickerModal';

export default function MatchDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const matches = useMatches();
    const [match, setMatch] = useState<any>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [isUser1, setIsUser1] = useState<boolean>(false);
    const [showVenuePicker, setShowVenuePicker] = useState(false);
    const [venuePickerMidpoint, setVenuePickerMidpoint] = useState<{ latitude: number; longitude: number } | null>(null);

    useEffect(() => {
        if (id) {
            fetchMatchData();
        }
    }, [id]);

    const fetchMatchData = async () => {
        try {
            // Get current user
            const { data: userData } = await supabase.auth.getUser();
            if (!userData?.user) return;

            const userId = userData.user.id;
            setCurrentUserId(userId);

            // Find the match in the matches list
            const foundMatch = matches.matches.find(m => m.id === id);
            if (foundMatch) {
                setMatch(foundMatch);
                setIsUser1(foundMatch.user1_id === userId);
            } else {
                // If not in list, fetch from database
                const { data: matchData, error } = await supabase
                    .from('matches')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) {
                    console.error('Error fetching match:', error);
                    return;
                }

                // Fetch the other user's profile
                const otherUserId = matchData.user1_id === userId ? matchData.user2_id : matchData.user1_id;
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', otherUserId)
                    .single();

                // Combine match data with profile
                const matchWithProfile = {
                    ...matchData,
                    other_user_profile: profile
                };

                setMatch(matchWithProfile);
                setIsUser1(matchData.user1_id === userId);
            }
        } catch (error) {
            console.error('Error fetching match data:', error);
        }
    };

    const handleAcceptVenue = async () => {
        if (!match || !currentUserId) return;

        try {
            const otherUserVenue = isUser1 ? match.user2_proposed_venue : match.user1_proposed_venue;
            const updateField = isUser1 ? 'user1_proposed_venue' : 'user2_proposed_venue';

            const { error } = await supabase
                .from('matches')
                .update({
                    venue_agreed: true,
                    agreed_venue: otherUserVenue,
                    [updateField]: otherUserVenue
                })
                .eq('id', match.id);

            if (error) {
                console.error('Error accepting venue:', error);
                return;
            }

            // Refresh match data
            fetchMatchData();
        } catch (error) {
            console.error('Error accepting venue:', error);
        }
    };

    const handleDeclineVenue = async () => {
        if (!match) return;

        try {
            const { error } = await supabase
                .from('matches')
                .update({
                    venue_agreed: false,
                    agreed_venue: null,
                    user1_proposed_venue: null,
                    user2_proposed_venue: null
                })
                .eq('id', match.id);

            if (error) {
                console.error('Error declining venue:', error);
                return;
            }

            // Refresh match data
            fetchMatchData();
        } catch (error) {
            console.error('Error declining venue:', error);
        }
    };

    const handleSuggestNewVenue = () => {
        if (!match) return;

        // Calculate midpoint for this match
        const midpoint = matches.calculateMidpoint(match);
        if (midpoint) {
            setVenuePickerMidpoint(midpoint);
            setShowVenuePicker(true);
        }
    };

    if (!match) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.push('/main/Matches')}>
                        <Ionicons name="arrow-back" size={24} color={colors.primaryGreen} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Match Details</Text>
                    <View style={{ width: 24 }} />
                </View>
                <Text style={styles.loadingText}>Loading match...</Text>
            </SafeAreaView>
        );
    }

    // Debug logging
    console.log('Match data:', JSON.stringify(match, null, 2));
    console.log('Other user profile:', match.other_user_profile);

    const profile = match.other_user_profile;
    const photos = profile?.photos || [];
    const primaryPhoto = photos.find((p: any) => p.is_primary) || photos[0];

    // Debug photo data
    console.log('Photos array:', photos);
    console.log('Primary photo:', primaryPhoto);

    // If no profile data, show a message
    if (!profile) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.push('/main/Matches')}>
                        <Ionicons name="arrow-back" size={24} color={colors.primaryGreen} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Match Details</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.content}>
                    <Text style={styles.errorText}>Unable to load profile information</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.push('/main/Matches')}>
                    <Ionicons name="arrow-back" size={24} color={colors.primaryGreen} />
                </TouchableOpacity>
                <Text style={styles.title}>Match Details</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Profile Info */}
                <View style={styles.profileSection}>
                    <View style={styles.profileHeader}>
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
                        <View style={styles.profileInfo}>
                            <Text style={styles.profileName}>{profile?.name || 'Unknown'}</Text>
                            <Text style={styles.profileDetails}>
                                {profile?.age} • {profile?.gender} • {profile?.height}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Venue Suggestions */}
                {(match.user1_proposed_venue || match.user2_proposed_venue) && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Venue Suggestions</Text>
                        <View style={styles.proposalCard}>
                            {/* Show other person's venue proposal if they proposed something */}
                            {((isUser1 && match.user2_proposed_venue) || (!isUser1 && match.user1_proposed_venue)) && (
                                <View style={styles.otherUserProposal}>
                                    <Text style={styles.proposalLabel}>
                                        {(isUser1 ? match.user2_name : match.user1_name) || 'They'} suggested:
                                    </Text>
                                    <View style={styles.venueInfo}>
                                        <Text style={styles.venueName}>
                                            {((isUser1 ? match.user2_proposed_venue : match.user1_proposed_venue) || {}).name || 'Unknown Venue'}
                                        </Text>
                                        <Text style={styles.venueAddress}>
                                            {((isUser1 ? match.user2_proposed_venue : match.user1_proposed_venue) || {}).location?.address || 'Address not available'}
                                        </Text>
                                    </View>

                                    {/* Show Accept/Decline buttons only if the OTHER person proposed something and you haven't proposed yet */}
                                    {!match.venue_agreed &&
                                        ((isUser1 && match.user2_proposed_venue && !match.user1_proposed_venue) ||
                                            (!isUser1 && match.user1_proposed_venue && !match.user2_proposed_venue)) && (
                                            <View style={styles.proposalActions}>
                                                <TouchableOpacity
                                                    style={[styles.actionButton, styles.acceptButton]}
                                                    onPress={handleAcceptVenue}
                                                >
                                                    <Text style={styles.actionButtonText}>Accept</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={[styles.actionButton, styles.declineButton]}
                                                    onPress={handleDeclineVenue}
                                                >
                                                    <Text style={styles.actionButtonText}>Decline</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                </View>
                            )}

                            {/* Show your own venue proposal if you proposed something */}
                            {((isUser1 && match.user1_proposed_venue) || (!isUser1 && match.user2_proposed_venue)) && (
                                <View style={styles.yourProposal}>
                                    <Text style={styles.proposalLabel}>
                                        You suggested:
                                    </Text>
                                    <View style={styles.venueInfo}>
                                        <Text style={styles.venueName}>
                                            {((isUser1 ? match.user1_proposed_venue : match.user2_proposed_venue) || {}).name || 'Unknown Venue'}
                                        </Text>
                                        <Text style={styles.venueAddress}>
                                            {((isUser1 ? match.user1_proposed_venue : match.user2_proposed_venue) || {}).location?.address || 'Address not available'}
                                        </Text>
                                    </View>
                                    <Text style={styles.proposalStatus}>
                                        Waiting for {(isUser1 ? match.user2_name : match.user1_name) || 'them'} to respond...
                                    </Text>
                                </View>
                            )}

                            {/* Show when both agreed on a venue */}
                            {match.venue_agreed && match.agreed_venue && (
                                <View style={styles.scheduledProposal}>
                                    <Text style={styles.proposalLabel}>
                                        Venue Confirmed! 🎉
                                    </Text>
                                    <View style={styles.venueInfo}>
                                        <Text style={styles.venueName}>
                                            {match.agreed_venue.name || 'Unknown Venue'}
                                        </Text>
                                        <Text style={styles.venueAddress}>
                                            {match.agreed_venue.location?.address || 'Address not available'}
                                        </Text>
                                    </View>
                                    <Text style={styles.proposalStatus}>
                                        Both agreed on this venue
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Suggest New Venue Button */}
                <TouchableOpacity
                    style={styles.suggestVenueButton}
                    onPress={handleSuggestNewVenue}
                >
                    <Ionicons name="location" size={20} color={colors.primaryGreen} />
                    <Text style={styles.suggestVenueText}>Suggest New Venue</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Venue Picker Modal */}
            {showVenuePicker && venuePickerMidpoint && (
                <VenuePickerModal
                    visible={showVenuePicker}
                    onClose={() => {
                        setShowVenuePicker(false);
                        setVenuePickerMidpoint(null);
                    }}
                    matchId={match.id}
                    midpoint={venuePickerMidpoint}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        padding: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    loadingText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#666',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    profileSection: {
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    profilePhoto: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 16,
    },
    placeholderPhoto: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#f8f9fa',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    profileDetails: {
        fontSize: 16,
        color: '#666',
        marginTop: 8,
    },
    section: {
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    proposalCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 16,
    },
    otherUserProposal: {
        marginBottom: 16,
    },
    yourProposal: {
        marginBottom: 16,
    },
    scheduledProposal: {
        marginBottom: 16,
    },
    proposalLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
    },
    venueInfo: {
        marginTop: 8,
    },
    venueName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    venueAddress: {
        fontSize: 14,
        color: '#666',
    },
    proposalStatus: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
        fontStyle: 'italic',
    },
    proposalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    acceptButton: {
        backgroundColor: colors.primaryGreen,
    },
    declineButton: {
        backgroundColor: '#ff6b6b',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    suggestVenueButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f9ff',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        marginTop: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.primaryGreen,
    },
    suggestVenueText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.primaryGreen,
        marginLeft: 8,
    },
    errorText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#ff6b6b',
        fontSize: 18,
    },
});
