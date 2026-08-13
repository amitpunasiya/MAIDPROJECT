import { BaseRepository } from "./base.repository.js";
import Address, { type IAddress } from "../models/address.model.js";

export class AddressRepository extends BaseRepository<IAddress> {
  constructor() {
    super(Address);
  }

  async findByCustomer(customerId: string) {
    return this.findMany(
      { customer: customerId },
      {
        sort: { createdAt: -1 },
      }
    );
  }

  async findDefaultAddress(customerId: string) {
    return this.findOne({
      customer: customerId,
      isDefault: true,
    });
  }

  async removeDefault(customerId: string) {
    return Address.updateMany(
      {
        customer: customerId,
      },
      {
        isDefault: false,
      }
    );
  }

  async setDefault(addressId: string) {
    return this.updateById(addressId, {
      isDefault: true,
    });
  }
}

export const addressRepository = new AddressRepository();