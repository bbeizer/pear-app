import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import type { User } from '@supabase/supabase-js';

export function useSupabaseUser() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      setUser(error ? null : data?.user ?? null);
    });
  }, []);
  return user;
}