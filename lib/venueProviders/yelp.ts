import { VenueProvider, Venue, VenueSearchParams, VenueSearchResponse, VenueCategory, PriceLevel } from './types';

interface YelpBusiness {
  id: string;
  name: string;
  image_url: string;
  url: string;
  review_count: number;
  rating: number;
  price: string;
  categories: Array<{
    title: string;
    alias: string;
  }>;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  location: {
    display_address: string[];
    address1: string;
    city: string;
    state: string;
    zip_code: string;
  };
  phone: string;
  is_closed: boolean;
  distance: number;
}

interface YelpSearchResponse {
  businesses: YelpBusiness[];
  total: number;
  region: {
    center: {
      latitude: number;
      longitude: number;
    };
  };
}

export class YelpVenueProvider implements VenueProvider {
  private apiKey: string;
  private baseUrl = 'https://api.yelp.com/v3';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private transformYelpBusiness(business: YelpBusiness): Venue {
    return {
      id: business.id,
      name: business.name,
      imageUrl: business.image_url,
      website: business.url,
      reviewCount: business.review_count,
      rating: business.rating,
      priceLevel: this.mapYelpPriceToPriceLevel(business.price),
      categories: business.categories.map(cat => cat.title as VenueCategory),
      location: {
        latitude: business.coordinates.latitude,
        longitude: business.coordinates.longitude,
        address: business.location.display_address.join(', '),
        city: business.location.city,
        state: business.location.state
      },
      phone: business.phone,
      openNow: !business.is_closed,
      distance: business.distance
    };
  }

  private mapYelpPriceToPriceLevel(yelpPrice: string): PriceLevel {
    switch (yelpPrice) {
      case '$': return 1;
      case '$$': return 2;
      case '$$$': return 3;
      case '$$$$': return 4;
      default: return 1;
    }
  }

  async searchVenues(params: VenueSearchParams): Promise<VenueSearchResponse> {
    const { latitude, longitude, radius = 1000, limit = 20, keyword } = params;

    const searchParams = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      radius: radius.toString(),
      limit: limit.toString(),
      sort_by: 'rating'
    });

    if (keyword) {
      searchParams.append('term', keyword);
    }

    const response = await fetch(`${this.baseUrl}/businesses/search?${searchParams}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Yelp API error: ${response.status} ${response.statusText}`);
    }

    const data: YelpSearchResponse = await response.json();

    return {
      venues: data.businesses.map(business => this.transformYelpBusiness(business)),
      total: data.total
    };
  }

  async searchByCategory(category: VenueCategory, params: VenueSearchParams): Promise<Venue[]> {
    // Yelp uses categories as terms, so we can reuse searchVenues
    const searchParams = new URLSearchParams({
      latitude: params.latitude.toString(),
      longitude: params.longitude.toString(),
      radius: (params.radius || 1000).toString(),
      limit: (params.limit || 20).toString(),
      sort_by: 'rating'
    });

    // Map our category to Yelp category
    const yelpCategory = this.mapCategoryToYelp(category);
    if (yelpCategory) {
      searchParams.append('categories', yelpCategory);
    }

    const response = await fetch(`${this.baseUrl}/businesses/search?${searchParams}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Yelp API error: ${response.status} ${response.statusText}`);
    }

    const data: YelpSearchResponse = await response.json();
    return data.businesses.map(business => this.transformYelpBusiness(business));
  }

  private mapCategoryToYelp(category: VenueCategory): string | null {
    const categoryMap: Record<VenueCategory, string> = {
      restaurant: 'restaurants',
      cafe: 'cafes',
      bar: 'bars',
      activity: 'active',
      entertainment: 'arts',
      arts: 'arts',
      beauty: 'beautysvc',
      fitness: 'fitness'
    };
    return categoryMap[category] || null;
  }

  async getVenueDetails(venueId: string): Promise<Venue | null> {
    const response = await fetch(`${this.baseUrl}/businesses/${venueId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Yelp API error: ${response.status} ${response.statusText}`);
    }

    const business: YelpBusiness = await response.json();
    return this.transformYelpBusiness(business);
  }
} 