import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabaseClient';

export default function ChooseMeetType() {
  const { matchId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        setError('Failed to fetch user');
        return;
      }
      setUserId(data.user.id);
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleSelect = async (choice: 'video' | 'in_person') => {
    if (!matchId || !userId) return;

    const { error } = await supabase
      .from('matches')
      .update({
        [`${await getUserMatchKey(userId, matchId as string)}_mode_choice`]: choice,
        status: 'pending',
      })
      .eq('id', matchId);

    if (error) {
      console.error('Error updating choice:', error);
      setError('Could not update selection');
    } else {
      router.push(`/postMatch/${matchId}/ChooseTime`); // proceed
    }
  };

  const getUserMatchKey = async (uid: string, matchId: string) => {
    const { data, error } = await supabase.from('matches').select('user1_id, user2_id').eq('id', matchId).single();
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

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 22,
    marginBottom: 32,
    fontWeight: '600',
  },
  button: {
    padding: 16,
    backgroundColor: '#6c63ff',
    borderRadius: 10,
    marginVertical: 10,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  error: {
    marginTop: 20,
    color: 'red',
  },
});
