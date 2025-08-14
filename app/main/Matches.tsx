
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHaptics } from '../../lib/hooks/useHaptics';
import { useMatches } from '../../lib/hooks/useMatches';
import { useVenuePicker } from '../../lib/stores/venuePicker';
import MatchModal from '../components/MatchModal';
import MatchCard from '../components/MatchCard';
import VenueSuggestionModal from '../components/VenueSuggestionModal';
import { colors } from '../../theme/colors';

export default function MatchesScreen() {
    const { lightImpact } = useHaptics();
    const matches = useMatches();
    const { activeMatchId, selectedVenue, clear } = useVenuePicker();

    // Listen for confirmed venue from the store
    useEffect(() => {
        if (selectedVenue && activeMatchId && matches.selectedMatch?.id === activeMatchId) {
            matches.handleVenueSuggest(selectedVenue);
            clear();
        }
    }, [selectedVenue, activeMatchId, matches.selectedMatch?.id, matches.handleVenueSuggest, clear]);

    const handleMatchPress = (match: any) => {
        lightImpact();
        matches.handleMatchPress(match);
    };

    const handleVenuePress = (match: any) => {
        lightImpact();
        matches.handleVenuePress(match);
    };

    const renderMatch = ({ item }: { item: any }) => (
        <MatchCard
            match={item}
            onPress={() => handleMatchPress(item)}
            onVenuePress={() => handleVenuePress(item)}
        />
    );

    if (matches.loading) {
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
                    {matches.matches.length === 0
                        ? "No matches yet. Keep swiping!"
                        : `${matches.matches.length} match${matches.matches.length !== 1 ? 'es' : ''}`}
                </Text>
            </View>

            {/* Matches List */}
            {matches.matches.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="sparkles-outline" size={64} color="#ccc" />
                    <Text style={styles.emptyTitle}>No Matches Yet</Text>
                    <Text style={styles.emptySubtitle}>
                        When you and someone else like each other, you'll have a match here!
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={matches.matches}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMatch}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContainer}
                />
            )}

            {/* Match Modal */}
            {matches.selectedMatch && (
                <MatchModal
                    match={matches.selectedMatch}
                    visible={matches.modalVisible}
                    onClose={matches.handleCloseModal}
                    onMatchUpdate={matches.handleMatchUpdate}
                />
            )}

            {/* Venue Suggestion Modal */}
            {matches.selectedMatch && (
                <VenueSuggestionModal
                    visible={matches.venueModalVisible}
                    onClose={matches.handleCloseVenueModal}
                    suggestedVenue={matches.suggestedVenue}
                    midpoint={matches.calculateMidpoint(matches.selectedMatch)}
                    onVenueAccept={matches.handleVenueAccept}
                    onVenueSuggest={matches.handleVenueSuggest}
                    matchName={matches.selectedMatch.other_user_profile?.name || 'Your Match'}
                    matchId={matches.selectedMatch.id}
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