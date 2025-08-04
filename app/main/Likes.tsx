import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useHaptics } from '../../lib/hooks/useHaptics';
import { useLikes } from '../../lib/hooks/useLikes';
import IncomingSwipeCard from '../components/IncomingSwipeCard';

export default function LikesScreen() {
    const { lightImpact, successNotification } = useHaptics();
    const likes = useLikes();

    const handleSwipe = async (liked: boolean) => {
        lightImpact();
        await likes.handleSwipe(liked);
        if (liked) {
            successNotification();
        }
    };

    const handleVideoDeferral = async () => {
        await likes.handleVideoDeferral();
    };

    const handleSkip = () => {
        likes.handleSkip();
    };

    if (likes.loading) {
        return (
            <View style={styles.loadingContainer}>
                <Ionicons name="heart-outline" size={64} color="#ccc" />
                <Text style={styles.loadingText}>Loading likes...</Text>
            </View>
        );
    }

    if (!likes.hasMoreSwipes) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="heart-outline" size={64} color="#ccc" />
                <Text style={styles.emptyTitle}>No More Likes</Text>
                <Text style={styles.emptySubtitle}>
                    You've seen all your incoming likes! Check back later for more.
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Likes</Text>
                <Text style={styles.subtitle}>
                    {likes.incomingSwipes.length} people liked you
                </Text>
            </View>

            {/* Swipe Card */}
            <View style={styles.cardContainer}>
                <IncomingSwipeCard
                    swipe={likes.currentSwipe!}
                    slideAnim={likes.slideAnim}
                />
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.passButton]}
                    onPress={() => handleSwipe(false)}
                    activeOpacity={0.7}
                >
                    <Ionicons name="close" size={32} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.skipButton]}
                    onPress={handleSkip}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-forward" size={24} color="#666" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.likeButton]}
                    onPress={() => handleSwipe(true)}
                    activeOpacity={0.7}
                >
                    <Ionicons name="heart" size={32} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Video Deferral Modal */}
            {likes.showVideoDeferral && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Suggest a Video Call</Text>
                        <Text style={styles.modalSubtitle}>
                            Let them know you'd prefer to video chat first
                        </Text>

                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={handleVideoDeferral}
                        >
                            <Text style={styles.modalButtonText}>Send Video Suggestion</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalCancelButton}
                            onPress={() => likes.setShowVideoDeferral(false)}
                        >
                            <Text style={styles.modalCancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    loadingText: {
        fontSize: 18,
        color: '#666',
        marginTop: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#f8f9fa',
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
        borderColor: colors.primaryGreen,
    },
    skipButton: {
        borderWidth: 2,
        borderColor: '#ccc',
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 24,
        width: '80%',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
    },
    modalButton: {
        backgroundColor: colors.primaryGreen,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    modalCancelButton: {
        marginTop: 16,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    modalCancelText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '500',
    },
});
