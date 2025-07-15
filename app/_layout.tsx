import React, { useEffect, useState } from 'react';
import { Slot, Redirect, usePathname } from 'expo-router';
import { supabase } from 'lib/supabaseClient';
import { View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import type { Session } from '@supabase/supabase-js';

if (typeof globalThis.structuredClone === 'undefined') {
    globalThis.structuredClone = (val) => JSON.parse(JSON.stringify(val));
}
export default function RootLayout() {
    const [session, setSession] = useState<Session | null | undefined>(undefined);
    const pathname = usePathname();

    useEffect(() => {
        const fetchSession = async () => {
            const { data, error } = await supabase.auth.getSession();
            if (error) console.error('Supabase error:', error);
            setSession(data?.session ?? null);
        };
        fetchSession();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
            setSession(newSession ?? null);
        });

        return () => {
            authListener?.subscription?.unsubscribe?.();
        };
    }, []);

    if (session === undefined) {
        return (
            <GestureHandlerRootView style={{ flex: 1 }}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" />
                </View>
            </GestureHandlerRootView>
        );
    }

    if (!session && pathname.startsWith('/main')) {
        return (
            <GestureHandlerRootView style={{ flex: 1 }}>
                <Redirect href="/auth/Login" />
            </GestureHandlerRootView>
        );
    }

    if (session && pathname.startsWith('/auth')) {
        return (
            <GestureHandlerRootView style={{ flex: 1 }}>
                <Redirect href="/main/ProfileSetup" />
            </GestureHandlerRootView>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Slot />
        </GestureHandlerRootView>
    );
}
