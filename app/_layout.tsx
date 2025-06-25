import React, { useEffect, useState } from "react";
import { Slot, Redirect, usePathname } from "expo-router";
import { supabase } from "lib/supabaseClient";
import { View, ActivityIndicator } from "react-native";
import type { Session } from "@supabase/supabase-js";

export default function RootLayout() {
    const [session, setSession] = useState<Session | null | undefined>(undefined);
    const pathname = usePathname();

    useEffect(() => {
        const fetchSession = async () => {
            const { data, error } = await supabase.auth.getSession();
            if (error) console.error("Supabase error:", error);
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
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!session && pathname.startsWith("/main")) {
        return <Redirect href="/auth/Login" />;
    }

    if (session && pathname.startsWith("/auth")) {
        return <Redirect href="/main/ProfileSetup" />;
    }

    return <Slot />;
}
