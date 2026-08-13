import { logger } from '../../utils/logger.js';
import axios from 'axios';

export interface GeoLocation {
  latitude: number;
  longitude: number;
  formattedAddress?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface PlacePrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

export class MapsService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || '';
  }

  async geocode(address: string): Promise<GeoLocation> {
    if (!this.apiKey) {
      logger.warn('Google Maps API key missing, returning fallback coordinates for Bengaluru');
      return {
        latitude: 12.9716,
        longitude: 77.5946,
        formattedAddress: address,
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
      };
    }

    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: { address, key: this.apiKey },
      });

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0];
        const location = result.geometry.location;
        return {
          latitude: location.lat,
          longitude: location.lng,
          formattedAddress: result.formatted_address,
        };
      }

      throw new Error(`Geocoding failed with status: ${response.data.status}`);
    } catch (error) {
      logger.error('Google Maps Geocoding Error', { error });
      return { latitude: 12.9716, longitude: 77.5946, formattedAddress: address };
    }
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<GeoLocation> {
    if (!this.apiKey) {
      return {
        latitude,
        longitude,
        formattedAddress: `Lat: ${latitude}, Lng: ${longitude}`,
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
      };
    }

    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: { latlng: `${latitude},${longitude}`, key: this.apiKey },
      });

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        return {
          latitude,
          longitude,
          formattedAddress: response.data.results[0].formatted_address,
        };
      }
    } catch (error) {
      logger.error('Google Maps Reverse Geocoding Error', { error });
    }

    return { latitude, longitude, formattedAddress: `Lat: ${latitude}, Lng: ${longitude}` };
  }

  async placesAutocomplete(input: string): Promise<PlacePrediction[]> {
    if (!this.apiKey || !input.trim()) {
      return [
        { placeId: 'place_1', description: `${input}, Koramangala, Bengaluru`, mainText: input, secondaryText: 'Koramangala, Bengaluru' },
        { placeId: 'place_2', description: `${input}, Indiranagar, Bengaluru`, mainText: input, secondaryText: 'Indiranagar, Bengaluru' },
      ];
    }

    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/place/autocomplete/json', {
        params: { input, key: this.apiKey, components: 'country:in' },
      });

      if (response.data.status === 'OK') {
        return response.data.predictions.map((p: any) => ({
          placeId: p.place_id,
          description: p.description,
          mainText: p.structured_formatting?.main_text || p.description,
          secondaryText: p.structured_formatting?.secondary_text || '',
        }));
      }
    } catch (error) {
      logger.error('Google Places Autocomplete Error', { error });
    }

    return [];
  }

  async getDistanceMatrix(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
  ): Promise<{ distanceKm: number; durationMinutes: number }> {
    if (!this.apiKey) {
      const distanceKm = this.calculateHaversineDistance(origin.lat, origin.lng, destination.lat, destination.lng);
      return { distanceKm: Math.round(distanceKm * 10) / 10, durationMinutes: Math.round(distanceKm * 3) };
    }

    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
        params: {
          origins: `${origin.lat},${origin.lng}`,
          destinations: `${destination.lat},${destination.lng}`,
          key: this.apiKey,
        },
      });

      if (response.data.status === 'OK' && response.data.rows[0]?.elements[0]?.status === 'OK') {
        const element = response.data.rows[0].elements[0];
        return {
          distanceKm: Math.round((element.distance.value / 1000) * 10) / 10,
          durationMinutes: Math.round(element.duration.value / 60),
        };
      }
    } catch (error) {
      logger.error('Google Maps Distance Matrix Error', { error });
    }

    const distanceKm = this.calculateHaversineDistance(origin.lat, origin.lng, destination.lat, destination.lng);
    return { distanceKm: Math.round(distanceKm * 10) / 10, durationMinutes: Math.round(distanceKm * 3) };
  }

  filterProvidersByRadius<T extends { latitude?: number; longitude?: number }>(
    userLat: number,
    userLng: number,
    providers: T[],
    radiusKm = 10,
  ): (T & { distanceKm: number })[] {
    return providers
      .map((p) => {
        const pLat = p.latitude ?? 12.9716;
        const pLng = p.longitude ?? 77.5946;
        const distanceKm = Math.round(this.calculateHaversineDistance(userLat, userLng, pLat, pLng) * 10) / 10;
        return { ...p, distanceKm };
      })
      .filter((p) => p.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }

  private calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

export const mapsService = new MapsService();
