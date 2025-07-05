import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getSupabaseWithAuth } from '../../../lib/supabaseWithAuth';

export default function ChooseTime() {
    const { matchId } = useLocalSearchParams();
    const router = useRouter();

    const [overlapSlots, setOverlapSlots] = useState<string[]>([]);
    const [otherUserSlots, setOtherUserSlots] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOverlap = async () => {
            try {
                if (!matchId || typeof matchId !== 'string') throw new Error('No matchId');

                const supabase = await getSupabaseWithAuth();
                const { data: userRes, error: userErr } = await supabase.auth.getUser();
                const uid = userRes?.user?.id;
                if (userErr || !uid) throw new Error('Failed to fetch authenticated user');

                const { data: match, error: matchErr } = await supabase
                    .from('matches')
                    .select('user1_id, user2_id')
                    .eq('id', matchId)
                    .single();
                if (matchErr || !match) throw new Error('Could not fetch match');

                const user1 = match.user1_id;
                const user2 = match.user2_id;
                const me = uid;
                const them = me === user1 ? user2 : user1;

                const { data: profiles, error: profilesErr } = await supabase
                    .from('profiles')
                    .select('id, weekly_availability')
                    .in('id', [user1, user2]);
                if (profilesErr || !profiles) throw new Error('Could not fetch profiles');

                const myProfile = profiles.find(p => p.id === me);
                const theirProfile = profiles.find(p => p.id === them);

                const mine: string[] = Array.isArray(myProfile?.weekly_availability)
                    ? myProfile!.weekly_availability
                    : [];
                const theirs: string[] = Array.isArray(theirProfile?.weekly_availability)
                    ? theirProfile!.weekly_availability
                    : [];

                const overlap = mine.filter(slot => theirs.includes(slot));
                setOverlapSlots(overlap);
                setOtherUserSlots(theirs);
            } catch (err: any) {
                console.error('❌ ChooseTime error:', err.message);
                setError('Failed to load availability');
            } finally {
                setLoading(false);
            }
        };

        fetchOverlap();
    }, [matchId]);

    const handleSelectTime = async (time: string) => {
        const supabase = await getSupabaseWithAuth();
        const { error } = await supabase
            .from('matches')
            .update({ proposed_time: time, status: 'proposed' })
            .eq('id', matchId);

        if (error) {
            console.error('❌ Error updating time:', error.message);
            setError('Failed to update selected time');
            return;
        }

        router.push('/main/Calendar');
    };

    if (loading) return <ActivityIndicator style={{ marginTop: 50 }} />;
    if (error) return <Text style={{ color: 'red', marginTop: 50 }}>{error}</Text>;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Pick a time to meet</Text>

            {overlapSlots.length > 0 ? (
                <>
                    <Text style={styles.subtitle}>Mutual availability:</Text>
                    {overlapSlots.map((slot, i) => (
                        <TouchableOpacity key={i} style={styles.slot} onPress={() => handleSelectTime(slot)}>
                            <Text style={styles.slotText}>{slot}</Text>
                        </TouchableOpacity>
                    ))}
                </>
            ) : (
                <>
                    <Text>No overlapping availability 😞</Text>
                    <Text style={{ marginBottom: 10 }}>Pick a time the other person is free:</Text>
                    {otherUserSlots.map((slot, i) => (
                        <TouchableOpacity key={i} style={styles.slot} onPress={() => handleSelectTime(slot)}>
                            <Text style={styles.slotText}>{slot}</Text>
                        </TouchableOpacity>
                    ))}
                </>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 10,
    },
    slot: {
        padding: 14,
        backgroundColor: '#6c63ff',
        borderRadius: 10,
        marginVertical: 8,
        width: '100%',
    },
    slotText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
    },
});
