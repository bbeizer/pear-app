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

interface GroupedDates {
    [dateKey: string]: CalendarMatch[];
}

export default function CalendarScreen() {
    const [dates, setDates] = useState<CalendarMatch[]>([]);
    const [groupedDates, setGroupedDates] = useState<GroupedDates>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchConfirmedDates();
    }, []);

    const formatDateKey = (timeString: string) => {
        // Convert "Tomorrow_7:00_PM" to "Tomorrow"
        // Convert "Dec_15_2024_7:00_PM" to "Dec 15, 2024"
        return timeString.split('_')[0];
    };

    const formatDateHeader = (timeString: string) => {
        const parts = timeString.split('_');
        if (parts[0] === 'Tomorrow') {
            return 'Tomorrow';
        } else if (parts[0] === 'Today') {
            return 'Today';
        } else if (parts.length >= 3) {
            // Format as "Dec 15, 2024" or similar
            const month = parts[0];
            const day = parts[1];
            const year = parts[2] || new Date().getFullYear();
            return `${month} ${day}, ${year}`;
        }
        return timeString.replace(/_/g, ' ');
    };

    const groupDatesByDay = (dates: CalendarMatch[]) => {
        const grouped: GroupedDates = {};

        dates.forEach(match => {
            const timeString = match.user1_proposed_time || match.user2_proposed_time || '';
            const dateKey = formatDateKey(timeString);

            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(match);
        });

        // Sort dates within each group by time
        Object.keys(grouped).forEach(dateKey => {
            grouped[dateKey].sort((a, b) => {
                const timeA = a.user1_proposed_time || a.user2_proposed_time || '';
                const timeB = b.user1_proposed_time || b.user2_proposed_time || '';
                return timeA.localeCompare(timeB);
            });
        });

        return grouped;
    };

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
            setGroupedDates(groupDatesByDay(confirmedDates));
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
                    {Object.keys(groupedDates).map((dateKey) => {
                        const dateMatches = groupedDates[dateKey];
                        const firstMatch = dateMatches[0];
                        const timeString = firstMatch.user1_proposed_time || firstMatch.user2_proposed_time || '';
                        const dateHeader = formatDateHeader(timeString);

                        return (
                            <View key={dateKey} style={styles.dateSection}>
                                {/* Date Header in Black Font */}
                                <Text style={styles.dateHeader}>{dateHeader}</Text>

                                {/* Date Cards for this day */}
                                {dateMatches.map((match) => (
                                    <DateCard key={match.id} match={match} />
                                ))}
                            </View>
                        );
                    })}
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
    dateSection: {
        marginBottom: 24,
    },
    dateHeader: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
        marginBottom: 12,
        marginTop: 8,
    },
});
