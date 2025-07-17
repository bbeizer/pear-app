import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from 'lib/supabaseClient';
import { getSupabaseWithAuth } from 'lib/supabaseWithAuth';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { Profile } from '../../types';
import { fetchAvailableProfiles, fetchUserMatches } from '../../lib/supabaseUtils';

const { height: screenHeight } = Dimensions.get('window');

export default function Pool() {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userId, setUserId] = useState<string | null>(null);
    const [showMeetingModal, setShowMeetingModal] = useState(false);
    const [selectedMeetingType, setSelectedMeetingType] = useState<'in-person' | 'video' | null>(null);
    const [selectedActivity, setSelectedActivity] = useState<string>('');
    const router = useRouter();

    const activities = [
        'Coffee ☕️',
        'Dinner 🍽️',
        'Drinks 🍸',
        'Walk in the park 🌳',
        'Museum visit 🏛️',
        'Movie 🎬',
        'Bowling 🎳',
        'Escape room 🧩',
        'Mini golf ⛳',
        'Art gallery 🎨'
    ];

    useEffect(() => {
        const fetchData = async () => {
            const { data: userData } = await supabase.auth.getUser();
            const uid = userData?.user?.id;
            if (!uid) return;

            setUserId(uid);
            const matches = await fetchUserMatches(uid);
            const excludedIds = [uid, ...matches.map(m => m.user1_id === uid ? m.user2_id : m.user1_id)];
            const available = await fetchAvailableProfiles(excludedIds);
            setProfiles(available);
        };
        fetchData();
    }, []);

    const handlePearClick = () => {
        setShowMeetingModal(true);
    };

    const handleMeetingTypeSelect = (type: 'in-person' | 'video') => {
        setSelectedMeetingType(type);
        if (type === 'video') {
            // For video, we can proceed directly
            handleSwipe(true);
            setShowMeetingModal(false);
            setSelectedMeetingType(null);
        }
    };

    const handleActivitySelect = (activity: string) => {
        setSelectedActivity(activity);
        // Proceed with the like and selected activity
        handleSwipe(true);
        setShowMeetingModal(false);
        setSelectedMeetingType(null);
        setSelectedActivity('');
    };

    const handleSwipe = async (liked: boolean) => {
        const target = profiles[currentIndex];
        if (!target || !userId) return;

        const session = await supabase.auth.getSession();
        const uid = session.data.session?.user?.id;
        const token = session.data.session?.access_token;
        if (!uid || !token) return;

        const authedSupabase = await getSupabaseWithAuth();
        await authedSupabase.from('swipes').insert({
            swiper_id: uid,
            swipee_id: target.id,
            liked,
        });

        console.log(`${liked ? 'Liked' : 'Passed'} ${target.name}`);
        if (liked && selectedActivity) {
            console.log(`Suggested activity: ${selectedActivity}`);
        }
        setCurrentIndex(prev => prev + 1);
    };

    const currentProfile = profiles[currentIndex];

    if (!currentProfile) {
        return (
            <View style={styles.absoluteContainer}>
                <StatusBar translucent backgroundColor="transparent" style="light" />
                <Text style={styles.emptyText}>You've seen everyone!</Text>
                <TouchableOpacity onPress={() => window.location.reload()} style={styles.refreshButton}>
                    <Text style={styles.refreshText}>Refresh</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const photos = currentProfile.photos ?? [];
    const prompts = currentProfile.prompts ?? [];

    const interleaved: React.ReactNode[] = [];

    // Profile info card at the top
    interleaved.push(
        <View key="profile-info-card" style={styles.profileInfoCard}>
            <Text style={styles.profileNameLarge}>{currentProfile.name}</Text>
            <Text style={styles.profileDetails}>
                {currentProfile.age} • {currentProfile.gender} • {currentProfile.height}
            </Text>
            {!!currentProfile.bio && (
                <Text style={styles.profileBio}>{currentProfile.bio}</Text>
            )}
            <View style={styles.profileTagsRow}>
                {currentProfile.religion && currentProfile.religion !== 'None' && (
                    <Text style={styles.profileTag}>{currentProfile.religion}</Text>
                )}
                {currentProfile.politics && (
                    <Text style={styles.profileTag}>{currentProfile.politics}</Text>
                )}
            </View>
        </View>
    );

    // All photos flow normally
    for (let i = 0; i < photos.length; i++) {
        interleaved.push(
            <Image
                key={`photo-${i}`}
                source={{ uri: photos[i].url }}
                style={styles.fullScreenPhoto}
                resizeMode="cover"
            />
        );

        if (i < prompts.length) {
            const prompt = prompts[i];
            interleaved.push(
                <View key={`prompt-paired-${i}`} style={styles.promptCard}>
                    <Text style={styles.promptQuestion}>{prompt.question}</Text>
                    <Text style={styles.promptAnswer}>{prompt.answer}</Text>
                </View>
            );
        }
    }

    // Extra prompts if more prompts than photos
    for (let j = photos.length; j < prompts.length; j++) {
        const prompt = prompts[j];
        interleaved.push(
            <View key={`prompt-extra-${j}`} style={styles.promptCard}>
                <Text style={styles.promptQuestion}>{prompt.question}</Text>
                <Text style={styles.promptAnswer}>{prompt.answer}</Text>
            </View>
        );
    }

    return (
        <View style={styles.absoluteContainer}>
            <StatusBar translucent backgroundColor="transparent" style="light" />

            <ScrollView
                style={styles.cardsList}
                contentContainerStyle={{ paddingBottom: 160 }}
                showsVerticalScrollIndicator={false}
            >
                {interleaved}
            </ScrollView>

            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.passButton]}
                    onPress={() => handleSwipe(false)}
                >
                    <Ionicons name="close" size={32} color="#FF6B6B" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, styles.likeButton]}
                    onPress={handlePearClick}
                >
                    <Text style={styles.pearEmoji}>🍐</Text>
                </TouchableOpacity>
            </View>

            {/* Meeting Type Modal */}
            {showMeetingModal && (
                <View style={styles.modalOverlay}>
                    <View style={styles.meetingModal}>
                        <Text style={styles.modalTitle}>How would you like to meet?</Text>

                        {!selectedMeetingType ? (
                            <View style={styles.meetingOptions}>
                                <TouchableOpacity
                                    style={styles.meetingOption}
                                    onPress={() => handleMeetingTypeSelect('in-person')}
                                >
                                    <Text style={styles.meetingOptionText}>In Person 🤝</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.meetingOption}
                                    onPress={() => handleMeetingTypeSelect('video')}
                                >
                                    <Text style={styles.meetingOptionText}>Video Call 📹</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => setShowMeetingModal(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        ) : selectedMeetingType === 'in-person' ? (
                            <View style={styles.activityOptions}>
                                <Text style={styles.activityTitle}>Suggest an activity:</Text>
                                <ScrollView style={styles.activityScroll}>
                                    {activities.map((activity, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={styles.activityOption}
                                            onPress={() => handleActivitySelect(activity)}
                                        >
                                            <Text style={styles.activityOptionText}>{activity}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                                <TouchableOpacity
                                    style={styles.backButton}
                                    onPress={() => setSelectedMeetingType(null)}
                                >
                                    <Text style={styles.backButtonText}>Back</Text>
                                </TouchableOpacity>
                            </View>
                        ) : null}
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    absoluteContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    cardsList: {
        flex: 1,
    },
    fullScreenPhoto: {
        width: '100%',
        height: screenHeight * 0.8,
        padding: 20,
    },
    profileInfoCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
        marginTop: 60, // ✅ Pull up to eliminate forehead space
        marginHorizontal: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 5,
        zIndex: 10,
    },
    profileNameLarge: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    profileDetails: {
        fontSize: 16,
        color: '#555',
        marginVertical: 4,
    },
    profileBio: {
        fontSize: 15,
        color: '#333',
        marginTop: 8,
    },
    profileTagsRow: {
        flexDirection: 'row',
        marginTop: 10,
        gap: 8,
        flexWrap: 'wrap',
    },
    profileTag: {
        backgroundColor: '#E0E7FF',
        color: '#1E3A8A',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        fontSize: 13,
    },
    promptCard: {
        backgroundColor: '#fff',
        padding: 18,
        borderRadius: 20,
        margin: 10,
        marginTop: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 6,
        elevation: 3,
    },
    promptQuestion: {
        fontWeight: '600',
        fontSize: 16,
        color: '#222',
        marginBottom: 6,
    },
    promptAnswer: {
        fontSize: 15,
        color: '#444',
    },
    actionButtons: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        zIndex: 100,
    },
    actionButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,
        elevation: 4,
    },
    passButton: {
        borderWidth: 3,
        borderColor: '#FF6B6B',
    },
    likeButton: {
        borderWidth: 3,
        borderColor: '#00C48C',
    },
    pearEmoji: {
        fontSize: 30,
    },
    emptyText: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 60,
        color: '#999',
    },
    refreshButton: {
        alignSelf: 'center',
        marginTop: 20,
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#f2f2f2',
        borderRadius: 8,
    },
    refreshText: {
        color: '#333',
        fontWeight: '500',
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    meetingModal: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        margin: 20,
        maxWidth: 400,
        width: '90%',
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 24,
        color: '#1A1A1A',
    },
    meetingOptions: {
        gap: 12,
    },
    meetingOption: {
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    meetingOptionText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1A1A1A',
    },
    cancelButton: {
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#6c757d',
    },
    activityOptions: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
        color: '#1A1A1A',
    },
    activityScroll: {
        maxHeight: 300,
    },
    activityOption: {
        backgroundColor: '#f8f9fa',
        padding: 14,
        borderRadius: 10,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    activityOptionText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#1A1A1A',
    },
    backButton: {
        backgroundColor: '#f8f9fa',
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 12,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    backButtonText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#6c757d',
    },
});
