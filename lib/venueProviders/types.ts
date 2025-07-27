// Common interface for all venue providers
export interface VenueProvider {
    searchVenues(params: VenueSearchParams): Promise<VenueSearchResponse>;
    searchByCategory(category: VenueCategory, params: VenueSearchParams): Promise<Venue[]>;
    getVenueDetails(venueId: string): Promise<Venue | null>;
}

// Common venue interface that works across all providers
export interface Venue {
    id: string;
    name: string;
    rating: number;
    priceLevel: PriceLevel;
    categories: VenueCategory[];
    location: {
        address: string;
        city: string;
        state: string;
        latitude: number;
        longitude: number;
    };
    distance: number; // in meters
    imageUrl?: string;
    phone?: string;
    website?: string;
    openNow?: boolean;
    reviewCount?: number;
    photos?: string[];
}

export interface VenueSearchParams {
    latitude: number;
    longitude: number;
    radius?: number;
    keyword?: string;
    category?: VenueCategory;
    priceLevel?: PriceLevel;
    openNow?: boolean;
    limit?: number;
}

export interface VenueSearchResponse {
    venues: Venue[];
    total: number;
    nextPageToken?: string;
}

export type VenueCategory = 
    | 'restaurant'
    | 'cafe'
    | 'bar'
    | 'activity'
    | 'entertainment'
    | 'arts'
    | 'beauty'
    | 'fitness';

export type PriceLevel = 1 | 2 | 3 | 4; // $, $$, $$$, $$$$

// Provider configuration
export interface ProviderConfig {
    apiKey: string;
    baseUrl?: string;
    timeout?: number;
}

// Provider factory
export type ProviderType = 'google' | 'foursquare' | 'yelp'; 