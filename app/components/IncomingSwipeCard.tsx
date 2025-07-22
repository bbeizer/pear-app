import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    Animated,
    Dimensions,
} from 'react-native';
import type { Profile } from '../../types';

const { width: screenWidth } = Dimensions.get('window');

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

interface IncomingSwipeCardProps {
    swipe: IncomingSwipe;
    slideAnim: Animated.Value;
}

export default function IncomingSwipeCard({ swipe, slideAnim }: IncomingSwipeCardProps) {
    const profile = swipe.swiper_profile;
    const photos = profile?.photos || [];
    const primaryPhoto = photos.find(p => p.is_primary) || photos[0];

    return (
        <Animated.View
            style={[
                styles.card,
                {
                    transform: [{ translateX: slideAnim }],
                },
            ]}
        >
            {/* Profile Photo */}
            {primaryPhoto ? (
                <Image
                    source={{ uri: primaryPhoto.url }}
                    style={styles.profileImage}
                    resizeMode="cover"
                />
            ) : (
                <View style={styles.placeholderImage}>
                    <Text style={styles.placeholderText}>No Photo</Text>
                </View>
            )}

            {/* Profile Info Overlay */}
            <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{profile?.name}</Text>
                <Text style={styles.profileDetails}>
                    {profile?.age} • {profile?.gender} • {profile?.height}
                </Text>
                {profile?.bio && (
                    <Text style={styles.profileBio} numberOfLines={3}>
                        {profile.bio}
                    </Text>
                )}

                {/* Meeting Suggestion */}
                {swipe.suggested_meeting_type && (
                    <View style={styles.meetingSuggestion}>
                        <Text style={styles.meetingLabel}>
                            Suggested: {swipe.suggested_meeting_type === 'video' ? 'Video Call' : 'In Person'}
                        </Text>
                        {swipe.suggested_activity && (
                            <Text style={styles.activityText}>{swipe.suggested_activity}</Text>
                        )}
                        {swipe.suggested_venue && (
                            <Text style={styles.venueText}>📍 {swipe.suggested_venue}</Text>
                        )}
                    </View>
                )}

                {/* Profile Tags */}
                <View style={styles.profileTags}>
                    {profile?.religion && profile.religion !== 'None' && (
                        <Text style={styles.tag}>{profile.religion}</Text>
                    )}
                    {profile?.politics && (
                        <Text style={styles.tag}>{profile.politics}</Text>
                    )}
                    {profile?.city && profile.state && (
                        <Text style={styles.tag}>📍 {profile.city}, {profile.state}</Text>
                    )}
                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: screenWidth - 40,
        height: screenWidth * 1.3,
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 18,
        color: '#999',
    },
    profileInfo: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    profileName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 4,
    },
    profileDetails: {
        fontSize: 16,
        color: '#fff',
        opacity: 0.9,
        marginBottom: 8,
    },
    profileBio: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.8,
        marginBottom: 12,
        lineHeight: 20,
    },
    meetingSuggestion: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    meetingLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    activityText: {
        fontSize: 13,
        color: '#fff',
        opacity: 0.9,
    },
    venueText: {
        fontSize: 13,
        color: '#fff',
        opacity: 0.9,
        marginTop: 2,
    },
    profileTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        fontSize: 12,
        color: '#fff',
        fontWeight: '500',
    },
    likeIndicator: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    likeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FF6B6B',
    },
}); 