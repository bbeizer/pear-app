import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../supabaseClient';
import type { Match, Profile } from '../../types';
import type { Venue } from '../venueClient';
import { fetchUserMatches } from '../supabaseUtils';
import { calculateMidpointFromProfiles } from '../../utils/locationUtils';
import { transformVenueFromMatch, transformVenueForDatabase } from '../../utils/venueUtils';

export function useMatches() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [venueModalVisible, setVenueModalVisible] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null);

    useEffect(() => {
        fetchMatches();
    }, []);

    const fetchMatches = async () => {
        try {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData?.user) return;

            const userId = userData.user.id;
            setCurrentUserId(userId);

            // Get current user's profile
            const { data: userProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (userProfile) {
                setCurrentUserProfile(userProfile);
            }

            const userMatches = await fetchUserMatches(userId);

            // Get profiles for the other users in each match
            const matchesWithProfiles = await Promise.all(
                userMatches.map(async (match) => {
                    const otherUserId = match.user1_id === userId ? match.user2_id : match.user1_id;

                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', otherUserId)
                        .single();

                    return {
                        ...match,
                        other_user_profile: profile
                    };
                })
            );

            setMatches(matchesWithProfiles);
        } catch (error) {
            console.error('Error fetching matches:', error);
            Alert.alert('Error', 'Failed to load matches. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleMatchPress = (match: Match) => {
        setSelectedMatch(match);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedMatch(null);
    };

    const handleMatchUpdate = () => {
        fetchMatches();
    };

    const handleVenuePress = (match: Match) => {
        setSelectedMatch(match);
        setVenueModalVisible(true);
    };

    const handleCloseVenueModal = () => {
        setVenueModalVisible(false);
        setSelectedMatch(null);
    };

    const handleVenueAccept = async (venue: Venue) => {
        if (!selectedMatch || !currentUserId) return;

        try {
            const venueData = transformVenueForDatabase(venue, currentUserId);
            const { error } = await supabase
                .from('matches')
                .update({
                    ...venueData,
                    status: 'proposed'
                })
                .eq('id', selectedMatch.id);

            if (error) {
                console.error('Error accepting venue:', error);
                Alert.alert('Error', 'Failed to accept venue. Please try again.');
                return;
            }

            Alert.alert('Success', 'Venue accepted! Your match will be notified.');
            fetchMatches();
        } catch (error) {
            console.error('Error accepting venue:', error);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        }
    };

    const handleVenueSuggest = async (venue: Venue) => {
        if (!selectedMatch || !currentUserId) return;

        try {
            const venueData = transformVenueForDatabase(venue, currentUserId);
            const { error } = await supabase
                .from('matches')
                .update({
                    ...venueData,
                    status: 'proposed'
                })
                .eq('id', selectedMatch.id);

            if (error) {
                console.error('Error suggesting venue:', error);
                Alert.alert('Error', 'Failed to suggest venue. Please try again.');
                return;
            }

            Alert.alert('Success', 'Venue suggested! Your match will be notified.');
            fetchMatches();
        } catch (error) {
            console.error('Error suggesting venue:', error);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        }
    };

    const calculateMidpoint = (match: Match) => {
        return currentUserProfile ?
            calculateMidpointFromProfiles(currentUserProfile, match.other_user_profile) :
            { latitude: 40.7128, longitude: -74.0060 }; // Default to NYC if no profile
    };

    return {
        // State
        matches,
        loading,
        selectedMatch,
        modalVisible,
        venueModalVisible,
        currentUserId,
        currentUserProfile,
        
        // Actions
        handleMatchPress,
        handleCloseModal,
        handleMatchUpdate,
        handleVenuePress,
        handleCloseVenueModal,
        handleVenueAccept,
        handleVenueSuggest,
        fetchMatches,
        calculateMidpoint,
        
        // Computed values
        suggestedVenue: selectedMatch ? transformVenueFromMatch(selectedMatch) : null,
    };
} 