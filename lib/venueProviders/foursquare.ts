import type { VenueProvider, Venue, VenueSearchParams, VenueSearchResponse, VenueCategory, ProviderConfig } from './types';

interface FoursquareVenue {
    fsq_id: string;
    name: string;
    rating?: number;
    price?: number;
    categories: Array<{
        id: number;
        name: string;
        icon: {
            prefix: string;
            suffix: string;
        };
    }>;
    location: {
        address?: string;
        locality?: string;
        region?: string;
        country?: string;
        formatted_address?: string;
        geocodes: {
            main: {
                latitude: number;
                longitude: number;
            };
        };
    };
    distance: number;
    photos?: Array<{
        id: string;
        created_at: string;
        prefix: string;
        suffix: string;
        width: number;
        height: number;
    }>;
    tel?: string;
    website?: string;
    hours?: {
        open_now: boolean;
    };
    stats?: {
        total_photos: number;
        total_tips: number;
    };
}

interface FoursquareSearchResponse {
    results: FoursquareVenue[];
    context: {
        geo_bounds: {
            circle: {
                center: {
                    latitude: number;
                    longitude: number;
                };
                radius: number;
            };
        };
    };
}

export class FoursquareProvider implements VenueProvider {
    private apiKey: string;
    private baseUrl = 'https://api.foursquare.com/v3';

    constructor(config: ProviderConfig) {
        this.apiKey = config.apiKey;
    }

    async searchVenues(params: VenueSearchParams): Promise<VenueSearchResponse> {
        const searchParams = new URLSearchParams({
            ll: `${params.latitude},${params.longitude}`,
            radius: (params.radius || 5000).toString(),
            limit: (params.limit || 20).toString(),
        });

        if (params.category) {
            searchParams.append('categories', this.mapCategoryToFoursquareCategory(params.category));
        }
        if (params.keyword) {
            searchParams.append('query', params.keyword);
        }
        if (params.openNow) {
            searchParams.append('open_now', 'true');
        }

        const response = await fetch(`${this.baseUrl}/places/search?${searchParams}`, {
            headers: {
                'Authorization': this.apiKey,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Foursquare API error: ${response.status} ${response.statusText}`);
        }

        const data: FoursquareSearchResponse = await response.json();
        const venues = data.results.map(venue => this.transformFoursquareVenue(venue));

        return {
            venues,
            total: venues.length,
        };
    }

    async searchByCategory(category: VenueCategory, params: VenueSearchParams): Promise<Venue[]> {
        const response = await this.searchVenues({
            ...params,
            category,
        });
        return response.venues;
    }

    async getVenueDetails(venueId: string): Promise<Venue | null> {
        const response = await fetch(`${this.baseUrl}/places/${venueId}`, {
            headers: {
                'Authorization': this.apiKey,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Foursquare API error: ${response.status} ${response.statusText}`);
        }

        const venue: FoursquareVenue = await response.json();
        return this.transformFoursquareVenue(venue);
    }

    private mapCategoryToFoursquareCategory(category: VenueCategory): string {
        const categoryMap: Record<VenueCategory, string> = {
            restaurant: '13065', // Restaurant
            cafe: '13032', // Cafe
            bar: '13003', // Bar
            activity: '16000', // Arts & Entertainment
            entertainment: '16000', // Arts & Entertainment
            arts: '16000', // Arts & Entertainment
            beauty: '13028', // Beauty & Spas
            fitness: '16032', // Gym / Fitness Center
        };
        return categoryMap[category] || '13065';
    }

    private transformFoursquareVenue(venue: FoursquareVenue): Venue {
        // Get the best photo URL
        let imageUrl: string | undefined;
        if (venue.photos && venue.photos.length > 0) {
            const photo = venue.photos[0];
            imageUrl = `${photo.prefix}${photo.width}x${photo.height}${photo.suffix}`;
        }

        return {
            id: venue.fsq_id,
            name: venue.name,
            rating: venue.rating || 0,
            priceLevel: (venue.price as any) || 1,
            categories: venue.categories.map(cat => this.mapFoursquareCategoryToCategory(cat.name)),
            location: {
                address: venue.location.formatted_address || venue.location.address || '',
                city: venue.location.locality || '',
                state: venue.location.region || '',
                latitude: venue.location.geocodes.main.latitude,
                longitude: venue.location.geocodes.main.longitude,
            },
            distance: venue.distance,
            imageUrl,
            phone: venue.tel,
            website: venue.website,
            openNow: venue.hours?.open_now,
            reviewCount: venue.stats?.total_tips,
        };
    }

    private mapFoursquareCategoryToCategory(foursquareCategory: string): VenueCategory {
        const categoryMap: Record<string, VenueCategory> = {
            'Restaurant': 'restaurant',
            'Cafe': 'cafe',
            'Bar': 'bar',
            'Gym': 'fitness',
            'Movie Theater': 'entertainment',
            'Art Gallery': 'arts',
            'Beauty Salon': 'beauty',
            'Spa': 'beauty',
        };
        return categoryMap[foursquareCategory] || 'restaurant';
    }
} 