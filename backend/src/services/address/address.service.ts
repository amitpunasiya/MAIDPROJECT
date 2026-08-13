import { addressRepository } from '../../repositories/address.repository.js';
import { ApiError } from '../../utils/ApiError.js';
import type { CreateAddressInput, UpdateAddressInput } from '../../validators/address.validator.js';
import type { IAddress } from '../../models/address.model.js';
import { Types } from 'mongoose';

export class AddressService {
  async createAddress(customerId: string, input: CreateAddressInput): Promise<IAddress> {
    const existingAddresses = await addressRepository.findByCustomer(customerId);

    let isDefault = input.isDefault;
    if (existingAddresses.length === 0) {
      isDefault = true;
    }

    if (isDefault) {
      await addressRepository.removeDefault(customerId);
    }

    const address = await addressRepository.create({
      ...input,
      isDefault,
      customer: new Types.ObjectId(customerId),
    } as unknown as Partial<IAddress>);

    return address;
  }

  async updateAddress(
    addressId: string,
    customerId: string,
    input: UpdateAddressInput,
  ): Promise<IAddress> {
    const address = await addressRepository.findById(addressId);

    if (!address || address.customer.toString() !== customerId) {
      throw ApiError.notFound('Address not found');
    }

    if (input.isDefault) {
      await addressRepository.removeDefault(customerId);
    }

    const updated = await addressRepository.updateById(addressId, input);

    if (!updated) {
      throw ApiError.internal('Failed to update address');
    }

    return updated;
  }

  async deleteAddress(addressId: string, customerId: string): Promise<void> {
    const address = await addressRepository.findById(addressId);

    if (!address || address.customer.toString() !== customerId) {
      throw ApiError.notFound('Address not found');
    }

    await addressRepository.softDeleteById(addressId);

    if (address.isDefault) {
      const remaining = await addressRepository.findByCustomer(customerId);
      if (remaining.length > 0) {
        await addressRepository.setDefault(remaining[0]._id.toString());
      }
    }
  }

  async getMyAddresses(customerId: string): Promise<IAddress[]> {
    return addressRepository.findByCustomer(customerId);
  }

  async getDefaultAddress(customerId: string): Promise<IAddress | null> {
    const defaultAddr = await addressRepository.findDefaultAddress(customerId);
    if (defaultAddr) {
      return defaultAddr;
    }

    const addresses = await addressRepository.findByCustomer(customerId);
    if (addresses.length > 0) {
      await addressRepository.setDefault(addresses[0]._id.toString());
      return addressRepository.findById(addresses[0]._id.toString());
    }

    return null;
  }

  async setDefaultAddress(addressId: string, customerId: string): Promise<IAddress> {
    const address = await addressRepository.findById(addressId);

    if (!address || address.customer.toString() !== customerId) {
      throw ApiError.notFound('Address not found');
    }

    await addressRepository.removeDefault(customerId);
    const updated = await addressRepository.setDefault(addressId);

    if (!updated) {
      throw ApiError.internal('Failed to set default address');
    }

    return updated;
  }
}

export const addressService = new AddressService();
