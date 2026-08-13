import { BaseRepository } from '../../../repositories/base.repository.js';
import { Country } from '../../../models/country.model.js';
import type { ICountry } from '../interfaces/country.interface.js';

export class CountryRepository extends BaseRepository<ICountry> {
  constructor() {
    super(Country);
  }

  async findByIsoCode(isoCode: string): Promise<ICountry | null> {
    return this.findOne({ isoCode: isoCode.toUpperCase() });
  }

  async findByName(name: string): Promise<ICountry | null> {
    return this.findOne({ name: new RegExp(`^${name.trim()}$`, 'i') });
  }
}

export const countryRepository = new CountryRepository();
