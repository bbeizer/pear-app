import type { VenueProvider, ProviderType, ProviderConfig } from './types';
import { GooglePlacesProvider } from './googlePlaces';
import { YelpVenueProvider } from './yelp';

export class VenueProviderFactory {
    private static providers = new Map<ProviderType, VenueProvider>();

    static createProvider(type: ProviderType, config: ProviderConfig): VenueProvider {
        // Check if we already have an instance
        if (this.providers.has(type)) {
            return this.providers.get(type)!;
        }

        let provider: VenueProvider;

        switch (type) {
            case 'google':
                provider = new GooglePlacesProvider(config);
                break;
            case 'yelp':
                provider = new YelpVenueProvider(config.apiKey);
                break;
            case 'foursquare':
                throw new Error('Foursquare provider not implemented yet');
                break;
            default:
                throw new Error(`Unknown provider type: ${type}`);
        }

        // Cache the provider instance
        this.providers.set(type, provider);
        return provider;
    }

    static getProvider(type: ProviderType): VenueProvider | null {
        return this.providers.get(type) || null;
    }

    static clearProviders(): void {
        this.providers.clear();
    }

    static switchProvider(type: ProviderType, config: ProviderConfig): VenueProvider {
        // Clear existing provider and create new one
        this.providers.delete(type);
        return this.createProvider(type, config);
    }
}

// Convenience function to get the current provider
export function getCurrentVenueProvider(): VenueProvider {
    // Default to Google Places for now
    const providerType = (process.env.EXPO_PUBLIC_VENUE_PROVIDER as ProviderType) || 'google';
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || 
                   process.env.EXPO_PUBLIC_YELP_API_KEY || 
                   process.env.EXPO_PUBLIC_FOURSQUARE_API_KEY;

    if (!apiKey) {
        throw new Error('No venue provider API key found. Please set one of: EXPO_PUBLIC_GOOGLE_PLACES_API_KEY, EXPO_PUBLIC_YELP_API_KEY, or EXPO_PUBLIC_FOURSQUARE_API_KEY');
    }

    return VenueProviderFactory.createProvider(providerType, { apiKey });
} 