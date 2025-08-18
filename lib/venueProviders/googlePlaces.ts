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
                'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.primaryTypeDisplayName,places.location,places.rating,places.userRatingCount,places.photos,places.priceLevel,places.types,places.nationalPhoneNumber,places.websiteUri'
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(`Google Places API error: ${data.error?.message || response.statusText}`);
        }

        console.log('🔍 Google Places API response:', JSON.stringify(data, null, 2));

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
        console.log('🔍 Raw place data:', JSON.stringify(place, null, 2));
        console.log('🔍 Address fields:', {
            formattedAddress: place.formattedAddress,
            displayName: place.displayName,
            location: place.location
        });
        
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
            // Construct the proper Google Places Photos API URL
            // The photo.name contains the full path like "places/ChIJ.../photos/ATKogp..."
            // We need to use the photos API endpoint to get the actual image
            imageUrl = `https://places.googleapis.com/v1/${photo.name}/media?maxWidthPx=400&key=${this.apiKey}`;
        }

        // Generate a unique ID using place ID and coordinates
        const uniqueId = `${place.id}_${place.location.latitude.toFixed(6)}_${place.location.longitude.toFixed(6)}`;

        // Safely extract price level - Google uses 0-4, we need 1-4
        let priceLevel: 1 | 2 | 3 | 4 = 1;
        if (place.priceLevel !== undefined && place.priceLevel !== null) {
            const level = Number(place.priceLevel);
            if (level >= 0 && level <= 4) {
                // Google uses 0-4, convert to 1-4 (0 = free, 1 = $, 2 = $$, etc.)
                priceLevel = (level === 0 ? 1 : level) as 1 | 2 | 3 | 4;
            }
        }

        // Extract address - try multiple possible fields
        let address = 'Address not available';
        if (place.formattedAddress) {
            address = place.formattedAddress;
        } else if (place.displayName && place.displayName.text) {
            // Use the display name as a fallback if no formatted address
            address = place.displayName.text;
        }

        // If we still don't have an address, construct one from coordinates
        if (address === 'Address not available') {
            // Use a simple coordinate-based address for Kendall Square area
            const lat = place.location.latitude.toFixed(4);
            const lng = place.location.longitude.toFixed(4);
            address = `Near ${lat}, ${lng}`;
        }

        // Ensure we have valid text values to prevent rendering errors
        const name = place.displayName?.text || place.name || 'Unknown Venue';
        const rating = typeof place.rating === 'number' && !isNaN(place.rating) ? place.rating : 0;
        const reviewCount = typeof place.userRatingCount === 'number' && !isNaN(place.userRatingCount) ? place.userRatingCount : 0;

        const transformedVenue = {
            id: uniqueId,
            name: name,
            rating: rating,
            priceLevel: priceLevel,
            categories: this.mapGoogleTypesToCategories(place.types || []),
            location: {
                address: address,
                city: 'Cambridge', // Default city for Kendall Square area
                state: 'MA', // Default state for Massachusetts
                latitude: place.location.latitude,
                longitude: place.location.longitude,
            },
            distance,
            imageUrl,
            openNow: place.openingHours?.openNow || false,
            reviewCount: reviewCount,
        };

        console.log('🔍 Transformed venue:', JSON.stringify(transformedVenue, null, 2));
        console.log('🔍 Final transformed venue:', JSON.stringify(transformedVenue, null, 2));

        return transformedVenue;
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