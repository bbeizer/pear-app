import { getCurrentVenueProvider, VenueProviderFactory } from './venueProviders/factory';
import type { Venue, VenueSearchParams, VenueSearchResponse, VenueCategory, ProviderType, ProviderConfig } from './venueProviders/types';

// Unified venue client that can work with any provider
export class VenueClient {
    private provider: any;

    constructor() {
        try {
            this.provider = getCurrentVenueProvider();
        } catch (error) {
            console.warn('No venue provider configured:', error);
            this.provider = null;
        }
    }

    // Switch providers dynamically
    switchProvider(type: ProviderType, config: ProviderConfig) {
        this.provider = VenueProviderFactory.switchProvider(type, config);
    }

    // Get current provider type
    getCurrentProviderType(): ProviderType {
        const providerType = process.env.EXPO_PUBLIC_VENUE_PROVIDER as ProviderType || 'google';
        return providerType;
    }

    // Main search method
    async searchVenues(params: VenueSearchParams): Promise<VenueSearchResponse> {
        if (!this.provider) {
            throw new Error('No venue provider configured. Please set up an API key.');
        }
        return this.provider.searchVenues(params);
    }

    // Category-specific searches
    async searchRestaurants(latitude: number, longitude: number, radius: number = 5000): Promise<Venue[]> {
        return this.searchByCategory('restaurant', { latitude, longitude, radius });
    }

    async searchCafes(latitude: number, longitude: number, radius: number = 5000): Promise<Venue[]> {
        return this.searchByCategory('cafe', { latitude, longitude, radius });
    }

    async searchBars(latitude: number, longitude: number, radius: number = 5000): Promise<Venue[]> {
        return this.searchByCategory('bar', { latitude, longitude, radius });
    }

    async searchActivities(latitude: number, longitude: number, radius: number = 5000): Promise<Venue[]> {
        return this.searchByCategory('activity', { latitude, longitude, radius });
    }

    async searchByCategory(category: VenueCategory, params: VenueSearchParams): Promise<Venue[]> {
        if (!this.provider) {
            throw new Error('No venue provider configured. Please set up an API key.');
        }
        return this.provider.searchByCategory(category, params);
    }

    // Get all venue types for a date
    async getDateVenues(latitude: number, longitude: number, radius: number = 5000): Promise<{
        restaurants: Venue[];
        cafes: Venue[];
        bars: Venue[];
        activities: Venue[];
    }> {
        const [restaurants, cafes, bars, activities] = await Promise.all([
            this.searchRestaurants(latitude, longitude, radius),
            this.searchCafes(latitude, longitude, radius),
            this.searchBars(latitude, longitude, radius),
            this.searchActivities(latitude, longitude, radius),
        ]);

        return {
            restaurants: restaurants.slice(0, 5), // Limit to top 5 of each category
            cafes: cafes.slice(0, 5),
            bars: bars.slice(0, 5),
            activities: activities.slice(0, 5),
        };
    }

    // Get venue details
    async getVenueDetails(venueId: string): Promise<Venue | null> {
        if (!this.provider) {
            throw new Error('No venue provider configured. Please set up an API key.');
        }
        return this.provider.getVenueDetails(venueId);
    }
}

// Export a singleton instance
export const venueClient = new VenueClient();

// Export types for use in components
export type { Venue, VenueSearchParams, VenueSearchResponse, VenueCategory, ProviderType }; 