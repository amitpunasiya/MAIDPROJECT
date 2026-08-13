import type { Document } from 'mongoose';
import type { ISoftDelete } from '../../../models/common/softDelete.js';

export interface ICountry extends Document, ISoftDelete {
  name: string;
  isoCode: string;
  phoneCode: string;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateCountryDTO {
  name: string;
  isoCode: string;
  phoneCode: string;
  currency: string;
  isActive?: boolean;
}

export interface IUpdateCountryDTO {
  name?: string;
  isoCode?: string;
  phoneCode?: string;
  currency?: string;
  isActive?: boolean;
}
