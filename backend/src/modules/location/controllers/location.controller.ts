import type { Request, Response } from 'express';
import { locationService } from '../services/location.service.js';
import { globalLocationService } from '../services/globalLocation.service.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import type {
  CreateCountryInput,
  CreateStateInput,
  CityQueryInput,
  CitySearchQueryInput,
} from '../validators/location.validator.js';
import type { ICreateCityDTO, IUpdateCityDTO } from '../interfaces/location.interface.js';
import { seedLocationData } from '../../../jobs/seedLocations.js';

import { ApiError } from '../../../utils/ApiError.js';

export class LocationController {
  getCountries = asyncHandler(async (_req: Request, res: Response) => {
    const countries = await globalLocationService.getCountries();
    return ApiResponse.ok(res, 'Countries retrieved successfully', { countries });
  });

  getStatesByCountryCode = asyncHandler(async (req: Request, res: Response) => {
    const countryCode = (req.params.countryCode || req.query.countryCode || 'IN') as string;
    const states = await globalLocationService.getStatesOfCountry(countryCode);
    return ApiResponse.ok(res, 'States retrieved successfully', { states });
  });

  getCitiesByStateCode = asyncHandler(async (req: Request, res: Response) => {
    const stateCode = req.params.stateCode as string;
    const countryCode = req.query.countryCode as string | undefined;
    const cities = await globalLocationService.getCitiesOfState(stateCode, countryCode);
    return ApiResponse.ok(res, 'Cities retrieved successfully', { cities });
  });

  searchGlobalLocations = asyncHandler(async (req: Request, res: Response) => {
    const q = (req.query.q || req.query.search || '') as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const results = await globalLocationService.searchGlobalCities(q, limit);
    return ApiResponse.ok(res, 'Global location search results', { locations: results, cities: results });
  });

  reverseGeocode = asyncHandler(async (req: Request, res: Response) => {
    const lat = parseFloat((req.query.lat || req.query.latitude || '0') as string);
    const lng = parseFloat((req.query.lng || req.query.longitude || '0') as string);
    if (!lat || !lng) {
      throw ApiError.badRequest('Valid lat and lng query parameters are required');
    }
    const location = await globalLocationService.reverseGeocode(lat, lng);
    return ApiResponse.ok(res, 'Current location resolved successfully', { location });
  });

  validateLocation = asyncHandler(async (req: Request, res: Response) => {
    const { countryCode, stateCode, cityName } = req.body;
    if (!countryCode || !stateCode || !cityName) {
      throw ApiError.badRequest('countryCode, stateCode, and cityName are required');
    }
    const validation = globalLocationService.validateLocationHierarchy(countryCode, stateCode, cityName);
    if (!validation.isValid) {
      throw ApiError.badRequest(validation.message || 'Invalid location hierarchy combination');
    }
    return ApiResponse.ok(res, 'Location hierarchy is valid', { isValid: true });
  });

  createCountry = asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as CreateCountryInput;
    const country = await locationService.createCountry(input);
    return ApiResponse.created(res, 'Country created successfully', { country });
  });

  getStates = asyncHandler(async (req: Request, res: Response) => {
    const countryId = req.query.countryId as string | undefined;
    const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
    const states = await locationService.getStates(countryId, isActive);
    return ApiResponse.ok(res, 'States retrieved successfully', { states });
  });

  createState = asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as CreateStateInput;
    const state = await locationService.createState(input);
    return ApiResponse.created(res, 'State created successfully', { state });
  });

  getCitiesByState = asyncHandler(async (req: Request, res: Response) => {
    const stateId = req.params.id as string;
    const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
    const cities = await locationService.getCitiesByState(stateId, isActive);
    return ApiResponse.ok(res, 'State cities retrieved successfully', { cities });
  });

  getCities = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as CityQueryInput;
    const result = await locationService.getCities(query);
    return ApiResponse.ok(res, 'Cities retrieved successfully', {
      cities: result.cities,
      pagination: result.pagination,
    });
  });

  searchCities = asyncHandler(async (req: Request, res: Response) => {
    const { q, limit, stateId } = req.query as unknown as CitySearchQueryInput;
    const cities = await locationService.searchCities(q, limit, stateId);
    return ApiResponse.ok(res, 'Cities search completed successfully', { cities });
  });

  getCityByIdOrSlug = asyncHandler(async (req: Request, res: Response) => {
    const idOrSlug = req.params.id as string;
    const city = await locationService.getCityByIdOrSlug(idOrSlug);
    return ApiResponse.ok(res, 'City details retrieved successfully', { city });
  });

  createCity = asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as ICreateCityDTO;
    const city = await locationService.createCity(input);
    return ApiResponse.created(res, 'City created successfully', { city });
  });

  updateCity = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const input = req.body as IUpdateCityDTO;
    const city = await locationService.updateCity(id, input);
    return ApiResponse.ok(res, 'City updated successfully', { city });
  });

  seedLocations = asyncHandler(async (_req: Request, res: Response) => {
    const result = await seedLocationData();
    return ApiResponse.ok(res, 'Location database seeded successfully', result);
  });
}

export const locationController = new LocationController();
