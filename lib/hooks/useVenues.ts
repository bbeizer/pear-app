import { useState, useCallback } from 'react';
import { venueClient, type Venue } from '../venueClient';

interface VenueCategories {
    restaurants: Venue[];
    cafes: Venue[];
    bars: Venue[];
    activities: Venue[];
}

interface UseVenuesReturn {
    venues: VenueCategories;
    isLoading: boolean;
    error: string | null;
    searchVenues: (latitude: number, longitude: number, radius?: number) => Promise<void>;
    searchByCategory: (category: keyof VenueCategories, latitude: number, longitude: number, radius?: number) => Promise<Venue[]>;
    clearError: () => void;
    getCurrentProvider: () => string;
}

export function useVenues(): UseVenuesReturn {
    const [venues, setVenues] = useState<VenueCategories>({
        restaurants: [],
        cafes: [],
        bars: [],
        activities: [],
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchVenues = useCallback(async (latitude: number, longitude: number, radius: number = 5000) => {
        setIsLoading(true);
        setError(null);

        try {
            const venueData = await venueClient.getDateVenues(latitude, longitude, radius);
            setVenues(venueData);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch venues';
            setError(errorMessage);
            console.error('Error searching venues:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const searchByCategory = useCallback(async (
        category: keyof VenueCategories,
        latitude: number,
        longitude: number,
        radius: number = 5000
    ): Promise<Venue[]> => {
        try {
            let results: Venue[] = [];

            switch (category) {
                case 'restaurants':
                    results = await venueClient.searchRestaurants(latitude, longitude, radius);
                    break;
                case 'cafes':
                    results = await venueClient.searchCafes(latitude, longitude, radius);
                    break;
                case 'bars':
                    results = await venueClient.searchBars(latitude, longitude, radius);
                    break;
                case 'activities':
                    results = await venueClient.searchActivities(latitude, longitude, radius);
                    break;
            }

            // Update the specific category in venues state
            setVenues(prev => ({
                ...prev,
                [category]: results,
            }));

            return results;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : `Failed to fetch ${category}`;
            setError(errorMessage);
            console.error(`Error searching ${category}:`, err);
            return [];
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const getCurrentProvider = useCallback(() => {
        return venueClient.getCurrentProviderType();
    }, []);

    return {
        venues,
        isLoading,
        error,
        searchVenues,
        searchByCategory,
        clearError,
        getCurrentProvider,
    };
} 