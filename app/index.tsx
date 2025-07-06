import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { supabase } from 'lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

export default function Index() {
    const [user, setUser] = useState<User | null | undefined>(undefined);

    useEffect(() => {
        const fetchUser = async () => {
            const { data, error } = await supabase.auth.getSession();
            const user = data?.session?.user ?? null;
            setUser(user);

            if (error) {
                console.error('Error fetching user:', error);
                setUser(null);
            } else {
                setUser(data?.session?.user ?? null);
            }
        };
        fetchUser();
    }, []);

    if (user === undefined) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return <Redirect href={user ? '/main/ProfileSetup' : '/auth/Login'} />;
}