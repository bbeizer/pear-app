import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabaseClient';

export default function LogoutButton({ style = {}, textStyle = {} }) {
    const router = useRouter();
    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.replace('/auth/Login');
    };
    return (
        <TouchableOpacity style={[{ marginTop: 32, alignSelf: 'center', backgroundColor: '#eee', padding: 12, borderRadius: 8 }, style]} onPress={handleLogout}>
            <Text style={[{ color: '#d00', fontWeight: 'bold' }, textStyle]}>Log out</Text>
        </TouchableOpacity>
    );
} 