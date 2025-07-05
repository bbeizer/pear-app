import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { supabase } from 'lib/supabaseClient';
import { getSupabaseWithAuth } from 'lib/supabaseWithAuth';
import { useRouter } from 'expo-router';

export default function Pool() {
    const [profiles, setProfiles] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userId, setUserId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUserAndProfiles = async () => {
            const { data: userData, error: userError } = await supabase.auth.getUser();
            console.log('Current user ID:', userData?.user?.id);

            if (userError || !userData?.user) {
                Alert.alert('Error', 'Failed to load user');
                return;
            }

            const currentId = userData.user.id;
            setUserId(currentId);

            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .neq('id', currentId);

            if (profileError) {
                Alert.alert('Error', 'Failed to load profiles');
                return;
            }

            setProfiles(profileData);
        };

        fetchUserAndProfiles();
    }, []);

    const handleSwipe = async (liked: boolean) => {
        const target = profiles[currentIndex];
        if (!userId || !target) return;

        console.log('🫱 Swiping on:', target.id);
        console.log('👍 Liked:', liked);

        const session = await supabase.auth.getSession();
        const uid = session.data.session?.user?.id;
        const token = session.data.session?.access_token;

        if (!uid || !token) {
            console.error('❌ No valid session or token');
            return;
        }

        const authedSupabase = await getSupabaseWithAuth();

        const { data: swipeData, error: swipeError } = await authedSupabase
            .from('swipes')
            .insert({ swiper_id: uid, swipee_id: target.id, liked })
            .select();

        if (swipeError) {
            console.error('❌ Swipe insert error:', swipeError);
            return;
        }

        console.log('✅ Swipe inserted:', swipeData);

        if (liked) {
            const { data: match, error: matchError } = await authedSupabase
                .from('matches')
                .select('*')
                .or(`and(user1_id.eq.${uid},user2_id.eq.${target.id}),and(user1_id.eq.${target.id},user2_id.eq.${uid})`)
                .maybeSingle();

            if (match) {
                console.log('🎉 Redirecting to match flow:', match.id);
                router.push(`postMatch/${match.id}/ChooseMeetType`);
            } else {
                console.log('🙅 No match found (yet)');
            }

            if (matchError) {
                console.log('🧯 Match fetch error:', matchError);
            }
        }

        setCurrentIndex((prev) => prev + 1);
    };

    const currentProfile = profiles[currentIndex];

    if (!currentProfile) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>No more users 😴</Text>
                <Text>{profiles.length}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Discovery Pool</Text>
            <View style={styles.card}>
                <Text style={styles.cardText}>{currentProfile.name}</Text>
                <Text style={styles.cardSub}>{currentProfile.bio}</Text>
            </View>
            <View style={styles.actions}>
                <Button title="No ❌" onPress={() => handleSwipe(false)} />
                <Button title="Yes ✅" onPress={() => handleSwipe(true)} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    card: {
        width: '90%',
        height: 400,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#f9f9f9',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        padding: 16,
    },
    cardText: {
        fontSize: 22,
        fontWeight: '600',
    },
    cardSub: {
        fontSize: 16,
        color: '#666',
        marginTop: 10,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
    },
});
