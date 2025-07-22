import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabaseClient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import type { Profile } from '../../types';
import { useHaptics } from '../../lib/hooks/useHaptics';
import { createMatch } from '../../lib/supabaseUtils';
import IncomingSwipeCard from '../components/IncomingSwipeCard';

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

            // Get user's matches to exclude them from likes
            const { data: userMatches } = await supabase
                .from('matches')
                .select('user1_id, user2_id')
                .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

            const matchedUserIds = userMatches?.map(match =>
                match.user1_id === userId ? match.user2_id : match.user1_id
            ) || [];

            // Filter out people you've already matched with
            const filteredSwipes = swipes?.filter(swipe =>
                !matchedUserIds.includes(swipe.swiper_id)
            ) || [];

            setIncomingSwipes(filteredSwipes);
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
                Alert.alert('Error', 'Failed to record your response. Please try again.');
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
            Alert.alert('Error', 'Something went wrong. Please try again.');
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
                Alert.alert('Error', 'Failed to send video request. Please try again.');
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
            Alert.alert('Error', 'Something went wrong. Please try again.');
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    if (currentIndex >= incomingSwipes.length) {
        return (
            <View style={styles.container}>
                <View style={styles.emptyState}>
                    <Text style={styles.emptyTitle}>No More Likes</Text>
                    <Text style={styles.emptySubtitle}>
                        You've responded to all your incoming likes!
                    </Text>
                    <TouchableOpacity
                        style={styles.refreshButton}
                        onPress={fetchIncomingSwipes}
                    >
                        <Text style={styles.refreshText}>Check for New Likes</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const currentSwipe = incomingSwipes[currentIndex];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Likes</Text>
                <Text style={styles.subtitle}>
                    {currentIndex + 1} of {incomingSwipes.length}
                </Text>
            </View>

            {/* Swipe Card */}
            <View style={styles.cardContainer}>
                <IncomingSwipeCard
                    swipe={currentSwipe}
                    slideAnim={slideAnim}
                />
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.passButton]}
                    onPress={() => handleSwipe(false)}
                >
                    <Ionicons name="close" size={32} color="#FF6B6B" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.videoButton]}
                    onPress={handleVideoDeferral}
                >
                    <Ionicons name="videocam" size={24} color="#007AFF" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.likeButton]}
                    onPress={() => handleSwipe(true)}
                >
                    <Text style={styles.pearEmoji}>🍐</Text>
                </TouchableOpacity>
            </View>

            {/* Video Deferral Message */}
            {showVideoDeferral && (
                <View style={styles.deferralMessage}>
                    <Text style={styles.deferralText}>{deferralMessage}</Text>
                </View>
            )}
        </View>
    );
}

const { width: screenWidth } = require('react-native').Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        padding: 20,
        paddingTop: 60,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    loadingText: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 200,
        color: '#666',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#1A1A1A',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
    },
    refreshButton: {
        backgroundColor: colors.primaryGreen,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    refreshText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    cardContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 40,
        backgroundColor: '#fff',
    },
    actionButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    passButton: {
        borderWidth: 2,
        borderColor: '#FF6B6B',
    },
    videoButton: {
        borderWidth: 2,
        borderColor: '#007AFF',
    },
    likeButton: {
        borderWidth: 2,
        borderColor: '#00C48C',
    },
    deferralMessage: {
        position: 'absolute',
        bottom: 120,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    deferralText: {
        color: '#fff',
        fontSize: 14,
        textAlign: 'center',
        fontWeight: '500',
    },
    pearEmoji: {
        fontSize: 32,
        color: colors.primaryGreen,
    },
});
