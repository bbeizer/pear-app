import type { Profile } from '../types';

/**
 * Calculate the midpoint between two geographic coordinates
 */
export function calculateMidpoint(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): { latitude: number; longitude: number } {
    return {
        latitude: (lat1 + lat2) / 2,
        longitude: (lng1 + lng2) / 2
    };
}

/**
 * Calculate the midpoint between two user profiles
 * Falls back to a default location if coordinates aren't available
 */
export function calculateMidpointFromProfiles(
    user1: Profile,
    user2: Profile,
    defaultLocation: { latitude: number; longitude: number } = { latitude: 40.7128, longitude: -74.0060 } // NYC
): { latitude: number; longitude: number } {
    if (!user1.latitude || !user1.longitude || !user2.latitude || !user2.longitude) {
        return defaultLocation;
    }

    return calculateMidpoint(
        user1.latitude,
        user1.longitude,
        user2.latitude,
        user2.longitude
    );
}

/**
 * Calculate distance between two points using the Haversine formula
 * Returns distance in meters
 */
export function calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

/**
 * Format distance in meters to a human-readable string
 */
export function formatDistance(meters: number): string {
    if (meters < 1000) {
        return `${Math.round(meters)}m`;
    } else {
        const km = meters / 1000;
        return `${km.toFixed(1)}km`;
    }
}

/**
 * Format distance in meters to miles
 */
export function formatDistanceInMiles(meters: number): string {
    const miles = meters * 0.000621371;
    return `${miles.toFixed(1)} mi`;
}

/**
 * Check if a location is within a certain radius of another location
 */
export function isWithinRadius(
    centerLat: number,
    centerLng: number,
    targetLat: number,
    targetLng: number,
    radiusMeters: number
): boolean {
    const distance = calculateDistance(centerLat, centerLng, targetLat, targetLng);
    return distance <= radiusMeters;
}

/**
 * Get a bounding box around a center point for API queries
 */
export function getBoundingBox(
    centerLat: number,
    centerLng: number,
    radiusMeters: number
): {
    north: number;
    south: number;
    east: number;
    west: number;
} {
    const latDelta = radiusMeters / 111320; // Approximate meters per degree latitude
    const lngDelta = radiusMeters / (111320 * Math.cos(centerLat * Math.PI / 180));

    return {
        north: centerLat + latDelta,
        south: centerLat - latDelta,
        east: centerLng + lngDelta,
        west: centerLng - lngDelta
    };
} 