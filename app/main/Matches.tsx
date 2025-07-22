
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { supabase } from '../../lib/supabaseClient';
import { Ionicons } from '@expo/vector-icons';
import type { Match } from '../../types';
import { useHaptics } from '../../lib/hooks/useHaptics';
import { fetchUserMatches } from '../../lib/supabaseUtils';
import MatchModal from '../components/MatchModal';
import MatchCard from '../components/MatchCard';
import { colors } from '../../theme/colors';

export default function MatchesScreen() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const { lightImpact } = useHaptics();

    useEffect(() => {
        fetchMatches();
    }, []);

    const fetchMatches = async () => {
        try {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData?.user) return;

            const userId = userData.user.id;
            const userMatches = await fetchUserMatches(userId);

            // Get profiles for the other users in each match
            const matchesWithProfiles = await Promise.all(
                userMatches.map(async (match) => {
                    const otherUserId = match.user1_id === userId ? match.user2_id : match.user1_id;

                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', otherUserId)
                        .single();

                    return {
                        ...match,
                        other_user_profile: profile
                    };
                })
            );

            setMatches(matchesWithProfiles);
        } catch (error) {
            console.error('Error fetching matches:', error);
            Alert.alert('Error', 'Failed to load matches. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleMatchPress = (match: Match) => {
        lightImpact();
        setSelectedMatch(match);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedMatch(null);
    };

    const handleMatchUpdate = () => {
        fetchMatches();
    };

    const renderMatch = ({ item }: { item: Match }) => (
        <MatchCard
            match={item}
            onPress={() => handleMatchPress(item)}
        />
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Loading matches...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Matches</Text>
                <Text style={styles.subtitle}>
                    {matches.length === 0
                        ? "No matches yet. Keep swiping!"
                        : `${matches.length} match${matches.length !== 1 ? 'es' : ''}`}
                </Text>
            </View>

            {/* Matches List */}
            {matches.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="sparkles-outline" size={64} color="#ccc" />
                    <Text style={styles.emptyTitle}>No Matches Yet</Text>
                    <Text style={styles.emptySubtitle}>
                        When you and someone else like each other, you'll have a match here!
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={matches}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMatch}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContainer}
                />
            )}

            {/* Match Modal */}
            {selectedMatch && (
                <MatchModal
                    match={selectedMatch}
                    visible={modalVisible}
                    onClose={handleCloseModal}
                    onMatchUpdate={handleMatchUpdate}
                />
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
        lineHeight: 24,
    },
    listContainer: {
        paddingTop: 20,
        paddingBottom: 20,
    },
}); 