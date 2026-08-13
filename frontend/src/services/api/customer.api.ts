import { get, post, put, del, patch } from './helpers';
import { ApiResponse } from './types';
import { AuthUser } from './auth.api';

export interface ICustomerAddress {
  id: string;
  tag: string;
  fullAddress: string;
  street?: string;
  city: string;
  pincode: string;
  landmark?: string;
  isDefault: boolean;
}

export interface ICustomerProfilePayload {
  name?: string;
  email?: string;
  phone?: string;
  gender?: 'Male' | 'Female' | 'Other';
  dob?: string;
  address?: string;
  emergencyContact?: string;
  city?: string;
  avatar?: string;
}

export interface IAddressPayload {
  tag: string;
  fullAddress: string;
  city: string;
  pincode: string;
  landmark?: string;
  isDefault?: boolean;
}

export const customerApi = {
  /**
   * Get customer profile
   * GET /customer/profile
   */
  getProfile(): Promise<ApiResponse<AuthUser & ICustomerProfilePayload>> {
    return get<AuthUser & ICustomerProfilePayload>('/customer/profile');
  },

  /**
   * Update customer profile
   * PUT /customer/profile
   */
  updateProfile(payload: ICustomerProfilePayload): Promise<ApiResponse<AuthUser & ICustomerProfilePayload>> {
    return put<AuthUser & ICustomerProfilePayload>('/customer/profile', payload);
  },

  /**
   * Get all customer saved addresses
   * GET /customer/addresses
   */
  getAddresses(): Promise<ApiResponse<ICustomerAddress[]>> {
    return get<ICustomerAddress[]>('/customer/addresses');
  },

  /**
   * Add a new service address
   * POST /customer/addresses
   */
  addAddress(payload: IAddressPayload): Promise<ApiResponse<ICustomerAddress>> {
    return post<ICustomerAddress>('/customer/addresses', payload);
  },

  /**
   * Update an existing address
   * PUT /customer/addresses/:id
   */
  updateAddress(id: string, payload: Partial<IAddressPayload>): Promise<ApiResponse<ICustomerAddress>> {
    return put<ICustomerAddress>(`/customer/addresses/${id}`, payload);
  },

  /**
   * Delete an address by ID
   * DELETE /customer/addresses/:id
   */
  deleteAddress(id: string): Promise<ApiResponse<{ success: boolean; message?: string }>> {
    return del<{ success: boolean; message?: string }>(`/customer/addresses/${id}`);
  },

  /**
   * Set an address as default
   * PATCH /customer/addresses/:id/default
   */
  setDefaultAddress(id: string): Promise<ApiResponse<ICustomerAddress>> {
    return patch<ICustomerAddress>(`/customer/addresses/${id}/default`, {});
  },
};

export default customerApi;
