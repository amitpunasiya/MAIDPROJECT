import apiClient from './client';

export interface IGlobalCountry {
  name: string;
  isoCode: string;
  phoneCode: string;
  currency: string;
  flag: string;
  latitude: string;
  longitude: string;
}

export interface IGlobalState {
  name: string;
  isoCode: string;
  countryCode: string;
  latitude: string | null;
  longitude: string | null;
}

export interface IGlobalCity {
  name: string;
  stateCode: string;
  countryCode: string;
  latitude: number | null;
  longitude: number | null;
}

export interface IGlobalSearchResult {
  cityName: string;
  stateName: string;
  stateCode: string;
  countryName: string;
  countryCode: string;
  latitude: number | null;
  longitude: number | null;
  formatted: string;
}

export interface IReverseGeocodeResult {
  country: string;
  countryCode: string;
  state: string;
  stateCode: string;
  city: string;
  pincode?: string;
  street?: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
}

export const locationApi = {
  getCountries: async (): Promise<IGlobalCountry[]> => {
    const res = await apiClient.get('/locations/countries');
    return res.data?.data?.countries || res.data?.countries || [];
  },

  getStates: async (countryCode: string): Promise<IGlobalState[]> => {
    const res = await apiClient.get(`/locations/countries/${countryCode}/states`);
    return res.data?.data?.states || res.data?.states || [];
  },

  getCities: async (stateCode: string, countryCode?: string): Promise<IGlobalCity[]> => {
    const params = countryCode ? { countryCode } : undefined;
    const res = await apiClient.get(`/locations/states/${stateCode}/cities`, { params });
    return res.data?.data?.cities || res.data?.cities || [];
  },

  searchGlobalLocations: async (query: string, limit = 20): Promise<IGlobalSearchResult[]> => {
    if (!query || query.trim().length < 2) return [];
    const res = await apiClient.get('/locations/search', { params: { q: query, limit } });
    return res.data?.data?.locations || res.data?.locations || [];
  },

  reverseGeocode: async (lat: number, lng: number): Promise<IReverseGeocodeResult> => {
    const res = await apiClient.get('/locations/reverse-geocode', { params: { lat, lng } });
    return res.data?.data?.location || res.data?.location;
  },

  validateLocation: async (countryCode: string, stateCode: string, cityName: string): Promise<{ isValid: boolean }> => {
    const res = await apiClient.post('/locations/validate', { countryCode, stateCode, cityName });
    return res.data?.data || { isValid: true };
  },
};

export default locationApi;
