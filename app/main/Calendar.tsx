import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { supabase } from '../../lib/supabaseClient';
import { Ionicons } from '@expo/vector-icons';
import type { Match } from '../../types';
import { fetchUserMatches } from '../../lib/supabaseUtils';
import DateCard from '../components/DateCard';
import { colors } from '../../theme/colors';

interface CalendarMatch extends Match {
    partnerName: string;
}

export default function CalendarScreen() {
    const [dates, setDates] = useState<CalendarMatch[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchConfirmedDates();
    }, []);

    const fetchConfirmedDates = async () => {
        try {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData?.user) return;

            const userId = userData.user.id;
            const userMatches = await fetchUserMatches(userId);

            // Filter for scheduled matches and get partner names
            const confirmedDates = await Promise.all(
                userMatches
                    .filter(match => match.status === 'scheduled')
                    .map(async (match) => {
                        const otherUserId = match.user1_id === userId ? match.user2_id : match.user1_id;

                        const { data: partnerProfile } = await supabase
                            .from('profiles')
                            .select('name')
                            .eq('id', otherUserId)
                            .single();

                        return {
                            ...match,
                            partnerName: partnerProfile?.name || 'Unknown'
                        };
                    })
            );

            setDates(confirmedDates);
        } catch (error) {
            console.error('Error fetching confirmed dates:', error);
            Alert.alert('Error', 'Failed to load your dates. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Ionicons name="calendar-outline" size={64} color="#ccc" />
                <Text style={styles.loadingText}>Loading your dates...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Your Upcoming Dates</Text>
                <Text style={styles.subtitle}>
                    {dates.length === 0
                        ? "No confirmed dates yet"
                        : `${dates.length} date${dates.length !== 1 ? 's' : ''} scheduled`}
                </Text>
            </View>

            {/* Dates List */}
            {dates.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="calendar-outline" size={64} color="#ccc" />
                    <Text style={styles.emptyTitle}>No Dates Scheduled</Text>
                    <Text style={styles.emptySubtitle}>
                        Start swiping and proposing times to see your dates here!
                    </Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {dates.map((match) => (
                        <DateCard key={match.id} match={match} />
                    ))}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
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
    scrollContainer: {
        padding: 20,
        paddingBottom: 40,
    },
});
