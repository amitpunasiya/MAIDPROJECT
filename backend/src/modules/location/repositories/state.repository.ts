import type { Types } from 'mongoose';
import { BaseRepository } from '../../../repositories/base.repository.js';
import { State } from '../../../models/state.model.js';
import type { IState } from '../interfaces/state.interface.js';

export class StateRepository extends BaseRepository<IState> {
  constructor() {
    super(State);
  }

  async findByCode(countryId: string | Types.ObjectId, code: string): Promise<IState | null> {
    return this.findOne({ countryId, code: code.toUpperCase() });
  }

  async findByName(countryId: string | Types.ObjectId, name: string): Promise<IState | null> {
    return this.findOne({ countryId, name: new RegExp(`^${name.trim()}$`, 'i') });
  }

  async findByCountry(countryId: string | Types.ObjectId, isActive?: boolean): Promise<IState[]> {
    const filter: Record<string, unknown> = { countryId };
    if (isActive !== undefined) {
      filter.isActive = isActive;
    }
    return this.findMany(filter, { sort: { name: 1 } });
  }
}

export const stateRepository = new StateRepository();
