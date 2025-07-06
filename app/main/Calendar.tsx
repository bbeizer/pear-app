// File: app/main/Calendar.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, SectionList, StyleSheet, ActivityIndicator } from 'react-native';
import { getSupabaseWithAuth } from '../../lib/supabaseWithAuth';

export default function CalendarScreen() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            const supabase = await getSupabaseWithAuth();
            const { data: userData } = await supabase.auth.getUser();
            const userId = userData.user?.id;

            const { data: matches, error } = await supabase
                .from('matches')
                .select('id, user1_id, user2_id, proposed_time, status, user1_mode_choice, user2_mode_choice')
                .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

            if (error) {
                console.error('Error fetching matches:', error);
                setLoading(false);
                return;
            }

            const grouped = matches?.reduce((acc: any, match: any) => {
                const dateKey = new Date(match.proposed_time).toDateString();
                if (!acc[dateKey]) acc[dateKey] = [];
                acc[dateKey].push(match);
                return acc;
            }, {});

            const sections = Object.entries(grouped || {}).map(([title, data]: any) => ({
                title,
                data,
            }));

            setEvents(sections);
            setLoading(false);
        };

        fetchEvents();
    }, []);

    if (loading) return <ActivityIndicator style={{ marginTop: 50 }} />;

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Your Upcoming Dates</Text>
            <SectionList
                sections={events}
                keyExtractor={(item) => item.id}
                renderSectionHeader={({ section: { title } }) => (
                    <Text style={styles.sectionHeader}>{title}</Text>
                )}
                renderItem={({ item }) => (
                    <View style={styles.eventCard}>
                        <Text style={styles.time}>{new Date(item.proposed_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                        <Text style={styles.status}>Status: {item.status}</Text>
                        <Text style={styles.mode}>Mode: {item.user1_mode_choice || item.user2_mode_choice || 'TBD'}</Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#fff' },
    header: { fontSize: 24, fontWeight: '600', marginBottom: 16, textAlign: 'center' },
    sectionHeader: { fontSize: 18, fontWeight: 'bold', marginTop: 16 },
    eventCard: {
        padding: 12,
        backgroundColor: '#f2f2f2',
        borderRadius: 10,
        marginTop: 8,
    },
    time: { fontSize: 16, fontWeight: '500' },
    status: { fontSize: 14, marginTop: 4 },
    mode: { fontSize: 14, marginTop: 2, fontStyle: 'italic' },
});
