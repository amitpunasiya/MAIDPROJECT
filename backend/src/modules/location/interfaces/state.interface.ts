import type { Document, Types } from 'mongoose';
import type { ISoftDelete } from '../../../models/common/softDelete.js';

export interface IState extends Document, ISoftDelete {
  countryId: Types.ObjectId;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateStateDTO {
  countryId: string | Types.ObjectId;
  name: string;
  code: string;
  isActive?: boolean;
}

export interface IUpdateStateDTO {
  name?: string;
  code?: string;
  isActive?: boolean;
}
