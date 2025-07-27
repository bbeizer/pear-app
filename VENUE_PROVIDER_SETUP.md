# Venue Provider Setup Guide

This guide explains how to set up and switch between different venue providers (Google Places, Yelp, Foursquare) in your Pear app.

## Overview

The venue system uses an abstraction layer that allows you to easily switch between different venue APIs without changing your app code. This is perfect for:
- **Development**: Use Google Places (free tier)
- **Demos/VC Pitches**: Switch to Yelp (premium data)
- **Backup**: Use Foursquare if needed

## Available Providers

### 1. Google Places API (New) - **RECOMMENDED**
- **Cost**: Free tier with generous limits
- **Data Quality**: Excellent
- **Features**: Basic venue info (names, addresses, photos)
- **Premium Features**: Ratings, price levels, opening hours (Enterprise SKU - costs money)

### 2. Yelp Fusion API - **FOR DEMOS**
- **Cost**: $600/month after 30-day free trial
- **Data Quality**: Premium
- **Features**: Ratings, reviews, price levels included
- **Best For**: VC pitches, demos, premium feel

### 3. Foursquare Places API - **BACKUP**
- **Cost**: Free tier available
- **Data Quality**: Good
- **Features**: Basic venue info
- **Status**: Not yet implemented

## Setup Instructions

### 1. Environment Variables

Add these to your `.env` file:

```bash
# Choose your provider: 'google_places', 'yelp', or 'foursquare'
EXPO_PUBLIC_VENUE_PROVIDER=google_places

# API Keys (only the one for your chosen provider is required)
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=your_google_places_api_key
EXPO_PUBLIC_YELP_API_KEY=your_yelp_api_key
EXPO_PUBLIC_FOURSQUARE_API_KEY=your_foursquare_api_key
```

### 2. Google Places API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable these APIs:
   - **Places API (New)** - Required for venue search
   - **Places API** (legacy) - May be needed for some features
4. Create API credentials
5. Copy your API key to `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY`

### 3. Yelp API Setup

1. Go to [Yelp Fusion](https://www.yelp.com/developers)
2. Create a new app
3. Get your API key
4. Copy to `EXPO_PUBLIC_YELP_API_KEY`

**Note**: Yelp has a 30-day free trial, then $600/month. Perfect for demos!

## Usage

### In Your Components

```typescript
import { useVenues } from '../lib/hooks/useVenues';

function MyComponent() {
  const { searchVenues, searchByCategory, getCurrentProvider } = useVenues();
  
  const findVenues = async () => {
    const venues = await searchVenues({
      latitude: 42.3601,
      longitude: -71.0589,
      radius: 2000, // 2km
      limit: 20
    });
    
    console.log('Found venues:', venues);
  };
  
  return (
    // Your component JSX
  );
}
```

### Switching Providers

To switch providers, just change your environment variable:

```bash
# For development (free)
EXPO_PUBLIC_VENUE_PROVIDER=google_places

# For demos (premium)
EXPO_PUBLIC_VENUE_PROVIDER=yelp

# For backup
EXPO_PUBLIC_VENUE_PROVIDER=foursquare
```

## Provider Comparison

| Feature | Google Places | Yelp | Foursquare |
|---------|---------------|------|------------|
| **Cost** | Free tier | $600/month | Free tier |
| **Venue Names** | ✅ | ✅ | ✅ |
| **Addresses** | ✅ | ✅ | ✅ |
| **Photos** | ✅ | ✅ | ✅ |
| **Ratings** | 💸 (Enterprise) | ✅ | ❓ |
| **Price Levels** | 💸 (Enterprise) | ✅ | ❓ |
| **Reviews** | 💸 (Enterprise) | ✅ | ❓ |
| **Opening Hours** | 💸 (Enterprise) | ✅ | ❓ |

## Testing

### Postman Test (Google Places)

```bash
POST https://places.googleapis.com/v1/places:searchNearby
Headers:
  Content-Type: application/json
  X-Goog-Api-Key: YOUR_API_KEY
  X-Goog-FieldMask: places.displayName,places.formattedAddress,places.location,places.primaryTypeDisplayName,places.photos,places.id

Body:
{
  "includedTypes": ["restaurant"],
  "maxResultCount": 10,
  "locationRestriction": {
    "circle": {
      "center": {
        "latitude": 42.3370,
        "longitude": -71.2092
      },
      "radius": 2000.0
    }
  }
}
```

### Postman Test (Yelp)

```bash
GET https://api.yelp.com/v3/businesses/search?latitude=42.3370&longitude=-71.2092&radius=2000&limit=10&sort_by=rating
Headers:
  Authorization: Bearer YOUR_YELP_API_KEY
```

## Architecture

```
lib/venueProviders/
├── types.ts              # Common interfaces
├── factory.ts            # Provider factory
├── googlePlaces.ts       # Google Places implementation
├── yelp.ts              # Yelp implementation
└── foursquare.ts        # Foursquare implementation (TODO)

lib/
├── venueClient.ts        # Main venue client
└── hooks/
    └── useVenues.ts      # React hook for venues
```

## Best Practices

1. **Start with Google Places** - Free and works great
2. **Use Yelp for demos** - Premium feel for investors
3. **Keep the abstraction layer** - Easy to switch providers
4. **Test with Postman first** - Verify API keys work
5. **Monitor costs** - Especially with Yelp

## Troubleshooting

### Common Issues

1. **"Legacy API" error**: Make sure you have "Places API (New)" enabled
2. **Empty responses**: Check your field mask and API restrictions
3. **Authentication errors**: Verify your API keys
4. **Rate limiting**: Respect API limits

### Getting Help

- Check the API documentation for each provider
- Test with Postman before implementing
- Monitor your API usage in the respective dashboards 