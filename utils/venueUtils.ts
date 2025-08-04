import type { Venue } from '../lib/venueClient';
import type { Match } from '../types';

/**
 * Transform venue data from database to Venue interface
 */
export function transformVenueFromMatch(match: Match): Venue | null {
    if (!match.venue_name) return null;

    return {
        id: match.id,
        name: match.venue_name,
        location: {
            address: match.venue_address || '',
            city: '',
            state: '',
            latitude: match.venue_latitude || 0,
            longitude: match.venue_longitude || 0
        },
        rating: match.venue_rating || 0,
        priceLevel: (match.venue_price_level || 1) as 1 | 2 | 3 | 4,
        categories: (match.venue_categories || []) as ('restaurant' | 'cafe' | 'bar' | 'activity' | 'entertainment' | 'arts' | 'beauty' | 'fitness')[],
        distance: match.venue_distance_meters || 0,
        reviewCount: 0,
        openNow: true,
        imageUrl: undefined
    };
}

/**
 * Transform venue data for database insertion
 */
export function transformVenueForDatabase(venue: Venue, suggestedBy: string) {
    return {
        venue_name: venue.name,
        venue_address: venue.location.address,
        venue_latitude: venue.location.latitude,
        venue_longitude: venue.location.longitude,
        venue_rating: venue.rating,
        venue_price_level: venue.priceLevel,
        venue_categories: venue.categories,
        venue_distance_meters: venue.distance,
        venue_suggested_by: suggestedBy,
        venue_suggested_at: new Date().toISOString(),
    };
}

/**
 * Get venue category emoji for display
 */
export function getVenueCategoryEmoji(category: string): string {
    const emojiMap: Record<string, string> = {
        restaurant: '🍽️',
        cafe: '☕',
        bar: '🍺',
        activity: '🎯',
        entertainment: '🎭',
        arts: '🎨',
        beauty: '💄',
        fitness: '💪'
    };
    
    return emojiMap[category] || '📍';
}

/**
 * Get price level display string
 */
export function getPriceLevelDisplay(priceLevel: number): string {
    return '$'.repeat(priceLevel);
}

/**
 * Format venue rating with stars
 */
export function formatVenueRating(rating: number): string {
    return `${rating.toFixed(1)} ⭐`;
}

/**
 * Check if venue is open now
 */
export function isVenueOpen(venue: Venue): boolean {
    return venue.openNow !== false;
}

/**
 * Get venue status text
 */
export function getVenueStatusText(venue: Venue): string {
    if (venue.openNow === false) {
        return 'Closed';
    }
    if (venue.openNow === true) {
        return 'Open Now';
    }
    return 'Hours Unknown';
}

/**
 * Sort venues by relevance (rating, distance, etc.)
 */
export function sortVenuesByRelevance(venues: Venue[]): Venue[] {
    return venues.sort((a, b) => {
        // Primary sort by rating (higher is better)
        if (b.rating !== a.rating) {
            return b.rating - a.rating;
        }
        
        // Secondary sort by distance (closer is better)
        return a.distance - b.distance;
    });
}

/**
 * Filter venues by category
 */
export function filterVenuesByCategory(venues: Venue[], category: string): Venue[] {
    return venues.filter(venue => 
        venue.categories.some(cat => cat.toLowerCase().includes(category.toLowerCase()))
    );
}

/**
 * Filter venues by price level
 */
export function filterVenuesByPriceLevel(venues: Venue[], maxPriceLevel: number): Venue[] {
    return venues.filter(venue => venue.priceLevel <= maxPriceLevel);
}

/**
 * Get venue categories as a display string
 */
export function getVenueCategoriesDisplay(venue: Venue): string {
    return venue.categories.join(', ');
} 