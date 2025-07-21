import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
} from 'react-native';
import type { Profile } from '../../types';

interface SwipeCardProps {
    profile: Profile;
}

export default function SwipeCard({ profile }: SwipeCardProps) {
    const photos = profile.photos ?? [];
    const prompts: any[] = []; // TODO: Add prompts when available

    const interleaved: React.ReactNode[] = [];

    // Profile info card at the top
    interleaved.push(
        <View key="profile-info-card" style={styles.profileInfoCard}>
            <Text style={styles.profileNameLarge}>{profile.name}</Text>
            <Text style={styles.profileDetails}>
                {profile.age} • {profile.gender} • {profile.height}
            </Text>
            {!!profile.bio && (
                <Text style={styles.profileBio}>{profile.bio}</Text>
            )}
            <View style={styles.profileTagsRow}>
                {profile.religion && profile.religion !== 'None' && (
                    <Text style={styles.profileTag}>{profile.religion}</Text>
                )}
                {profile.politics && (
                    <Text style={styles.profileTag}>{profile.politics}</Text>
                )}
                {profile.city && profile.state && (
                    <Text style={styles.profileTag}>📍 {profile.city}, {profile.state}</Text>
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
        <ScrollView
            style={styles.cardsList}
            contentContainerStyle={{ paddingBottom: 160 }}
            showsVerticalScrollIndicator={false}
        >
            {interleaved}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    cardsList: {
        flex: 1,
    },
    profileInfoCard: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 20,
        margin: 20,
        borderRadius: 15,
        position: 'absolute',
        bottom: 200,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    profileNameLarge: {
        fontSize: 28,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 4,
    },
    profileDetails: {
        fontSize: 16,
        color: '#fff',
        marginBottom: 8,
        opacity: 0.9,
    },
    profileBio: {
        fontSize: 14,
        color: '#fff',
        marginBottom: 12,
        lineHeight: 20,
        opacity: 0.8,
    },
    profileTagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    profileTag: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        fontSize: 12,
        color: '#fff',
        fontWeight: '500',
    },
    fullScreenPhoto: {
        width: '100%',
        height: 600,
    },
    promptCard: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 20,
        margin: 20,
        borderRadius: 15,
    },
    promptQuestion: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 8,
    },
    promptAnswer: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
        lineHeight: 20,
    },
}); 