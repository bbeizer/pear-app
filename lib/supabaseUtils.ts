import { supabase } from './supabaseClient';

export async function fetchUserMatches(userId: string) {
  const { data: matches, error } = await supabase
    .from('matches')
    .select('*')
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);
  if (error) throw error;
  return matches;
}

export async function fetchAvailableProfiles(excludedIds: string[]) {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .filter('id', 'not.in', `(${excludedIds.join(',')})`);
  if (error) throw error;
  return profiles;
}

export function findOverlapSlots(mine: string[], theirs: string[]) {
  return mine.filter((slot) => theirs.includes(slot));
} 