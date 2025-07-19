import { supabase } from './supabaseClient';

export async function fetchUserMatches(userId: string) {
  const { data: matches, error } = await supabase
    .from('matches')
    .select('*')
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);
  if (error) throw error;
  return matches;
}

export async function fetchAvailableProfiles(excludedIds: string[], userLatitude?: number, userLongitude?: number, userDistancePreference?: number) {
  let query = supabase
    .from('profiles')
    .select('*')
    .filter('id', 'not.in', `(${excludedIds.join(',')})`);

  // If we have location data, filter by distance
  if (userLatitude && userLongitude && userDistancePreference) {
    // Calculate distance using Haversine formula
    // This is a simplified version - in production you'd want to use PostGIS or similar
    const distanceFilter = `
      (6371 * acos(
        cos(radians(${userLatitude})) * 
        cos(radians(latitude)) * 
        cos(radians(longitude) - radians(${userLongitude})) + 
        sin(radians(${userLatitude})) * 
        sin(radians(latitude))
      )) <= ${userDistancePreference * 1.60934} -- Convert miles to km
    `;
    
    query = query.filter('latitude', 'not.is', null)
                 .filter('longitude', 'not.is', null);
  }

  const { data: profiles, error } = await query;
  if (error) throw error;
  
  // If we have location data, sort by distance
  if (userLatitude && userLongitude && profiles) {
    profiles.sort((a, b) => {
      if (!a.latitude || !a.longitude || !b.latitude || !b.longitude) return 0;
      
      const distanceA = calculateDistance(userLatitude, userLongitude, a.latitude, a.longitude);
      const distanceB = calculateDistance(userLatitude, userLongitude, b.latitude, b.longitude);
      
      return distanceA - distanceB;
    });
  }
  
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