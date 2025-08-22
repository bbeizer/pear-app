import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHaptics } from '../../lib/hooks/useHaptics';
import { useMatches } from '../../lib/hooks/useMatches';
import MatchCard from '../components/MatchCard';
import VenuePickerModal from '../components/VenuePickerModal';
import { colors } from '../../theme/colors';
import { useRouter } from 'expo-router';

export default function MatchesScreen() {
    const { lightImpact } = useHaptics();
    const matches = useMatches();
    const router = useRouter();
    const [showVenuePicker, setShowVenuePicker] = useState(false);
    const [venuePickerMatchId, setVenuePickerMatchId] = useState<string | null>(null);
    const [venuePickerMidpoint, setVenuePickerMidpoint] = useState<{ latitude: number; longitude: number } | null>(null);

    const handleMatchPress = (match: any) => {
        lightImpact();
        // Navigate to specific match details
        router.push(`/MatchDetails/${match.id}`);
    };

    const handleVenuePress = (match: any) => {
        lightImpact();
        // Calculate midpoint for this specific match
        const midpoint = matches.calculateMidpoint(match);
        if (midpoint) {
            setVenuePickerMatchId(match.id);
            setVenuePickerMidpoint(midpoint);
            setShowVenuePicker(true);
        } else {
            console.error('No midpoint found for match:', match.id);
        }
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

            {/* Venue Picker Modal */}
            {venuePickerMatchId && venuePickerMidpoint && (
                <VenuePickerModal
                    visible={showVenuePicker}
                    onClose={() => {
                        setShowVenuePicker(false);
                        setVenuePickerMatchId(null);
                        setVenuePickerMidpoint(null);
                    }}
                    matchId={venuePickerMatchId}
                    midpoint={venuePickerMidpoint}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
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
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: '#666',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#333',
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
        paddingBottom: 20,
    },
});
