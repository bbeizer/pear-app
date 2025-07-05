import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getSupabaseWithAuth } from '../../../lib/supabaseWithAuth';

export default function ConfirmDate() {
  const { matchId } = useLocalSearchParams();
  const router = useRouter();
  const [time, setTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTime = async () => {
      const supabase = await getSupabaseWithAuth();
      const { data, error } = await supabase
        .from('matches')
        .select('proposed_time')
        .eq('id', matchId)
        .single();

      if (!error && data?.proposed_time) {
        setTime(data.proposed_time);
      }

      setLoading(false);
    };

    fetchTime();
  }, []);

  const handleConfirm = async () => {
    const supabase = await getSupabaseWithAuth();
    const { error } = await supabase
      .from('matches')
      .update({ status: 'confirmed' })
      .eq('id', matchId);

    if (!error) router.push('/main/Calendar');
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Confirm Your Date</Text>
      {time ? <Text style={styles.time}>{time}</Text> : <Text>No proposed time</Text>}

      <Button title="Confirm" onPress={handleConfirm} />
      <Button title="Change Time" onPress={() => router.push(`/postMatch/${matchId}/ChooseTime`)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  header: { fontSize: 22, fontWeight: '600', marginBottom: 20 },
  time: { fontSize: 18, marginBottom: 30 },
});
