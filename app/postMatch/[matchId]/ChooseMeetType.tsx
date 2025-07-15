import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getSupabaseWithAuth } from '../../../lib/supabaseWithAuth';

export default function ChooseMeetType() {
  const { matchId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const authedSupabase = await getSupabaseWithAuth();
        const { data, error } = await authedSupabase.auth.getUser();

        if (error || !data?.user) {
          setError('Failed to fetch user');
          return;
        }

        setUserId(data.user.id);
      } catch (err) {
        console.error('Auth error:', err);
        setError('Unexpected error during auth');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleSelect = async (choice: 'video' | 'in_person') => {
    if (!matchId || !userId) return;

    const authedSupabase = await getSupabaseWithAuth();
    const matchKey = await getUserMatchKey(userId, matchId as string);

    const { error } = await authedSupabase
      .from('matches')
      .update({
        [`${matchKey}_mode_choice`]: choice,
        status: 'pending',
      })
      .eq('id', matchId);

    if (error) {
      console.error('Error updating choice:', error);
      setError('Could not update selection');
    } else {
      router.push(`/postMatch/${matchId}/ChooseTime`);
    }
  };

  const getUserMatchKey = async (uid: string, matchId: string) => {
    const authedSupabase = await getSupabaseWithAuth();
    const { data, error } = await authedSupabase
      .from('matches')
      .select('user1_id, user2_id')
      .eq('id', matchId)
      .single();

    if (error || !data) return 'user1';
    return data.user1_id === uid ? 'user1' : 'user2';
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How would you like to meet?</Text>

      <TouchableOpacity style={styles.button} onPress={() => handleSelect('video')}>
        <Text style={styles.buttonText}>Video Call (Recommended)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => handleSelect('in_person')}>
        <Text style={styles.buttonText}>In Person</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.back()} style={{ position: 'absolute', top: 50, left: 20 }}>
        <Text style={{ fontSize: 16, color: 'blue' }}>{'<'} Back</Text>
      </TouchableOpacity>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#6c63ff',
    borderRadius: 10,
    marginVertical: 10,
    padding: 16,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  error: {
    color: 'red',
    marginTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 32,
  },
});
