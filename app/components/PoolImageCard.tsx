import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

interface PoolImageCardProps {
    photo: { url: string };
}

export default function PoolImageCard({ photo }: PoolImageCardProps) {
    return (
        <View style={styles.photoCard}>
            <Image
                source={{ uri: photo.url }}
                style={styles.profilePhoto}
                resizeMode="cover"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    photoCard: {
        backgroundColor: '#fff',
        borderRadius: 18,
        marginHorizontal: 20,
        marginBottom: 28,
        padding: 0,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 3,
    },
    profilePhoto: {
        width: '100%',
        height: 550,
        borderRadius: 18,
        marginBottom: 0,
    },
}); 