import { supabase } from './supabaseClient';

export async function fetchUserMatches(userId: string) {
  // Get all matches where this user is involved
  const { data: matches, error } = await supabase
    .from('matches')
    .select('*')
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  return matches || [];
}

export async function createMatch(user1Id: string, user2Id: string, meetingType?: 'in-person' | 'video', suggestedActivity?: string, suggestedVenue?: string) {
  // Ensure user1Id is the smaller UUID to maintain consistency
  const [smallerId, largerId] = [user1Id, user2Id].sort();
  
  const { data: match, error } = await supabase
    .from('matches')
    .insert({
      user1_id: smallerId,
      user2_id: largerId,
      status: 'pending',
      meeting_type: meetingType,
      suggested_activity: suggestedActivity,
      suggested_venue: suggestedVenue,
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return match;
}

export async function fetchUsersLikes(excludedIds: string[], userLatitude?: number, userLongitude?: number, userDistancePreference?: number) {
  let query = supabase
    .from('profiles')
    .select('*')
    .filter('id', 'not.in', `(${excludedIds.join(',')})`);

  const { data: profiles, error } = await query;
  if (error) throw error;
  
  // If user wants any distance (999) or no distance preference, return all profiles
  if (!userDistancePreference || userDistancePreference >= 999) {
    return profiles;
  }
  
  // If we have location data and distance preference, filter by distance
  if (userLatitude && userLongitude && userDistancePreference && profiles) {
    const filteredProfiles = profiles.filter(profile => {
      // Only filter profiles that have location data
      if (!profile.latitude || !profile.longitude) {
        return true; // Include profiles without location data
      }
      
      const distance = calculateDistance(userLatitude, userLongitude, profile.latitude, profile.longitude);
      return distance <= userDistancePreference;
    });
    
    // Sort by distance (profiles without location data go to the end)
    filteredProfiles.sort((a, b) => {
      if (!a.latitude || !a.longitude) return 1;
      if (!b.latitude || !b.longitude) return -1;
      
      const distanceA = calculateDistance(userLatitude, userLongitude, a.latitude, a.longitude);
      const distanceB = calculateDistance(userLatitude, userLongitude, b.latitude, b.longitude);
      
      return distanceA - distanceB;
    });
    
    return filteredProfiles;
  }
  
  // If anyDistance is true (userDistancePreference is undefined), return all profiles
  return profiles;
}

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function findOverlapSlots(mine: string[], theirs: string[]) {
  return mine.filter((slot) => theirs.includes(slot));
} 