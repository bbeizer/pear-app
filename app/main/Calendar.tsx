import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { getSupabaseWithAuth } from '../../lib/supabaseWithAuth';
import { MatchWithProfiles } from '../../types';

export default function CalendarScreen() {
    const [dates, setDates] = useState<MatchWithProfiles[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConfirmedDates = async () => {
            const supabase = await getSupabaseWithAuth();

            const [{ data: userData }, { data: matches, error }] = await Promise.all([
                supabase.auth.getUser(),
                supabase
                    .from('matches')
                    .select(`
            id,
            confirmed_mode,
            confirmed_at,
            user1_id,
            user2_id,
            user1_profile:profiles!user1_id(name),
            user2_profile:profiles!user2_id(name)
          `)
                    .eq('status', 'confirmed')
                    .order('confirmed_at', { ascending: true }),
            ]);

            if (!userData?.user || !matches || error) {
                setLoading(false);
                return;
            }

            const uid = userData.user.id;

            const enriched: MatchWithProfiles[] = matches.map((match: any) => {
                const isUser1 = match.user1_id === uid;

                const user1Profile = match.user1_profile as { name: string };
                const user2Profile = match.user2_profile as { name: string };

                const partnerName = isUser1
                    ? user2Profile?.name || 'Unknown'
                    : user1Profile?.name || 'Unknown';

                return { ...match, partnerName };
            });

            setDates(enriched);
            setLoading(false);
        };

        fetchConfirmedDates();
    }, []);

    const formatTime = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleDateString(undefined, {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (loading) return <ActivityIndicator style={{ marginTop: 50 }} />;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>Your Upcoming Dates</Text>
            {dates.map((match, idx) => (
                <View key={idx} style={styles.card}>
                    <Text style={styles.summary}>
                        ✅ You have a{' '}
                        <Text style={match.confirmed_mode === 'video' ? styles.video : styles.inperson}>
                            {match.confirmed_mode}
                        </Text>{' '}
                        date with{' '}
                        <Text style={{ fontWeight: '600' }}>{match.partnerName}</Text> at{' '}
                        <Text style={{ fontWeight: '600' }}>{formatTime(match.confirmed_at)}</Text>
                    </Text>
                    <Text style={styles.date}>{formatDate(match.confirmed_at)}</Text>
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        alignItems: 'center',
    },
    header: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    summary: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 6,
    },
    date: {
        fontSize: 14,
        color: '#555',
    },
    video: {
        color: '#6c63ff',
    },
    inperson: {
        color: '#00aa77',
    },
});
