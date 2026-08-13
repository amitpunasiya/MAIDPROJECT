import type { Document, Types } from 'mongoose';
import type { ISoftDelete } from '../../../models/common/softDelete.js';

export interface ICity extends Document, ISoftDelete {
  stateId: Types.ObjectId;
  countryId: Types.ObjectId;
  name: string;
  slug: string;
  latitude?: number | null;
  longitude?: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateCityDTO {
  stateId: string | Types.ObjectId;
  countryId?: string | Types.ObjectId;
  name: string;
  slug?: string;
  latitude?: number | null;
  longitude?: number | null;
  isActive?: boolean;
}

export interface IUpdateCityDTO {
  stateId?: string | Types.ObjectId;
  countryId?: string | Types.ObjectId;
  name?: string;
  slug?: string;
  latitude?: number | null;
  longitude?: number | null;
  isActive?: boolean;
}

export interface ICityQueryFilter {
  stateId?: string;
  countryId?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt' | 'slug';
  sortOrder?: 'asc' | 'desc';
}
