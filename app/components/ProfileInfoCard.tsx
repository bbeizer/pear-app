import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Profile } from '../../types';

interface ProfileInfoCardProps {
    profile: Profile;
}

export default function ProfileInfoCard({ profile }: ProfileInfoCardProps) {
    return (
        <View style={styles.profileInfoCard}>
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
}

const styles = StyleSheet.create({
    profileInfoCard: {
        backgroundColor: '#fff',
        borderRadius: 18,
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 3,
    },
    profileNameLarge: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    profileDetails: {
        fontSize: 15,
        color: '#333',
        marginBottom: 8,
        opacity: 0.9,
    },
    profileBio: {
        fontSize: 14,
        color: '#444',
        marginBottom: 12,
        lineHeight: 20,
        opacity: 0.95,
    },
    profileTagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    profileTag: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        fontSize: 12,
        color: '#333',
        fontWeight: '500',
    },
}); 