import { create } from 'zustand';
import type { Venue } from '../venueClient';

type State = {
  activeMatchId: string | null;
  midpoint: { latitude: number; longitude: number } | null;
  selectedVenue: Venue | null;
};

type Actions = {
  beginVenuePick: (opts: { matchId: string; midpoint: { latitude: number; longitude: number } }) => void;
  confirmVenue: (venue: Venue) => void;
  clear: () => void;
};

export const useVenuePicker = create<State & Actions>((set) => ({
  activeMatchId: null,
  midpoint: null,
  selectedVenue: null,
  beginVenuePick: ({ matchId, midpoint }) => set({ activeMatchId: matchId, midpoint, selectedVenue: null }),
  confirmVenue: (venue) => set({ selectedVenue: venue }),
  clear: () => set({ activeMatchId: null, midpoint: null, selectedVenue: null }),
}));
