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
    
    // Helper function to safely extract text
    const safeText = (value: any, fallback: string = ''): string => {
        if (typeof value === 'string') return value.trim();
        if (value && typeof value === 'object' && value.text) return value.text.trim();
        return fallback;
    };
    
    // Helper function to safely extract number
    const safeNumber = (value: any, fallback: number = 0): number => {
        if (typeof value === 'number' && !isNaN(value)) return value;
        if (typeof value === 'string') {
            const parsed = parseFloat(value);
            if (!isNaN(parsed)) return parsed;
        }
        return fallback;
    };
    
    // Helper function to safely extract PriceLevel
    const safePriceLevel = (value: any, fallback: number = 1): 1 | 2 | 3 | 4 => {
        const num = safeNumber(value, fallback);
        // Ensure it's a valid PriceLevel (1-4)
        if (num >= 1 && num <= 4) return num as 1 | 2 | 3 | 4;
        return 1;
    };
    
    // Handle Google Places API format - the actual response structure
    if (venueData.displayName || venueData.name || venueData.place_id) {
        return {
            id: venueData.place_id || venueData.id || String(Math.random()),
            name: safeText(venueData.displayName) || safeText(venueData.name) || 'Unknown Venue',
            rating: safeNumber(venueData.rating, 0),
            priceLevel: safePriceLevel(venueData.price_level || venueData.priceLevel),
            categories: categories,
            location: {
                address: safeText(venueData.vicinity) || safeText(venueData.formatted_address) || safeText(venueData.location?.address) || 'Address not available',
                city: safeText(venueData.location?.city) || safeText(venueData.city) || 'City not available',
                state: safeText(venueData.location?.state) || safeText(venueData.state) || 'State not available',
                latitude: safeNumber(venueData.location?.latitude || venueData.latitude || venueData.geometry?.location?.lat, 0),
                longitude: safeNumber(venueData.location?.longitude || venueData.longitude || venueData.geometry?.location?.lng, 0),
            },
            distance: safeNumber(venueData.distance, 0),
            imageUrl: venueData.imageUrl || venueData.photos?.[0]?.photo_reference || undefined,
            reviewCount: safeNumber(venueData.reviewCount || venueData.user_ratings_total, 0),
            openNow: venueData.openNow || venueData.opening_hours?.open_now,
            phone: venueData.phone || venueData.formatted_phone_number,
            website: venueData.website || venueData.url,
            photos: venueData.photos || [],
        };
    }
    
    // Fallback for other formats
    return {
        id: venueData.id || String(Math.random()),
        name: safeText(venueData.name) || 'Unknown Venue',
        rating: safeNumber(venueData.rating, 0),
        priceLevel: safePriceLevel(venueData.priceLevel || venueData.price_level),
        categories: categories,
        location: {
            address: safeText(venueData.address) || safeText(venueData.location?.address) || 'Address not available',
            city: safeText(venueData.city) || safeText(venueData.location?.city) || 'City not available',
            state: safeText(venueData.state) || safeText(venueData.location?.state) || 'State not available',
            latitude: safeNumber(venueData.latitude || venueData.location?.latitude, 0),
            longitude: safeNumber(venueData.longitude || venueData.location?.longitude, 0),
        },
        distance: safeNumber(venueData.distance, 0),
        imageUrl: venueData.imageUrl || venueData.image || undefined,
        reviewCount: safeNumber(venueData.reviewCount || venueData.reviews, 0),
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

        // Create a map to track unique venues by a combination of name and location
        const uniqueVenueMap = new Map<string, Venue>();
        
        // Helper function to generate a unique key for a venue
        const getVenueKey = (venue: Venue): string => {
            // Use name + coordinates as the unique identifier
            const lat = venue.location.latitude.toFixed(6);
            const lng = venue.location.longitude.toFixed(6);
            return `${venue.name.toLowerCase().trim()}_${lat}_${lng}`;
        };

        // Process each category and add to unique map
        const processCategory = (venues: Venue[], categoryName: string) => {
            venues.forEach(venue => {
                const key = getVenueKey(venue);
                if (!uniqueVenueMap.has(key)) {
                    // Ensure the venue has a unique ID
                    venue.id = `${categoryName}_${venue.id}`;
                    uniqueVenueMap.set(key, venue);
                } else {
                    // If venue already exists, merge categories if needed
                    const existing = uniqueVenueMap.get(key)!;
                    if (existing.categories && venue.categories) {
                        const combinedCategories = [...new Set([...existing.categories, ...venue.categories])];
                        existing.categories = combinedCategories;
                    }
                }
            });
        };

        // Process each category
        processCategory(restaurants, 'restaurant');
        processCategory(cafes, 'cafe');
        processCategory(bars, 'bar');
        processCategory(activities, 'activity');

        // Convert back to arrays, ensuring each venue has a unique ID
        const uniqueVenues = Array.from(uniqueVenueMap.values());
        
        // Reassign IDs to ensure they're truly unique
        uniqueVenues.forEach((venue, index) => {
            venue.id = `venue_${index}_${Date.now()}`;
        });

        console.log('📊 Final combined result:', {
            restaurants: restaurants.length,
            cafes: cafes.length,
            bars: bars.length,
            activities: activities.length,
            total: uniqueVenues.length,
            unique: uniqueVenues.length
        });

        // Return the original category arrays but with deduplicated venues
        return {
            restaurants: restaurants.filter((venue, index) => {
                const key = getVenueKey(venue);
                return uniqueVenueMap.get(key) === venue;
            }),
            cafes: cafes.filter((venue, index) => {
                const key = getVenueKey(venue);
                return uniqueVenueMap.get(key) === venue;
            }),
            bars: bars.filter((venue, index) => {
                const key = getVenueKey(venue);
                return uniqueVenueMap.get(key) === venue;
            }),
            activities: activities.filter((venue, index) => {
                const key = getVenueKey(venue);
                return uniqueVenueMap.get(key) === venue;
            }),
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