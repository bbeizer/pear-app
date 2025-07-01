import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabaseClient';

export default function ChooseTime() {
    const { matchId } = useLocalSearchParams();
    const router = useRouter();
    const [overlapSlots, setOverlapSlots] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOverlap = async () => {
            const { data: match, error: matchErr } = await supabase
                .from('matches')
                .select('user1_id, user2_id')
                .eq('id', matchId)
                .single();

            if (matchErr || !match) return;

            const { data: avail1 } = await supabase
                .from('availability')
                .select('time_slot')
                .eq('user_id', match.user1_id);

            const { data: avail2 } = await supabase
                .from('availability')
                .select('time_slot')
                .eq('user_id', match.user2_id);

            const user1Slots = avail1?.map((a) => a.time_slot) || [];
            const user2Slots = avail2?.map((a) => a.time_slot) || [];

            const overlap = user1Slots.filter((slot) => user2Slots.includes(slot));
            setOverlapSlots(overlap);
            setLoading(false);
        };

        fetchOverlap();
    }, []);

    const handleTimeSelect = async (time: string) => {
        const { error } = await supabase
            .from('matches')
            .update({ scheduled_time: time, status: 'confirmed' })
            .eq('id', matchId);

        if (!error) router.push('/main/Calander');
    };

    if (loading) return <ActivityIndicator style={{ marginTop: 50 }} />;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Select a Time That Works</Text>
            {overlapSlots.length === 0 ? (
                <Text>No overlapping availability. Try again later.</Text>
            ) : (
                overlapSlots.map((slot, idx) => (
                    <TouchableOpacity key={idx} style={styles.slot} onPress={() => handleTimeSelect(slot)}>
                        <Text style={styles.slotText}>{slot}</Text>
                    </TouchableOpacity>
                ))
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    title: {
        fontSize: 22,
        marginBottom: 20,
        fontWeight: '600',
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
        fontSize: 18,
        textAlign: 'center',
    },
});