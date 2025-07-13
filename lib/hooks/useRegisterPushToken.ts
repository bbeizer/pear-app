import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { supabase } from '../supabaseClient';
import { Alert } from 'react-native';

export function useRegisterPushToken(userId?: string | null) {
  useEffect(() => {
    if (!userId) return;
    const register = async () => {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        Alert.alert('Permission denied', 'Unable to get push token');
        return;
      }
      const tokenRes = await Notifications.getExpoPushTokenAsync();
      const expoPushToken = tokenRes.data;
      await supabase.from('profiles').update({ push_token: expoPushToken }).eq('id', userId);
    };
    register();
  }, [userId]);
} 