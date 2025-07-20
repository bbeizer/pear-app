import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabaseClient';
import type { Match } from '../../types';

interface CalendarMatch extends Match {
    partnerName: string;
}

export default function CalendarScreen() {
    const [dates, setDates] = useState<CalendarMatch[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConfirmedDates = async () => {
            try {
                const { data: userData } = await supabase.auth.getUser();
                if (!userData?.user) {
                    setLoading(false);
                    return;
                }

                const userId = userData.user.id;

                // Get confirmed matches with proposal details
                const { data: matches, error } = await supabase
                    .from('matches')
                    .select(`
                        *,
                        user1_profile:profiles!user1_id(name),
                        user2_profile:profiles!user2_id(name)
                    `)
                    .eq('status', 'scheduled')
                    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
                    .order('created_at', { ascending: true });

                if (error || !matches) {
                    console.error('Error fetching confirmed dates:', error);
                    setLoading(false);
                    return;
                }

                const enriched: CalendarMatch[] = matches.map((match: any) => {
                    const isUser1 = match.user1_id === userId;
                    const user1Profile = match.user1_profile as { name: string };
                    const user2Profile = match.user2_profile as { name: string };

                    const partnerName = isUser1
                        ? user2Profile?.name || match.user2_name || 'Unknown'
                        : user1Profile?.name || match.user1_name || 'Unknown';

                    return { ...match, partnerName };
                });

                setDates(enriched);
            } catch (error) {
                console.error('Error in fetchConfirmedDates:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchConfirmedDates();
    }, []);

    const formatTime = (timeString: string) => {
        try {
            const d = new Date(timeString);
            return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        } catch {
            return 'Unknown time';
        }
    };

    const formatDate = (timeString: string) => {
        try {
            const d = new Date(timeString);
            return d.toLocaleDateString(undefined, {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return 'Unknown date';
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00C48C" />
                <Text style={styles.loadingText}>Loading your dates...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Your Upcoming Dates</Text>
            {dates.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>
                        No confirmed dates yet. Start swiping and proposing times!
                    </Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    {dates.map((match, idx) => (
                        <View key={match.id} style={styles.card}>
                            <Text style={styles.summary}>
                                ✅ You have a{' '}
                                <Text style={match.meeting_type === 'video' ? styles.video : styles.inperson}>
                                    {match.meeting_type === 'video' ? 'video' : 'in-person'}
                                </Text>{' '}
                                date with{' '}
                                <Text style={styles.partnerName}>{match.partnerName}</Text>
                            </Text>
                            {(match.user1_proposed_time || match.user2_proposed_time) && (
                                <>
                                    <Text style={styles.time}>
                                        at <Text style={styles.timeHighlight}>
                                            {(match.user1_proposed_time || match.user2_proposed_time || '').replace(/_/g, ' ')}
                                        </Text>
                                    </Text>
                                </>
                            )}
                            {match.suggested_activity && (
                                <Text style={styles.activity}>💡 {match.suggested_activity}</Text>
                            )}
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 60,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingTop: 60,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    header: {
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 20,
        color: '#1A1A1A',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        lineHeight: 24,
    },
    scrollContainer: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        marginBottom: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 5,
    },
    summary: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
        color: '#1A1A1A',
    },
    partnerName: {
        fontWeight: '600',
        color: '#00C48C',
    },
    time: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    timeHighlight: {
        fontWeight: '600',
        color: '#007AFF',
    },
    date: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    activity: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
    },
    inperson: {
        color: '#00C48C',
        fontWeight: '600',
    },
    video: {
        color: '#007AFF',
        fontWeight: '600',
    },
});
