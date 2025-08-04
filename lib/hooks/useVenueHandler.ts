import { useState } from 'react';
import type { Profile } from '../../types';
import type { Venue } from '../venueClient';

export function useVenueHandler() {
    const [showVenueModal, setShowVenueModal] = useState(false);
    const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);

    const handleMatch = (profile: Profile) => {
        setMatchedProfile(profile);
        setShowVenueModal(true);
    };

    const handleVenueAccept = async (venue: Venue, onVenueAction: (venue: Venue, profile: Profile) => Promise<boolean>) => {
        if (!matchedProfile) return;

        const success = await onVenueAction(venue, matchedProfile);
        if (success) {
            setShowVenueModal(false);
            setMatchedProfile(null);
        }
    };

    const handleVenueSuggest = async (venue: Venue, onVenueAction: (venue: Venue, profile: Profile) => Promise<boolean>) => {
        if (!matchedProfile) return;

        const success = await onVenueAction(venue, matchedProfile);
        if (success) {
            setShowVenueModal(false);
            setMatchedProfile(null);
        }
    };

    const closeVenueModal = () => {
        setShowVenueModal(false);
        setMatchedProfile(null);
    };

    return {
        showVenueModal,
        matchedProfile,
        handleMatch,
        handleVenueAccept,
        handleVenueSuggest,
        closeVenueModal,
    };
} 