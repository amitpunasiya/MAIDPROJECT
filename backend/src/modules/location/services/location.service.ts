import { Types } from 'mongoose';
import { countryRepository } from '../repositories/country.repository.js';
import { stateRepository } from '../repositories/state.repository.js';
import { cityRepository } from '../repositories/city.repository.js';
import { ApiError } from '../../../utils/ApiError.js';
import type {
  ICountry,
  ICreateCountryDTO,
  IState,
  ICreateStateDTO,
  ICity,
  ICreateCityDTO,
  IUpdateCityDTO,
  ICityQueryFilter,
} from '../interfaces/location.interface.js';

export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

export class LocationService {
  // Country Methods
  async getCountries(isActive?: boolean): Promise<ICountry[]> {
    const filter: Record<string, unknown> = {};
    if (isActive !== undefined) {
      filter.isActive = isActive;
    }
    return countryRepository.findMany(filter, { sort: { name: 1 } });
  }

  async getCountryById(id: string): Promise<ICountry> {
    if (!Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest('Invalid Country ID format');
    }
    const country = await countryRepository.findById(id);
    if (!country) {
      throw ApiError.notFound('Country not found');
    }
    return country;
  }

  async createCountry(data: ICreateCountryDTO): Promise<ICountry> {
    const existing = await countryRepository.findByIsoCode(data.isoCode);
    if (existing) {
      throw ApiError.conflict(`Country with ISO code '${data.isoCode}' already exists`);
    }
    return countryRepository.create({
      name: data.name.trim(),
      isoCode: data.isoCode.toUpperCase().trim(),
      phoneCode: data.phoneCode.trim(),
      currency: data.currency.toUpperCase().trim(),
      isActive: data.isActive ?? true,
    });
  }

  // State Methods
  async getStates(countryId?: string, isActive?: boolean): Promise<IState[]> {
    const filter: Record<string, unknown> = {};
    if (countryId) {
      if (!Types.ObjectId.isValid(countryId)) {
        throw ApiError.badRequest('Invalid Country ID format');
      }
      filter.countryId = countryId;
    }
    if (isActive !== undefined) {
      filter.isActive = isActive;
    }
    return stateRepository.findMany(filter, { sort: { name: 1 } });
  }

  async getStateById(id: string): Promise<IState> {
    if (!Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest('Invalid State ID format');
    }
    const state = await stateRepository.findById(id);
    if (!state) {
      throw ApiError.notFound('State not found');
    }
    return state;
  }

  async createState(data: ICreateStateDTO): Promise<IState> {
    const country = await this.getCountryById(String(data.countryId));
    const existing = await stateRepository.findByCode(country._id, data.code);
    if (existing) {
      throw ApiError.conflict(`State with code '${data.code}' already exists in ${country.name}`);
    }
    return stateRepository.create({
      countryId: country._id as Types.ObjectId,
      name: data.name.trim(),
      code: data.code.toUpperCase().trim(),
      isActive: data.isActive ?? true,
    });
  }

  // City Methods
  async getCitiesByState(stateId: string, isActive?: boolean): Promise<ICity[]> {
    if (!Types.ObjectId.isValid(stateId)) {
      throw ApiError.badRequest('Invalid State ID format');
    }
    const state = await stateRepository.findById(stateId);
    if (!state) {
      throw ApiError.notFound('State not found');
    }
    return cityRepository.findByState(state._id, isActive);
  }

  async getCities(queryFilter: ICityQueryFilter): Promise<{
    cities: ICity[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const { cities, total } = await cityRepository.findWithPagination(queryFilter);
    const page = queryFilter.page || 1;
    const limit = queryFilter.limit || 50;
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      cities,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async searchCities(q: string, limit = 20, stateId?: string): Promise<ICity[]> {
    const trimmed = q.trim();
    if (!trimmed) {
      return [];
    }
    return cityRepository.searchCities(trimmed, limit, stateId);
  }

  async getCityByIdOrSlug(idOrSlug: string): Promise<ICity> {
    let city: ICity | null = null;
    if (Types.ObjectId.isValid(idOrSlug)) {
      city = await cityRepository.findById(idOrSlug);
    }
    if (!city) {
      city = await cityRepository.findBySlug(idOrSlug);
    }
    if (!city) {
      throw ApiError.notFound('City not found');
    }
    return city;
  }

  async createCity(data: ICreateCityDTO): Promise<ICity> {
    if (!Types.ObjectId.isValid(String(data.stateId))) {
      throw ApiError.badRequest('Invalid State ID format');
    }
    const state = await stateRepository.findById(data.stateId);
    if (!state) {
      throw ApiError.notFound('State not found');
    }

    const cityName = data.name.trim();

    // Check unique city name within same state
    const existingInState = await cityRepository.findByNameAndState(state._id, cityName);
    if (existingInState) {
      throw ApiError.conflict(`City '${cityName}' already exists in state '${state.name}'`);
    }

    let slug = data.slug ? generateSlug(data.slug) : generateSlug(cityName);

    // Ensure slug uniqueness
    const existingSlug = await cityRepository.findBySlug(slug);
    if (existingSlug) {
      slug = `${slug}-${state.code.toLowerCase()}`;
    }

    return cityRepository.create({
      stateId: state._id as Types.ObjectId,
      countryId: state.countryId,
      name: cityName,
      slug,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      isActive: data.isActive ?? true,
    });
  }

  async updateCity(id: string, data: IUpdateCityDTO): Promise<ICity> {
    if (!Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest('Invalid City ID format');
    }

    const city = await cityRepository.findById(id);
    if (!city) {
      throw ApiError.notFound('City not found');
    }

    const updatePayload: Partial<ICity> = {};

    if (data.name !== undefined && data.name.trim() !== city.name) {
      const newName = data.name.trim();
      const existingInState = await cityRepository.findByNameAndState(city.stateId, newName);
      if (existingInState && String(existingInState._id) !== id) {
        throw ApiError.conflict(`City '${newName}' already exists in this state`);
      }
      updatePayload.name = newName;
      updatePayload.slug = generateSlug(newName);
    }

    if (data.slug !== undefined) {
      const newSlug = generateSlug(data.slug);
      const existingSlug = await cityRepository.findBySlug(newSlug);
      if (existingSlug && String(existingSlug._id) !== id) {
        throw ApiError.conflict(`Slug '${newSlug}' is already in use`);
      }
      updatePayload.slug = newSlug;
    }

    if (data.latitude !== undefined) updatePayload.latitude = data.latitude;
    if (data.longitude !== undefined) updatePayload.longitude = data.longitude;
    if (data.isActive !== undefined) updatePayload.isActive = data.isActive;

    const updated = await cityRepository.updateById(id, updatePayload);
    if (!updated) {
      throw ApiError.internal('Failed to update city');
    }
    return updated;
  }
}

export const locationService = new LocationService();
