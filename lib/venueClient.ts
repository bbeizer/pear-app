import { getCurrentVenueProvider, VenueProviderFactory } from './venueProviders/factory';
import type { Venue, VenueSearchParams, VenueSearchResponse, VenueCategory, ProviderType, ProviderConfig } from './venueProviders/types';

// Parse venue data to only include essential fields
const parseVenueData = (venue: any): Venue => {
    console.log('🔍 Raw venue data:', JSON.stringify(venue, null, 2));
    
    // Handle the nested structure where venue data is in _j property
    let venueData = venue;
    if (venue._j && typeof venue._j === 'object') {
        venueData = venue._j;
        console.log('🔍 Extracted venue data from _j:', venueData);
    }
    
    // Extract categories from various possible field names
    let categories: VenueCategory[] = [];
    if (venueData.types && Array.isArray(venueData.types)) {
        // Filter and map types to valid VenueCategory values
        const validTypes = venueData.types.filter((type: string) => 
            ['restaurant', 'cafe', 'bar', 'activity', 'entertainment', 'arts', 'beauty', 'fitness'].includes(type)
        );
        categories = validTypes as VenueCategory[];
    } else if (venueData.categories && Array.isArray(venueData.categories)) {
        const validCategories = venueData.categories.filter((cat: string) => 
            ['restaurant', 'cafe', 'bar', 'activity', 'entertainment', 'arts', 'beauty', 'fitness'].includes(cat)
        );
        categories = validCategories as VenueCategory[];
    }
    
    // If no categories found, try to infer from venue name and other fields
    if (categories.length === 0) {
        const name = (venueData.displayName?.text || venueData.name || '').toLowerCase();
        const types = venueData.types || [];
        
        // Infer categories from venue name and types
        if (name.includes('restaurant') || name.includes('grill') || name.includes('bistro') || 
            name.includes('steakhouse') || name.includes('pizzeria') || types.includes('restaurant')) {
            categories = ['restaurant'];
        } else if (name.includes('cafe') || name.includes('coffee') || name.includes('bakery') || 
                   name.includes('deli') || types.includes('cafe')) {
            categories = ['cafe'];
        } else if (name.includes('bar') || name.includes('pub') || name.includes('tavern') || 
                   name.includes('lounge') || types.includes('bar')) {
            categories = ['bar'];
        } else if (name.includes('golf') || name.includes('fitness') || name.includes('gym') || 
                   name.includes('spa') || types.includes('gym') || types.includes('health')) {
            categories = ['activity'];
        }
        
        console.log('🔍 Inferred categories for', name, ':', categories);
    }
    
    // Handle Google Places API format - the actual response structure
    if (venueData.displayName || venueData.name || venueData.place_id) {
        return {
            id: venueData.place_id || venueData.id || String(Math.random()),
            name: venueData.displayName?.text || venueData.name || 'Unknown Venue',
            rating: venueData.rating || 0,
            priceLevel: venueData.price_level || venueData.priceLevel || 1,
            categories: categories,
            location: {
                address: venueData.vicinity || venueData.formatted_address || venueData.location?.address || 'Address not available',
                city: venueData.location?.city || venueData.city || 'City not available',
                state: venueData.location?.state || venueData.state || 'State not available',
                latitude: venueData.location?.latitude || venueData.latitude || venueData.geometry?.location?.lat || 0,
                longitude: venueData.location?.longitude || venueData.longitude || venueData.geometry?.location?.lng || 0,
            },
            distance: venueData.distance || 0,
            imageUrl: venueData.imageUrl || venueData.photos?.[0]?.photo_reference || undefined,
            reviewCount: venueData.reviewCount || venueData.user_ratings_total || 0,
            openNow: venueData.openNow || venueData.opening_hours?.open_now,
            phone: venueData.phone || venueData.formatted_phone_number,
            website: venueData.website || venueData.url,
            photos: venueData.photos || [],
        };
    }
    
    // Fallback for other formats
    return {
        id: venueData.id || String(Math.random()),
        name: venueData.name || 'Unknown Venue',
        rating: venueData.rating || 0,
        priceLevel: venueData.priceLevel || venueData.price_level || 1,
        categories: categories,
        location: {
            address: venueData.address || venueData.location?.address || 'Address not available',
            city: venueData.city || venueData.location?.city || 'City not available',
            state: venueData.state || venueData.location?.state || 'State not available',
            latitude: venueData.latitude || venueData.location?.latitude || 0,
            longitude: venueData.longitude || venueData.location?.longitude || 0,
        },
        distance: venueData.distance || 0,
        imageUrl: venueData.imageUrl || venueData.image || undefined,
        reviewCount: venueData.reviewCount || venueData.reviews || 0,
        openNow: venueData.openNow || venueData.isOpen,
        phone: venueData.phone || venueData.contact?.phone,
        website: venueData.website || venueData.url,
        photos: venueData.photos || venueData.images || [],
    };
};

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
        console.log(`🔎 Searching for ${category}:`, params);
        const rawResults = await this.provider.searchByCategory(category, params);
        const results = rawResults.map(parseVenueData);
        console.log(`✅ ${category} results:`, results.length, results);
        return results;
    }

    // Get all venue types for a date
    async getDateVenues(latitude: number, longitude: number, radius: number = 5000): Promise<{
        restaurants: Venue[];
        cafes: Venue[];
        bars: Venue[];
        activities: Venue[];
    }> {
        console.log('🔍 Starting venue search:', { latitude, longitude, radius });
        
        const [restaurants, cafes, bars, activities] = await Promise.all([
            this.searchRestaurants(latitude, longitude, radius),
            this.searchCafes(latitude, longitude, radius),
            this.searchBars(latitude, longitude, radius),
            this.searchActivities(latitude, longitude, radius),
        ]);

        console.log('🍕 Raw restaurants data:', JSON.stringify(restaurants[0], null, 2));
        console.log('☕ Raw cafes data:', JSON.stringify(cafes[0], null, 2));
        console.log('🍺 Raw bars data:', JSON.stringify(bars[0], null, 2));
        console.log('🎯 Raw activities data:', JSON.stringify(activities[0], null, 2));

        // Combine all venues and remove duplicates based on ID
        const allVenues = [...restaurants, ...cafes, ...bars, ...activities];
        const uniqueVenues = allVenues.filter((venue, index, self) => 
            index === self.findIndex(v => v.id === venue.id)
        );

        console.log('📊 Final combined result:', {
            restaurants: restaurants.length,
            cafes: cafes.length,
            bars: bars.length,
            activities: activities.length,
            total: allVenues.length,
            unique: uniqueVenues.length
        });

        return {
            restaurants,
            cafes,
            bars,
            activities,
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