import { create } from 'zustand';
import type { Venue } from '../venueClient';

type State = {
  activeMatchId: string | null;
  midpoint: { latitude: number; longitude: number } | null;
  selectedVenue: Venue | null;
  confirmedVenue: { venue: Venue; matchId: string } | null;
};

type Actions = {
  beginVenuePick: (opts: { matchId: string; midpoint: { latitude: number; longitude: number } }) => void;
  confirmVenue: (venue: Venue, matchId: string) => void;
  clear: () => void;
};

export const useVenuePicker = create<State & Actions>((set) => ({
  activeMatchId: null,
  midpoint: null,
  selectedVenue: null,
  confirmedVenue: null,
  beginVenuePick: ({ matchId, midpoint }) => {
    console.log('🔍 VenuePicker: beginVenuePick called with:', { matchId, midpoint });
    set({ activeMatchId: matchId, midpoint, selectedVenue: null, confirmedVenue: null });
  },
  confirmVenue: (venue, matchId) => {
    console.log('🔍 VenuePicker: confirmVenue called with:', { venue: venue.name, matchId });
    set({ selectedVenue: venue, confirmedVenue: { venue, matchId } });
  },
  clear: () => {
    console.log('🔍 VenuePicker: clear called');
    set({ activeMatchId: null, midpoint: null, selectedVenue: null, confirmedVenue: null });
  },
}));
