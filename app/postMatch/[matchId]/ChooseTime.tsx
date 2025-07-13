import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getSupabaseWithAuth } from '../../../lib/supabaseWithAuth';
import { parseSlotToISO } from '../../../utils/availability_parser';
import { findOverlapSlots } from '../../../lib/supabaseUtils';
import { LoadingOrError } from '../../components/LoadingOrError';

export default function ChooseTime() {
    const { matchId } = useLocalSearchParams<{ matchId: string }>();
    const router = useRouter();

    const [overlapSlots, setOverlapSlots] = useState<string[]>([]);
    const [otherUserSlots, setOtherUserSlots] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOverlap = async () => {
            try {
                if (!matchId) throw new Error('No matchId');
                const supabase = await getSupabaseWithAuth();
                const { data: userRes, error: userErr } = await supabase.auth.getUser();
                const uid = userRes?.user?.id;
                if (userErr || !uid) throw new Error('Failed to get user');
                const { data: match, error: matchErr } = await supabase
                    .from('matches')
                    .select('user1_id, user2_id')
                    .eq('id', matchId)
                    .single();
                if (matchErr || !match) throw new Error('Could not fetch match');
                const me = uid;
                const them = me === match.user1_id ? match.user2_id : match.user1_id;
                const { data: profiles, error: profilesErr } = await supabase
                    .from('profiles')
                    .select('id, weekly_availability')
                    .in('id', [me, them]);
                if (profilesErr || !profiles) throw new Error('Could not fetch profiles');
                const myProfile = profiles.find((p) => p.id === me);
                const theirProfile = profiles.find((p) => p.id === them);
                const mine: string[] = Array.isArray(myProfile?.weekly_availability)
                    ? myProfile!.weekly_availability
                    : [];
                const theirs: string[] = Array.isArray(theirProfile?.weekly_availability)
                    ? theirProfile!.weekly_availability
                    : [];
                const overlap = findOverlapSlots(mine, theirs);
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
        try {
            const supabase = await getSupabaseWithAuth();
            const { data: userRes, error: userErr } = await supabase.auth.getUser();
            const currentUserId = userRes?.user?.id;

            if (userErr || !currentUserId) {
                throw new Error('Could not get authenticated user');
            }

            const formatted = parseSlotToISO(time);

            const { data, error } = await supabase
                .from('matches')
                .update({
                    proposed_time: formatted,
                    status: 'proposed',
                    proposed_by: currentUserId,
                })
                .eq('id', matchId);

            if (error) {
                console.error('❌ Error updating match:', error.message, error.details);
                setError('Failed to update selected time');
                return;
            }

            console.log('✅ Match updated:', data);
            router.push('/main/Calendar');
        } catch (err: any) {
            console.error('❌ handleSelectTime crash:', err.message);
            setError('Unexpected error occurred');
        }
    };


    return (
        <ScrollView contentContainerStyle={styles.container}>
            <LoadingOrError loading={loading} error={error} />
            {!loading && !error && (
                <>
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
