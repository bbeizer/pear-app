import { useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../supabaseClient';
import type { Venue } from '../venueClient';

export function useVenueSuggestion(matchId: string, currentUserId: string, match: any) {
  const [isLoading, setIsLoading] = useState(false);

  // Determine which user is making the suggestion
  const isUser1 = currentUserId === match?.user1_id;
  const venueField = isUser1 ? 'user1_proposed_venue' : 'user2_proposed_venue';
  const otherUserVenue = isUser1 ? match?.user2_proposed_venue : match?.user1_proposed_venue;

  // Save venue suggestion to Supabase
  const saveVenueSuggestion = async (venue: Venue) => {
    if (!matchId || !currentUserId) {
      Alert.alert('Error', 'Missing match or user information');
      return false;
    }

    setIsLoading(true);
    try {
      console.log('🔍 Saving venue suggestion:', {
        matchId,
        currentUserId,
        venueField,
        venue: venue.name
      });

      const { error } = await supabase
        .from('matches')
        .update({
          [venueField]: venue,
          status: 'proposed'
        })
        .eq('id', matchId);

      if (error) {
        console.error('Error saving venue suggestion:', error);
        Alert.alert('Error', 'Failed to save venue suggestion. Please try again.');
        return false;
      }

      console.log('✅ Venue suggestion saved successfully');
      Alert.alert('Success', 'Venue suggestion saved! Your match will be notified.');
      return true;
      
    } catch (error) {
      console.error('Error saving venue suggestion:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Accept venue suggestion from other user
  const acceptVenueSuggestion = async (venue: Venue) => {
    if (!matchId || !currentUserId) {
      Alert.alert('Error', 'Missing match or user information');
      return false;
    }

    setIsLoading(true);
    try {
      console.log('🔍 Accepting venue suggestion:', {
        matchId,
        currentUserId,
        venue: venue.name
      });

      const { error } = await supabase
        .from('matches')
        .update({
          venue_agreed: true,
          agreed_venue: venue,
          status: 'proposed'
        })
        .eq('id', matchId);

      if (error) {
        console.error('Error accepting venue suggestion:', error);
        Alert.alert('Error', 'Failed to accept venue suggestion. Please try again.');
        return false;
      }

      console.log('✅ Venue suggestion accepted successfully');
      Alert.alert('Success', 'Venue accepted! You both agreed on this place.');
      return true;
      
    } catch (error) {
      console.error('Error accepting venue suggestion:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Get venue state for UI rendering
  const getVenueState = () => {
    if (match?.venue_agreed && match?.agreed_venue) return 'agreed';
    if (match?.[venueField] && otherUserVenue) return 'both_suggested';
    if (match?.[venueField] || otherUserVenue) return 'one_suggested';
    return 'none';
  };

  return {
    // State
    isLoading,
    isUser1,
    venueField,
    otherUserVenue,
    
    // Actions
    saveVenueSuggestion,
    acceptVenueSuggestion,
    
    // Computed values
    getVenueState,
    venueState: getVenueState(),
  };
}
