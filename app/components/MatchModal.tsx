import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    ScrollView,
    Image,
    Alert,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabaseClient';
import type { Profile, Match } from '../../types';
import { useHaptics } from '../../lib/hooks/useHaptics';
import { colors } from '../../theme/colors';
import VenueSuggestions from './VenueSuggestions';
import type { Venue } from '../../lib/venueClient';


// No separate TimeProposal interface needed - proposal data is in the match object

interface MatchModalProps {
    visible: boolean;
    match: Match | null;
    onClose: () => void;
    onMatchUpdate: () => void;
}

export default function MatchModal({ visible, match, onClose, onMatchUpdate }: MatchModalProps) {
    const [mutualTimes, setMutualTimes] = useState<string[]>([]);
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [proposing, setProposing] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string>('');
    const [isUser1, setIsUser1] = useState<boolean>(false);
    const { lightImpact, successNotification } = useHaptics();

    useEffect(() => {
        if (visible && match) {
            fetchMatchData();
        }
    }, [visible, match]);

    useEffect(() => {
        const getCurrentUser = async () => {
            const { data: userData } = await supabase.auth.getUser();
            if (userData?.user && match) {
                const userId = userData.user.id;
                setCurrentUserId(userId);
                setIsUser1(match.user1_id === userId);
            }
        };
        getCurrentUser();
    }, [match]);

    const fetchMatchData = async () => {
        if (!match) return;

        setLoading(true);
        try {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData?.user) return;

            const userId = userData.user.id;
            const otherUserId = match.user1_id === userId ? match.user2_id : match.user1_id;

            // Fetch both users' availability
            const [userAvailability, otherUserAvailability] = await Promise.all([
                supabase.from('profiles').select('weekly_availability').eq('id', userId).single(),
                supabase.from('profiles').select('weekly_availability').eq('id', otherUserId).single()
            ]);

            // Find mutual times
            const userSlots = userAvailability.data?.weekly_availability || {};
            const otherUserSlots = otherUserAvailability.data?.weekly_availability || {};

            // Find overlapping time slots
            const overlap: string[] = [];
            Object.keys(userSlots).forEach(slot => {
                if (userSlots[slot] && otherUserSlots[slot]) {
                    overlap.push(slot);
                }
            });

            setMutualTimes(overlap);

            // No need to fetch proposals separately - they're in the match object
        } catch (error) {
            console.error('Error fetching match data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'unscheduled': return 'Unscheduled';
            case 'proposed': return 'Proposed';
            case 'scheduled': return 'Scheduled';
            default: return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'unscheduled': return '#999';
            case 'proposed': return '#007AFF';
            case 'scheduled': return colors.primaryGreen;
            default: return '#666';
        }
    };

    const handleProposeTime = async () => {
        if (!selectedTime || !match) return;

        setProposing(true);
        try {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData?.user) return;

            const userId = userData.user.id;
            const isUser1 = match.user1_id === userId;
            const updateField = isUser1 ? 'user1_proposed_time' : 'user2_proposed_time';
            const otherUserField = isUser1 ? 'user2_proposed_time' : 'user1_proposed_time';

            // Check if both users have proposed the same time
            const otherUserTime = match[otherUserField];
            const newStatus = otherUserTime === selectedTime ? 'scheduled' : 'proposed';

            console.log('🍐 [MatchModal] Proposing time:', selectedTime, 'for match:', match.id);
            console.log('🍐 [MatchModal] Other user time:', otherUserTime, 'New status:', newStatus);
            console.log('🍐 [MatchModal] Auto-scheduling will happen if times match');

            const { error } = await supabase
                .from('matches')
                .update({
                    [updateField]: selectedTime,
                    status: newStatus
                })
                .eq('id', match.id);

            if (error) {
                console.error('🍐 [MatchModal] Error creating time proposal:', error);
                Alert.alert('Error', 'Failed to propose time');
                return;
            }

            console.log('🍐 [MatchModal] Successfully proposed time, status updated to', newStatus);

            successNotification();
            if (newStatus === 'scheduled') {
                Alert.alert('Success', 'Meeting scheduled! Both users agreed on the time.');
            } else {
                Alert.alert('Success', 'Time proposed! Waiting for the other person to respond.');
            }

            // Refresh data
            await fetchMatchData();
            onMatchUpdate();
        } catch (error) {
            console.error('Error proposing time:', error);
            Alert.alert('Error', 'Failed to propose time');
        } finally {
            setProposing(false);
        }
    };

    const handleAcceptProposal = async () => {
        if (!match) return;

        try {
            // Get the other person's proposed time and set it as your proposed time too
            const { data: userData } = await supabase.auth.getUser();
            if (!userData?.user) return;

            const userId = userData.user.id;
            const isUser1 = match.user1_id === userId;
            const otherUserTime = isUser1 ? match.user2_proposed_time : match.user1_proposed_time;
            const updateField = isUser1 ? 'user1_proposed_time' : 'user2_proposed_time';

            // Update match to scheduled with both users having the same proposed time
            const { error } = await supabase
                .from('matches')
                .update({
                    status: 'scheduled',
                    [updateField]: otherUserTime
                })
                .eq('id', match.id);

            if (error) {
                console.error('Error accepting proposal:', error);
                return;
            }

            successNotification();
            Alert.alert('Success', 'Meeting scheduled! Both users agreed on the time.');

            await fetchMatchData();
            onMatchUpdate();
        } catch (error) {
            console.error('Error accepting proposal:', error);
        }
    };

    const handleDeclineProposal = async () => {
        if (!match) return;

        try {
            const { error } = await supabase
                .from('matches')
                .update({
                    status: 'unscheduled',
                    user1_proposed_time: null,
                    user2_proposed_time: null
                })
                .eq('id', match.id);

            if (error) {
                console.error('Error declining proposal:', error);
                return;
            }

            await fetchMatchData();
            onMatchUpdate();
        } catch (error) {
            console.error('Error declining proposal:', error);
        }
    };

    if (!match) return null;

    console.log('🍐 [MatchModal] Current match status:', match.status, 'user1_time:', match.user1_proposed_time, 'user2_time:', match.user2_proposed_time);

    const profile = match.other_user_profile;
    const photos = profile?.photos || [];
    const primaryPhoto = photos.find(p => p.is_primary) || photos[0];

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Match Details</Text>
                    <View style={styles.statusBadge}>
                        <Text style={[styles.statusText, { color: getStatusColor(match.status) }]}>
                            {getStatusText(match.status)}
                        </Text>
                    </View>
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
                                <Text style={styles.profileName}>{profile?.name}</Text>
                                <Text style={styles.profileDetails}>
                                    {profile?.age} • {profile?.gender} • {profile?.height}
                                </Text>
                            </View>
                        </View>

                        {/* Meeting Type */}
                        {match.meeting_type && (
                            <View style={styles.meetingType}>
                                <Ionicons
                                    name={match.meeting_type === 'video' ? 'videocam' : 'location'}
                                    size={16}
                                    color={colors.primaryGreen}
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
                    </View>

                    {/* Venue Suggestions for In-Person Meetings */}
                    {match.meeting_type === 'in-person' && profile?.latitude && profile?.longitude && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Venue Suggestions</Text>
                            <View style={styles.venueSuggestionsContainer}>
                                <VenueSuggestions
                                    latitude={profile.latitude}
                                    longitude={profile.longitude}
                                    onVenueSelect={(venue) => {
                                        // TODO: Update the match with the selected venue
                                        Alert.alert(
                                            'Venue Selected',
                                            `Selected: ${venue.name}`,
                                            [
                                                { text: 'Cancel', style: 'cancel' },
                                                {
                                                    text: 'Use This Venue',
                                                    onPress: () => {
                                                        // TODO: Update match.suggested_venue with venue.name
                                                        Alert.alert('Success', 'Venue suggestion updated!');
                                                    }
                                                }
                                            ]
                                        );
                                    }}
                                    selectedVenue={match.suggested_venue ? { id: 'selected', name: match.suggested_venue } as Venue : null}
                                />
                            </View>
                        </View>
                    )}

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={colors.primaryGreen} />
                            <Text style={styles.loadingText}>Loading availability...</Text>
                        </View>
                    ) : (
                        <>
                            {/* Mutual Times */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Mutual Availability</Text>
                                {mutualTimes.length === 0 ? (
                                    <View style={styles.noTimesContainer}>
                                        <Text style={styles.noTimesText}>
                                            No mutual availability found.
                                        </Text>
                                        <Text style={styles.noTimesSubtext}>
                                            You can propose a time that works for you, or suggest they update their availability.
                                        </Text>

                                        {/* Propose Your Available Time */}
                                        <TouchableOpacity
                                            style={styles.proposeOwnTimeButton}
                                            onPress={() => {
                                                // This would open a time picker or availability selector
                                                Alert.alert(
                                                    'Propose Your Time',
                                                    'This would open your availability grid to select a time that works for you.',
                                                    [
                                                        { text: 'Cancel', style: 'cancel' },
                                                        {
                                                            text: 'Open Availability', onPress: () => {
                                                                // TODO: Navigate to availability screen or open time picker
                                                                Alert.alert('Coming Soon', 'This feature will let you propose a time from your availability.');
                                                            }
                                                        }
                                                    ]
                                                );
                                            }}
                                        >
                                            <Ionicons name="time-outline" size={20} color={colors.primaryGreen} />
                                            <Text style={styles.proposeOwnTimeText}>Propose Your Available Time</Text>
                                        </TouchableOpacity>

                                        {/* Suggest They Update Availability */}
                                        <TouchableOpacity
                                            style={styles.suggestUpdateButton}
                                            onPress={() => {
                                                Alert.alert(
                                                    'Suggest Update',
                                                    'This would send a gentle reminder to update their availability.',
                                                    [
                                                        { text: 'Cancel', style: 'cancel' },
                                                        {
                                                            text: 'Send Reminder', onPress: () => {
                                                                Alert.alert('Reminder Sent', 'A gentle reminder has been sent to update their availability.');
                                                            }
                                                        }
                                                    ]
                                                );
                                            }}
                                        >
                                            <Ionicons name="refresh-outline" size={20} color="#007AFF" />
                                            <Text style={styles.suggestUpdateText}>Suggest They Update Availability</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View style={styles.timesContainer}>
                                        {mutualTimes.map((time, index) => (
                                            <TouchableOpacity
                                                key={index}
                                                style={[
                                                    styles.timeOption,
                                                    selectedTime === time && styles.selectedTime
                                                ]}
                                                onPress={() => setSelectedTime(time)}
                                            >
                                                <Text style={[
                                                    styles.timeText,
                                                    selectedTime === time && styles.selectedTimeText
                                                ]}>
                                                    {time.replace(/_/g, ' ')}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>

                            {/* Current Proposals */}
                            {(match.user1_proposed_time || match.user2_proposed_time) && (
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Proposed Times</Text>
                                    <View style={styles.proposalCard}>
                                        {/* Show other person's proposal if they proposed something */}
                                        {((isUser1 && match.user2_proposed_time) || (!isUser1 && match.user1_proposed_time)) && (
                                            <View style={styles.otherUserProposal}>
                                                <Text style={styles.proposalLabel}>
                                                    {(isUser1 ? match.user2_name : match.user1_name) || profile?.name || 'They'} proposed:
                                                </Text>
                                                <Text style={styles.proposalTime}>
                                                    {((isUser1 ? match.user2_proposed_time : match.user1_proposed_time) || '').replace(/_/g, ' ')}
                                                </Text>

                                                {/* Show Accept/Decline buttons only if the OTHER person proposed something and you haven't proposed yet */}
                                                {match.status === 'proposed' &&
                                                    ((isUser1 && match.user2_proposed_time && !match.user1_proposed_time) ||
                                                        (!isUser1 && match.user1_proposed_time && !match.user2_proposed_time)) && (
                                                        <View style={styles.proposalActions}>
                                                            <TouchableOpacity
                                                                style={[styles.actionButton, styles.acceptButton]}
                                                                onPress={handleAcceptProposal}
                                                            >
                                                                <Text style={styles.actionButtonText}>Accept</Text>
                                                            </TouchableOpacity>
                                                            <TouchableOpacity
                                                                style={[styles.actionButton, styles.declineButton]}
                                                                onPress={handleDeclineProposal}
                                                            >
                                                                <Text style={styles.actionButtonText}>Decline</Text>
                                                            </TouchableOpacity>
                                                        </View>
                                                    )}
                                            </View>
                                        )}

                                        {/* Show your own proposal if you proposed something */}
                                        {((isUser1 && match.user1_proposed_time) || (!isUser1 && match.user2_proposed_time)) && (
                                            <View style={styles.yourProposal}>
                                                <Text style={styles.proposalLabel}>
                                                    You proposed:
                                                </Text>
                                                <Text style={styles.proposalTime}>
                                                    {((isUser1 ? match.user1_proposed_time : match.user2_proposed_time) || '').replace(/_/g, ' ')}
                                                </Text>
                                                <Text style={styles.proposalStatus}>
                                                    Waiting for {(isUser1 ? match.user2_name : match.user1_name) || profile?.name || 'them'} to respond...
                                                </Text>
                                            </View>
                                        )}

                                        {/* Show when both proposed the same time */}
                                        {match.status === 'scheduled' && match.user1_proposed_time && match.user2_proposed_time && match.user1_proposed_time === match.user2_proposed_time && (
                                            <View style={styles.scheduledProposal}>
                                                <Text style={styles.proposalLabel}>
                                                    Meeting Scheduled! 🎉
                                                </Text>
                                                <Text style={styles.proposalTime}>
                                                    {match.user1_proposed_time.replace(/_/g, ' ')}
                                                </Text>
                                                <Text style={styles.proposalStatus}>
                                                    Both agreed on this time
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            )}

                            {/* Propose Button - only show if you haven't proposed yet */}
                            {mutualTimes.length > 0 && selectedTime &&
                                !((isUser1 && match.user1_proposed_time) || (!isUser1 && match.user2_proposed_time)) && (
                                    <TouchableOpacity
                                        style={[
                                            styles.proposeButton,
                                            proposing && styles.proposeButtonDisabled
                                        ]}
                                        onPress={handleProposeTime}
                                        disabled={proposing}
                                    >
                                        {proposing ? (
                                            <ActivityIndicator size="small" color="#fff" />
                                        ) : (
                                            <Text style={styles.proposeButtonText}>Propose Time</Text>
                                        )}
                                    </TouchableOpacity>
                                )}
                        </>
                    )}
                </ScrollView>
            </View>
        </Modal>
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
        paddingTop: 60,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    closeButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#f8f9fa',
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
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
    },
    meetingType: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f9ff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    meetingTypeText: {
        fontSize: 14,
        color: colors.primaryGreen,
        fontWeight: '600',
        marginLeft: 6,
    },
    suggestedActivity: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
        marginBottom: 4,
    },
    suggestedVenue: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    section: {
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 16,
    },
    noTimesContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    noTimesText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        fontStyle: 'italic',
        marginBottom: 8,
    },
    noTimesSubtext: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        paddingHorizontal: 20,
        lineHeight: 20,
    },
    proposeOwnTimeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f9f4',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.primaryGreen,
    },
    proposeOwnTimeText: {
        fontSize: 14,
        color: colors.primaryGreen,
        fontWeight: '600',
        marginLeft: 8,
    },
    suggestUpdateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f8ff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#007AFF',
    },
    suggestUpdateText: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '600',
        marginLeft: 8,
    },
    timesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    timeOption: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    selectedTime: {
        backgroundColor: colors.primaryGreen,
        borderColor: colors.primaryGreen,
    },
    timeText: {
        fontSize: 14,
        color: '#666',
    },
    selectedTimeText: {
        color: '#fff',
        fontWeight: '600',
    },
    proposalCard: {
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    otherUserProposal: {
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    yourProposal: {
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    scheduledProposal: {
        marginBottom: 16,
    },
    proposalLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
        fontWeight: '500',
    },
    proposalTime: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    proposalStatus: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    proposalActions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    acceptButton: {
        backgroundColor: colors.primaryGreen,
    },
    declineButton: {
        backgroundColor: '#FF6B6B',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    proposeButton: {
        backgroundColor: colors.primaryGreen,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginVertical: 20,
    },
    proposeButtonDisabled: {
        backgroundColor: '#ccc',
    },
    proposeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    venueSuggestionsContainer: {
        height: 300,
        marginTop: 8,
    },
}); 