import { get } from './helpers';
import { ApiResponse } from './types';

export interface ICatalogCategory {
  id: string;
  _id?: string;
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface ICatalogService {
  id: string;
  _id?: string;
  title?: string;
  name?: string;
  categoryId?: string;
  description?: string;
  shortDescription?: string;
  startingPrice?: string | number;
  basePrice?: number;
  priceType?: 'hourly' | 'fixed' | 'monthly';
  rating?: number;
  reviewsCount?: number;
  icon?: string;
  imageUrl?: string;
  tags?: string[];
  isActive?: boolean;
  verificationRequired?: boolean;
  skillsRequired?: string[];
  estimatedDurationMinutes?: number;
}

export const serviceApi = {
  /**
   * Get all active catalog categories
   * GET /catalog/categories
   */
  getCategories(): Promise<ApiResponse<ICatalogCategory[]>> {
    return get<ICatalogCategory[]>('/catalog/categories');
  },

  /**
   * Get catalog services by category ID
   * GET /catalog/categories/:categoryId/services
   */
  getServicesByCategory(categoryId: string): Promise<ApiResponse<ICatalogService[]>> {
    return get<ICatalogService[]>(`/catalog/categories/${categoryId}/services`);
  },

  /**
   * Get details for a single catalog service
   * GET /catalog/services/:serviceId
   */
  getServiceDetails(serviceId: string): Promise<ApiResponse<ICatalogService>> {
    return get<ICatalogService>(`/catalog/services/${serviceId}`);
  },

  /**
   * Search catalog services by keyword
   * GET /catalog/search
   */
  searchServices(query: string): Promise<ApiResponse<ICatalogService[]>> {
    return get<ICatalogService[]>('/catalog/search', { q: query });
  },
};

export default serviceApi;
