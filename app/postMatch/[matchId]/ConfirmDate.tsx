import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getSupabaseWithAuth } from '../../../lib/supabaseWithAuth';

export default function ConfirmDate() {
  const { matchId } = useLocalSearchParams();
  const router = useRouter();
  const [time, setTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [canConfirm, setCanConfirm] = useState(false);

  useEffect(() => {
    const fetchTimeAndOwnership = async () => {
      const supabase = await getSupabaseWithAuth();

      const [{ data: userRes }, { data: matchData, error }] = await Promise.all([
        supabase.auth.getUser(),
        supabase
          .from('matches')
          .select('proposed_time, user1_id, user2_id, proposed_by')
          .eq('id', matchId)
          .single()
      ]);

      if (!userRes?.user || error || !matchData?.proposed_time) {
        setError('Failed to load match');
        setLoading(false);
        return;
      }

      const currentUserId = userRes.user.id;

      // ❗Disallow if this user is the one who proposed the time
      const proposerId = currentUserId === matchData.user1_id
        ? matchData.user1_id
        : matchData.user2_id;

      setTime(matchData.proposed_time);
      setCanConfirm(currentUserId !== matchData.proposed_by);
      setLoading(false);
    };

    fetchTimeAndOwnership();
  }, []);

  const handleConfirm = async () => {
    const supabase = await getSupabaseWithAuth();

    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    const uid = userRes?.user?.id;
    if (userErr || !uid) return;

    // Fetch the match to determine user1/user2 and their mode
    const { data: match, error: matchErr } = await supabase
      .from('matches')
      .select('user1_id, user2_id, user1_mode_choice, user2_mode_choice')
      .eq('id', matchId)
      .single();

    if (matchErr || !match) return;

    const myMode =
      uid === match.user1_id ? match.user1_mode_choice : match.user2_mode_choice;
    console.log("My Mode: ", myMode)
    const { error } = await supabase
      .from('matches')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
        confirmed_mode: myMode,
      })
      .eq('id', matchId);
    console.log(error)

    if (!error) router.push('/main/Calendar');
  };


  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} />;

  return (
    <View style={styles.container}>
      {canConfirm ? (
        <Button title="Confirm" onPress={handleConfirm} />
      ) : (
        <Text style={{ color: 'gray', marginBottom: 20 }}>
          Waiting for the other person to confirm this time
        </Text>
      )}
      <Button title="Change Time" onPress={() => router.push(`/postMatch/${matchId}/ChooseTime`)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  header: { fontSize: 22, fontWeight: '600', marginBottom: 20 },
  time: { fontSize: 18, marginBottom: 30 },
});
function setError(arg0: string) {
  throw new Error('Function not implemented.');
}

