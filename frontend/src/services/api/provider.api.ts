import { get } from './helpers';
import { ApiResponse, PaginatedData } from './types';
import { ICookProfile, IMaidProfile, IProviderReview } from '../../types';

export interface ProviderQueryFilterParams {
  city?: string;
  serviceType?: string;
  minExperience?: number;
  minRating?: number;
  gender?: string;
  languages?: string | string[];
  isAvailable?: boolean;
  verified?: boolean;
  search?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

export const providerApi = {
  /**
   * Fetch paginated list of providers with optional filtering
   * GET /providers
   */
  getProviders(params?: ProviderQueryFilterParams): Promise<ApiResponse<PaginatedData<ICookProfile | IMaidProfile>>> {
    return get<PaginatedData<ICookProfile | IMaidProfile>>('/providers', params);
  },

  /**
   * Search providers by query filters
   * GET /providers/search
   */
  searchProviders(params?: ProviderQueryFilterParams): Promise<ApiResponse<PaginatedData<ICookProfile | IMaidProfile>>> {
    return get<PaginatedData<ICookProfile | IMaidProfile>>('/providers/search', params);
  },

  /**
   * Fetch currently available providers
   * GET /providers/available
   */
  getAvailableProviders(params?: ProviderQueryFilterParams): Promise<ApiResponse<ICookProfile[] | IMaidProfile[]>> {
    return get<ICookProfile[] | IMaidProfile[]>('/providers/available', params);
  },

  /**
   * Fetch top-rated providers
   * GET /providers/top-rated
   */
  getTopRatedProviders(): Promise<ApiResponse<ICookProfile[] | IMaidProfile[]>> {
    return get<ICookProfile[] | IMaidProfile[]>('/providers/top-rated');
  },

  /**
   * Fetch single provider details by ID
   * GET /providers/:id
   */
  getProviderById(id: string): Promise<ApiResponse<ICookProfile | IMaidProfile>> {
    return get<ICookProfile | IMaidProfile>(`/providers/${id}`);
  },

  /**
   * Fetch provider reviews
   * GET /reviews/cook/:id
   */
  getProviderReviews(id: string): Promise<ApiResponse<IProviderReview[]>> {
    return get<IProviderReview[]>(`/reviews/cook/${id}`);
  },

  /**
   * Smart worker matching endpoint
   * GET /providers/match
   */
  matchProviders(params?: ProviderQueryFilterParams): Promise<ApiResponse<{ items: any[]; total: number }>> {
    return get<{ items: any[]; total: number }>('/providers/match', params);
  },

  /**
   * Update worker skills
   * PATCH /providers/skills
   */
  updateSkills(skills: string[]): Promise<ApiResponse<any>> {
    return get<any>('/providers/skills', { skills });
  },
};

export default providerApi;
