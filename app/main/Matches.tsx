import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function MatchesScreen() {
    const [matches, setMatches] = useState<any[]>([]);
    const router = useRouter();
    const [userId, setUserId] = useState<string | null>(null)
    useEffect(() => {
        const fetchMatches = async () => {
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError || !userData?.user) {
                console.error('No user session found');
                return;
            }

            const currentId = userData.user.id;
            setUserId(currentId);

            const { data: matches, error } = await supabase
                .from('matches')
                .select('*')
                .or(`user1_id.eq.${currentId},user2_id.eq.${currentId}`);

            if (error || !matches) {
                console.error('Error fetching matches:', error);
                return;
            }

            const partnerIds = matches.map(m =>
                m.user1_id === currentId ? m.user2_id : m.user1_id
            );

            const { data: partnerProfiles, error: profileErr } = await supabase
                .from('profiles')
                .select('id, name')
                .in('id', partnerIds);

            if (profileErr || !partnerProfiles) {
                console.error('Error fetching partner names:', profileErr);
                return;
            }

            const nameMap = Object.fromEntries(partnerProfiles.map(p => [p.id, p.name]));

            // attach name to each match
            const enrichedMatches = matches.map(m => {
                const partnerId = m.user1_id === currentId ? m.user2_id : m.user1_id;
                return { ...m, partnerName: nameMap[partnerId] || 'Unknown' };
            });

            setMatches(enrichedMatches);
        };

        fetchMatches();
    }, []);

    const renderItem = ({ item }: { item: any }) => {
        const partnerId = userId === item.user1_id ? item.user2_id : item.user1_id;
        const partnerName = item.user
        const myKey = userId === item.user1_id ? 'user1' : 'user2';
        const theirKey = userId === item.user1_id ? 'user2' : 'user1';

        const myModeChoice = item[`${myKey}_mode_choice`];
        const theirModeChoice = item[`${theirKey}_mode_choice`];

        let nextStep = '';
        if (!myModeChoice) {
            nextStep = 'ChooseMeetType';
        } else if (!item.proposed_time && myModeChoice === 'video') {
            nextStep = 'ChooseTime';
        } else if (
            item.proposed_time &&
            item.status === 'proposed' &&
            item.proposed_by !== userId
        ) {
            nextStep = 'ConfirmDate';
        } else {
            nextStep = ''; // fully confirmed or fallback
        }

        const handlePress = () => {
            if (nextStep) {
                router.push(`/postMatch/${item.id}/${nextStep}`);
            }
        };

        return (
            <TouchableOpacity style={styles.card} onPress={handlePress} disabled={!nextStep}>
                <Text style={styles.name}>Match with {item.partnerName}</Text>
                <Text>Status: {item.status}</Text>
                {nextStep ? (
                    <Text style={{ color: '#6c63ff', marginTop: 5 }}>
                        {nextStep === 'ConfirmDate'
                            ? 'Time proposed — tap to confirm'
                            : `Continue: ${nextStep.replace(/([A-Z])/g, ' $1')}`}
                    </Text>
                ) : (
                    <Text style={{ color: 'gray', marginTop: 5 }}>No action needed</Text>
                )}
            </TouchableOpacity>
        );
    };



    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Matches</Text>
            <FlatList
                data={matches}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderColor: '#ccc',
        borderRadius: 10,
        borderWidth: 1,
        marginBottom: 12,
        padding: 16,
    },
    container: { flex: 1, padding: 20 },
    name: { fontSize: 18, fontWeight: '600' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
});
