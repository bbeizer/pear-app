import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabaseClient';
import { Ionicons } from '@expo/vector-icons';
import type { Profile } from '../../types';

interface IncomingSwipe {
    id: string;
    swiper_id: string;
    swipee_id: string;
    liked: boolean;
    created_at: string;
    meeting_type?: 'in-person' | 'video';
    suggested_activity?: string;
    suggested_venue?: string;
    swiper_profile: Profile;
}

export default function LikesScreen() {
    const [incomingSwipes, setIncomingSwipes] = useState<IncomingSwipe[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchIncomingSwipes();
    }, []);

    const fetchIncomingSwipes = async () => {
        try {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData?.user) return;

            const userId = userData.user.id;

            // Get all swipes where this user is the swipee (was swiped on)
            const { data: swipes, error } = await supabase
                .from('swipes')
                .select(`
                    *,
                    swiper_profile:profiles!swiper_id(*)
                `)
                .eq('swipee_id', userId)
                .eq('liked', true)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching incoming swipes:', error);
                return;
            }

            setIncomingSwipes(swipes || []);
        } catch (error) {
            console.error('Error in fetchIncomingSwipes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSwipe = async (swipeId: string, liked: boolean) => {
        try {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData?.user) return;

            const userId = userData.user.id;
            const incomingSwipe = incomingSwipes.find(s => s.id === swipeId);
            if (!incomingSwipe) return;

            // Create a swipe back to the person who liked you
            const { error } = await supabase
                .from('swipes')
                .insert({
                    swiper_id: userId,
                    swipee_id: incomingSwipe.swiper_id,
                    liked: liked,
                });

            if (error) {
                console.error('Error creating swipe:', error);
                return;
            }

            // If both people liked each other, create a match
            if (liked) {
                const { error: matchError } = await supabase
                    .from('matches')
                    .insert({
                        user1_id: userId,
                        user2_id: incomingSwipe.swiper_id,
                        status: 'pending',
                        meeting_type: incomingSwipe.meeting_type,
                        suggested_activity: incomingSwipe.suggested_activity,
                        suggested_venue: incomingSwipe.suggested_venue,
                    });

                if (matchError) {
                    console.error('Error creating match:', matchError);
                } else {
                    // Navigate to the match flow
                    router.push(`/postMatch/${userId}-${incomingSwipe.swiper_id}/ChooseMeetType`);
                }
            }

            // Remove the swipe from the list
            setIncomingSwipes(prev => prev.filter(s => s.id !== swipeId));
        } catch (error) {
            console.error('Error handling swipe:', error);
        }
    };

    const renderIncomingSwipe = ({ item }: { item: IncomingSwipe }) => {
        const profile = item.swiper_profile;
        const photos = profile.photos || [];
        const primaryPhoto = photos.find(p => p.is_primary) || photos[0];

        return (
            <View style={styles.swipeCard}>
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

                {/* Profile Info */}
                <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>{profile.name}</Text>
                    <Text style={styles.profileDetails}>
                        {profile.age} • {profile.gender} • {profile.height}
                    </Text>
                    {profile.bio && (
                        <Text style={styles.profileBio} numberOfLines={2}>
                            {profile.bio}
                        </Text>
                    )}

                    {/* Date Preference */}
                    {item.meeting_type && (
                        <View style={styles.datePreference}>
                            <Ionicons
                                name={item.meeting_type === 'video' ? 'videocam' : 'location'}
                                size={16}
                                color="#00C48C"
                            />
                            <Text style={styles.datePreferenceText}>
                                {item.meeting_type === 'video' ? 'Video Call' : 'In Person'}
                            </Text>
                        </View>
                    )}

                    {/* Suggested Activity/Venue */}
                    {item.suggested_activity && (
                        <View style={styles.suggestedActivity}>
                            <Text style={styles.suggestedActivityText}>
                                💡 {item.suggested_activity}
                            </Text>
                        </View>
                    )}
                    {item.suggested_venue && (
                        <View style={styles.suggestedVenue}>
                            <Text style={styles.suggestedVenueText}>
                                📍 {item.suggested_venue}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.passButton]}
                        onPress={() => handleSwipe(item.id, false)}
                    >
                        <Ionicons name="close" size={24} color="#FF6B6B" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.likeButton]}
                        onPress={() => handleSwipe(item.id, true)}
                    >
                        <Ionicons name="heart" size={24} color="#00C48C" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Likes</Text>
            <Text style={styles.subtitle}>
                {incomingSwipes.length === 0
                    ? "No likes yet. Keep swiping!"
                    : `${incomingSwipes.length} people liked you`}
            </Text>

            {incomingSwipes.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="heart-outline" size={64} color="#ccc" />
                    <Text style={styles.emptyStateText}>
                        When someone likes you, they'll appear here with their date preferences!
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={incomingSwipes}
                    keyExtractor={(item) => item.id}
                    renderItem={renderIncomingSwipe}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContainer}
                />
            )}
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
    swipeCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 5,
        overflow: 'hidden',
    },
    photoContainer: {
        height: 200,
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
    profileInfo: {
        padding: 20,
    },
    profileName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    profileDetails: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
    },
    profileBio: {
        fontSize: 15,
        color: '#444',
        lineHeight: 20,
        marginBottom: 12,
    },
    datePreference: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f9ff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    datePreferenceText: {
        fontSize: 14,
        color: '#00C48C',
        fontWeight: '600',
        marginLeft: 6,
    },
    suggestedActivity: {
        marginBottom: 4,
    },
    suggestedActivityText: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
    },
    suggestedVenue: {
        marginBottom: 12,
    },
    suggestedVenueText: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        paddingHorizontal: 20,
        paddingBottom: 20,
        gap: 20,
    },
    actionButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
    },
    passButton: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#FF6B6B',
    },
    likeButton: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#00C48C',
    },
});
