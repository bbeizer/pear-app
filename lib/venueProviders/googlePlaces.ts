import type { VenueProvider, Venue, VenueSearchParams, VenueSearchResponse, VenueCategory, ProviderConfig } from './types';

interface GooglePlace {
    place_id: string;
    name: string;
    rating?: number;
    price_level?: number;
    types: string[];
    vicinity: string;
    geometry: {
        location: {
            lat: number;
            lng: number;
        };
    };
    photos?: Array<{
        photo_reference: string;
        height: number;
        width: number;
    }>;
    opening_hours?: {
        open_now: boolean;
    };
    user_ratings_total?: number;
}

interface GooglePlacesResponse {
    results: GooglePlace[];
    status: string;
    next_page_token?: string;
}

export class GooglePlacesProvider implements VenueProvider {
    private apiKey: string;
    private baseUrl = 'https://places.googleapis.com/v1';

    constructor(config: ProviderConfig) {
        this.apiKey = config.apiKey;
    }

    async searchVenues(params: VenueSearchParams): Promise<VenueSearchResponse> {
        const requestBody: any = {
            includedTypes: [this.mapCategoryToGoogleType(params.category || 'restaurant')],
            maxResultCount: params.limit || 20,
            locationRestriction: {
                circle: {
                    center: {
                        latitude: params.latitude,
                        longitude: params.longitude
                    },
                    radius: (params.radius || 5000)
                }
            }
        };

        // Add text query if specified
        if (params.keyword) {
            requestBody.textQuery = params.keyword;
        }

        const response = await fetch(`${this.baseUrl}/places:searchNearby`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': this.apiKey,
                'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.primaryTypeDisplayName,places.location,places.rating,places.userRatingCount,places.photos'
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(`Google Places API error: ${data.error?.message || response.statusText}`);
        }

        const venues = data.places?.map((place: any) => this.transformGooglePlace(place, params.latitude, params.longitude)) || [];

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
                'X-Goog-Api-Key': this.apiKey,
                'X-Goog-FieldMask': 'displayName,rating,priceLevel,types,location,photos,id'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(`Google Places API error: ${data.error?.message || response.statusText}`);
        }

        return this.transformGooglePlace(data, 0, 0); // Distance will be calculated by caller
    }

    private mapCategoryToGoogleType(category: VenueCategory): string {
        const categoryMap: Record<VenueCategory, string> = {
            restaurant: 'restaurant',
            cafe: 'cafe',
            bar: 'bar',
            activity: 'gym',
            entertainment: 'movie_theater',
            arts: 'art_gallery',
            beauty: 'beauty_salon',
            fitness: 'gym',
        };
        return categoryMap[category] || 'restaurant';
    }

    private async transformGooglePlace(place: any, userLat: number, userLng: number): Promise<Venue> {
        // Calculate distance
        const distance = this.calculateDistance(
            userLat, userLng,
            place.location.latitude,
            place.location.longitude
        );

        // Get photo URL if available
        let imageUrl: string | undefined;
        if (place.photos && place.photos.length > 0) {
            const photo = place.photos[0];
            imageUrl = `${photo.name}?maxWidthPx=400&key=${this.apiKey}`;
        }

        return {
            id: place.id,
            name: place.displayName?.text || 'Unknown',
            rating: place.rating || 0,
            priceLevel: (place.priceLevel as any) || 1,
            categories: this.mapGoogleTypesToCategories(place.types || []),
            location: {
                address: place.location.address || '',
                city: '', // Would need additional API call for detailed address
                state: '', // Would need additional API call for detailed address
                latitude: place.location.latitude,
                longitude: place.location.longitude,
            },
            distance,
            imageUrl,
            openNow: place.openingHours?.openNow,
            reviewCount: 0, // Not available in new API without additional call
        };
    }

    private mapGoogleTypesToCategories(types: string[]): VenueCategory[] {
        const categoryMap: Record<string, VenueCategory> = {
            restaurant: 'restaurant',
            cafe: 'cafe',
            bar: 'bar',
            gym: 'fitness',
            movie_theater: 'entertainment',
            art_gallery: 'arts',
            beauty_salon: 'beauty',
            spa: 'beauty',
        };

        return types
            .map(type => categoryMap[type])
            .filter(Boolean) as VenueCategory[];
    }

    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }
} 