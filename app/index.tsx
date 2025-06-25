import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { supabase } from 'lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

export default function Index() {
    const [user, setUser] = useState<User | null | undefined>(undefined); // undefined = loading
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const handleAuth = async () => {
            const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
                setUser(session?.user ?? null);
                setChecking(false);
            });

            try {
                const { data, error } = await supabase.auth.getSession();
                if (error) {
                    console.error("Supabase error (getSession):", error);
                }
                setUser(data?.session?.user ?? null);
            } catch (e) {
                console.error("Unexpected Supabase error:", e);
            } finally {
                setChecking(false);
            }

            return () => listener.subscription?.unsubscribe();
        };

        handleAuth();
    }, []);

    if (checking || user === undefined) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!user) return <Redirect href="/auth/Login" />;
    return <Redirect href="/main/ProfileSetup" />;
}
