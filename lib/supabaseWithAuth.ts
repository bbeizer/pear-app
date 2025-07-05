// lib/supabaseWithAuth.ts
import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export async function getSupabaseWithAuth() {
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) throw new Error('No session available');

    return createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            headers: {
                Authorization: `Bearer ${session.access_token}`,
            },
        },
    });
}
