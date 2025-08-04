import { useState, useEffect } from 'react';
import { Animated, Alert } from 'react-native';
import { supabase } from '../supabaseClient';
import { useRouter } from 'expo-router';
import type { Profile } from '../../types';
import { createMatch } from '../supabaseUtils';

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

export function useLikes() {
    const router = useRouter();
    
    const [incomingSwipes, setIncomingSwipes] = useState<IncomingSwipe[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showVideoDeferral, setShowVideoDeferral] = useState(false);
    const [deferralMessage, setDeferralMessage] = useState('');
    const [slideAnim] = useState(new Animated.Value(0));

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
        const toValue = direction === 'left' ? -400 : 400; // Approximate screen width
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
        const currentSwipe = incomingSwipes[currentIndex];
        if (!currentSwipe) return;

        try {
            // Create a swipe response
            const { error: swipeError } = await supabase
                .from('swipes')
                .insert({
                    swiper_id: currentSwipe.swipee_id, // Current user becomes swiper
                    swipee_id: currentSwipe.swiper_id, // Other user becomes swipee
                    liked,
                });

            if (swipeError) {
                console.error('Error creating swipe response:', swipeError);
                Alert.alert('Error', 'Failed to record your response. Please try again.');
                return;
            }

            // If both users liked each other, create a match
            if (liked && currentSwipe.liked) {
                const matchResult = await createMatch(
                    currentSwipe.swiper_id,
                    currentSwipe.swipee_id
                );

                if (matchResult.success) {
                    Alert.alert(
                        'It\'s a Match! 🎉',
                        `You and ${currentSwipe.swiper_profile.name} liked each other!`,
                        [
                            {
                                text: 'View Match',
                                onPress: () => router.push('/main/Matches'),
                            },
                            {
                                text: 'Keep Browsing',
                                style: 'cancel',
                            },
                        ]
                    );
                }
            }

            // Animate the card out
            animateSlideOut(liked ? 'right' : 'left');
        } catch (error) {
            console.error('Error in handleSwipe:', error);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        }
    };

    const handleVideoDeferral = async () => {
        const currentSwipe = incomingSwipes[currentIndex];
        if (!currentSwipe) return;

        try {
            // Update the swipe with video deferral
            const { error } = await supabase
                .from('swipes')
                .update({
                    suggested_meeting_type: 'video',
                    suggested_activity: deferralMessage,
                })
                .eq('id', currentSwipe.id);

            if (error) {
                console.error('Error updating swipe with video deferral:', error);
                Alert.alert('Error', 'Failed to send video deferral. Please try again.');
                return;
            }

            setShowVideoDeferral(false);
            setDeferralMessage('');
            animateSlideOut('right');
        } catch (error) {
            console.error('Error in handleVideoDeferral:', error);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        }
    };

    const handleSkip = () => {
        animateSlideOut('left');
    };

    const currentSwipe = incomingSwipes[currentIndex];
    const hasMoreSwipes = currentIndex < incomingSwipes.length;

    return {
        // State
        incomingSwipes,
        currentIndex,
        loading,
        showVideoDeferral,
        deferralMessage,
        slideAnim,
        currentSwipe,
        hasMoreSwipes,
        
        // Actions
        setShowVideoDeferral,
        setDeferralMessage,
        handleSwipe,
        handleVideoDeferral,
        handleSkip,
        fetchIncomingSwipes,
    };
} 