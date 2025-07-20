import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabaseClient';
import { Ionicons } from '@expo/vector-icons';
import type { Profile } from '../../types';
import { useHaptics } from '../../lib/hooks/useHaptics';
import { createMatch } from '../../lib/supabaseUtils';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface IncomingSwipe {
    id: string;
    swiper_id: string;
    swipee_id: string;
    liked: boolean;
    created_at: string;
    suggested_meeting_type?: 'in-person' | 'video';
    suggested_activity?: string;
    suggested_venue?: string;
    swiper_profile: Profile;
}

export default function LikesScreen() {
    const [incomingSwipes, setIncomingSwipes] = useState<IncomingSwipe[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showVideoDeferral, setShowVideoDeferral] = useState(false);
    const [deferralMessage, setDeferralMessage] = useState('');
    const [slideAnim] = useState(new Animated.Value(0));
    const router = useRouter();
    const { lightImpact, successNotification } = useHaptics();

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

    const animateSlideOut = (direction: 'left' | 'right') => {
        const toValue = direction === 'left' ? -screenWidth : screenWidth;
        Animated.timing(slideAnim, {
            toValue,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            slideAnim.setValue(0);
            setCurrentIndex(prev => prev + 1);
        });
    };

    const handleSwipe = async (liked: boolean) => {
        lightImpact();

        const currentSwipe = incomingSwipes[currentIndex];
        if (!currentSwipe) return;

        try {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData?.user) return;

            const userId = userData.user.id;

            // Create a swipe back to the person who liked you
            const { error } = await supabase
                .from('swipes')
                .insert({
                    swiper_id: userId,
                    swipee_id: currentSwipe.swiper_id,
                    liked: liked,
                });

            if (error) {
                console.error('Error creating swipe:', error);
                return;
            }

            // If both people liked each other, create a match
            if (liked) {
                try {
                    await createMatch(
                        userId,
                        currentSwipe.swiper_id,
                        currentSwipe.suggested_meeting_type,
                        currentSwipe.suggested_activity,
                        currentSwipe.suggested_venue
                    );

                    // Show success message - match will appear in Matches tab
                    console.log('Match created successfully!');
                } catch (matchError) {
                    console.error('Error creating match:', matchError);
                }
            }

            // Animate slide out
            animateSlideOut(liked ? 'right' : 'left');
            successNotification();
        } catch (error) {
            console.error('Error handling swipe:', error);
        }
    };

    const handleVideoDeferral = async () => {
        lightImpact();

        const currentSwipe = incomingSwipes[currentIndex];
        if (!currentSwipe) return;

        try {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData?.user) return;

            const userId = userData.user.id;

            // Create a swipe back with video preference
            const { error } = await supabase
                .from('swipes')
                .insert({
                    swiper_id: userId,
                    swipee_id: currentSwipe.swiper_id,
                    liked: true,
                    suggested_meeting_type: 'video',
                });

            if (error) {
                console.error('Error creating video deferral swipe:', error);
                return;
            }

            // Show deferral message
            setDeferralMessage(`Your request to do video first has been sent to ${currentSwipe.swiper_profile.name}`);
            setShowVideoDeferral(true);

            // Hide message after 3 seconds
            setTimeout(() => {
                setShowVideoDeferral(false);
                setDeferralMessage('');
                animateSlideOut('right');
            }, 3000);

            successNotification();
        } catch (error) {
            console.error('Error handling video deferral:', error);
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Loading...</Text>
            </View>
        );
    }

    if (currentIndex >= incomingSwipes.length) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Likes</Text>
                <Text style={styles.subtitle}>You've seen all your likes!</Text>
                <View style={styles.emptyState}>
                    <Ionicons name="heart-outline" size={64} color="#ccc" />
                    <Text style={styles.emptyStateText}>
                        When someone likes you, they'll appear here with their date preferences!
                    </Text>
                </View>
            </View>
        );
    }

    const currentSwipe = incomingSwipes[currentIndex];
    const profile = currentSwipe.swiper_profile;
    const photos = profile.photos || [];
    const primaryPhoto = photos.find(p => p.is_primary) || photos[0];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Likes</Text>
            <Text style={styles.subtitle}>
                {currentIndex + 1} of {incomingSwipes.length}
            </Text>

            {/* Video Deferral Message */}
            {showVideoDeferral && (
                <View style={styles.deferralMessage}>
                    <Text style={styles.deferralText}>{deferralMessage}</Text>
                </View>
            )}

            {/* Profile Card */}
            <Animated.View
                style={[
                    styles.profileCard,
                    {
                        transform: [{ translateX: slideAnim }]
                    }
                ]}
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

                {/* Profile Info */}
                <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>{profile.name}</Text>
                    <Text style={styles.profileDetails}>
                        {profile.age} • {profile.gender} • {profile.height}
                    </Text>
                    {profile.bio && (
                        <Text style={styles.profileBio} numberOfLines={3}>
                            {profile.bio}
                        </Text>
                    )}

                    {/* Date Preference */}
                    {currentSwipe.suggested_meeting_type && (
                        <View style={styles.datePreference}>
                            <Ionicons
                                name={currentSwipe.suggested_meeting_type === 'video' ? 'videocam' : 'location'}
                                size={16}
                                color="#00C48C"
                            />
                            <Text style={styles.datePreferenceText}>
                                {currentSwipe.suggested_meeting_type === 'video' ? 'Video Call' : 'In Person'}
                            </Text>
                        </View>
                    )}

                    {/* Suggested Activity/Venue */}
                    {currentSwipe.suggested_activity && (
                        <View style={styles.suggestedActivity}>
                            <Text style={styles.suggestedActivityText}>
                                💡 {currentSwipe.suggested_activity}
                            </Text>
                        </View>
                    )}
                    {currentSwipe.suggested_venue && (
                        <View style={styles.suggestedVenue}>
                            <Text style={styles.suggestedVenueText}>
                                📍 {currentSwipe.suggested_venue}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.passButton]}
                        onPress={() => handleSwipe(false)}
                    >
                        <Ionicons name="close" size={24} color="#FF6B6B" />
                    </TouchableOpacity>

                    {/* Video Deferral Button (only for in-person requests) */}
                    {currentSwipe.suggested_meeting_type === 'in-person' && (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.videoButton]}
                            onPress={handleVideoDeferral}
                        >
                            <Text style={styles.videoButtonText}>Propose Video</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[styles.actionButton, styles.likeButton]}
                        onPress={() => handleSwipe(true)}
                    >
                        <Text style={styles.pearEmoji}>🍐</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>

            {/* Stack Preview */}
            {incomingSwipes.length > 1 && (
                <View style={styles.stackPreview}>
                    {incomingSwipes.slice(currentIndex + 1, currentIndex + 4).map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.stackCard,
                                {
                                    transform: [{ translateY: index * 4 }],
                                    opacity: 1 - (index * 0.3)
                                }
                            ]}
                        />
                    ))}
                </View>
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
    deferralMessage: {
        backgroundColor: '#007AFF',
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 16,
        borderRadius: 12,
    },
    deferralText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
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
    profileCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        marginHorizontal: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 5,
        overflow: 'hidden',
        zIndex: 10,
    },
    photoContainer: {
        height: 300,
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
    videoButton: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#007AFF',
    },
    likeButton: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#00C48C',
    },
    pearEmoji: {
        fontSize: 24,
    },
    stackPreview: {
        position: 'absolute',
        top: 120,
        left: 20,
        right: 20,
        zIndex: 1,
    },
    stackCard: {
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        height: 400,
        marginBottom: 4,
    },
    videoButtonText: {
        color: '#007AFF',
        fontWeight: '600',
        fontSize: 16,
    },
});
