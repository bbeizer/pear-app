import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabaseClient';
import { Session } from '@supabase/supabase-js';

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

            const userId = userData.user.id;

            const { data, error } = await supabase
                .from('matches')
                .select('*')
                .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

            if (error) console.error(error);
            else setMatches(data);
        };

        fetchMatches();
    }, []);

    const renderItem = ({ item }: { item: any }) => {
        const partnerId = userId === item.user1_id ? item.user2_id : item.user1_id;
        const myKey = userId === item.user1_id ? 'user1' : 'user2';
        const theirKey = userId === item.user1_id ? 'user2' : 'user1';

        const myModeChoice = item[`${myKey}_mode_choice`];
        const theirModeChoice = item[`${theirKey}_mode_choice`];

        let nextStep = '';
        if (!myModeChoice) {
            nextStep = 'ChooseMeetType';
        } else if (!item.proposed_time && myModeChoice === 'video') {
            nextStep = 'ChooseTime';
        } else if (item.proposed_time && item.status === 'proposed') {
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
                <Text style={styles.name}>Match with {partnerId}</Text>
                <Text>Status: {item.status}</Text>
                {nextStep ? (
                    <Text style={{ color: '#6c63ff', marginTop: 5 }}>
                        Continue: {nextStep.replace(/([A-Z])/g, ' $1')}
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
    container: { flex: 1, padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    card: {
        padding: 16,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        marginBottom: 12,
    },
    name: { fontSize: 18, fontWeight: '600' },
});
