import { get, put, post, del } from './helpers';
import { ApiResponse, PaginatedData } from './types';

export interface IAdminDashboardStats {
  totalRevenue: number;
  monthlyRevenue: number;
  totalBookings: number;
  activeBookings: number;
  totalCustomers: number;
  totalProviders: number;
  activeProviders: number;
  walletVolume: number;
  totalCouponsRedeemed: number;
  pendingApprovals: number;
}

export interface IAdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  totalBookings: number;
  status: 'active' | 'suspended';
  joinedDate: string;
}

export interface IAdminProvider {
  id: string;
  name: string;
  email: string;
  phone: string;
  serviceType: 'cook' | 'maid';
  experienceYears: number;
  city: string;
  rating: number;
  kycStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  status: 'active' | 'inactive';
}

export interface IAdminBooking {
  id: string;
  bookingIdNumber: string;
  customerName: string;
  providerName: string;
  serviceType: string;
  date: string;
  amount: number;
  status: string;
}

export interface IAdminPayment {
  id: string;
  paymentId: string;
  bookingId: string;
  customerName: string;
  amount: number;
  method: string;
  status: string;
  timestamp: string;
}

export interface IAdminCoupon {
  id: string;
  code: string;
  discountAmount: number;
  minOrderValue: number;
  usageCount: number;
  status: 'active' | 'expired';
}

export interface IAdminGlobalSettings {
  appName: string;
  platformFee: number;
  gstPercentage: number;
  maintenanceMode: boolean;
  supportPhone: string;
  supportEmail: string;
}

export const adminApi = {
  getDashboardStats(): Promise<ApiResponse<IAdminDashboardStats>> {
    return get<IAdminDashboardStats>('/admin/stats');
  },

  getCustomers(params?: Record<string, unknown>): Promise<ApiResponse<PaginatedData<IAdminCustomer>>> {
    return get<PaginatedData<IAdminCustomer>>('/admin/customers', params);
  },

  getProviders(params?: Record<string, unknown>): Promise<ApiResponse<PaginatedData<IAdminProvider>>> {
    return get<PaginatedData<IAdminProvider>>('/admin/providers', params);
  },

  getBookings(params?: Record<string, unknown>): Promise<ApiResponse<PaginatedData<IAdminBooking>>> {
    return get<PaginatedData<IAdminBooking>>('/admin/bookings', params);
  },

  getPayments(params?: Record<string, unknown>): Promise<ApiResponse<PaginatedData<IAdminPayment>>> {
    return get<PaginatedData<IAdminPayment>>('/admin/payments', params);
  },

  getWalletLogs(params?: Record<string, unknown>): Promise<ApiResponse<PaginatedData<unknown>>> {
    return get<PaginatedData<unknown>>('/admin/wallets', params);
  },

  getCoupons(params?: Record<string, unknown>): Promise<ApiResponse<PaginatedData<IAdminCoupon>>> {
    return get<PaginatedData<IAdminCoupon>>('/admin/coupons', params);
  },

  createCoupon(payload: Partial<IAdminCoupon>): Promise<ApiResponse<IAdminCoupon>> {
    return post<IAdminCoupon>('/admin/coupons', payload);
  },

  deleteCoupon(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return del<{ success: boolean }>(`/admin/coupons/${id}`);
  },

  getReferrals(params?: Record<string, unknown>): Promise<ApiResponse<PaginatedData<unknown>>> {
    return get<PaginatedData<unknown>>('/admin/referrals', params);
  },

  getReports(params?: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return get<unknown>('/admin/reports', params);
  },

  getCMSPages(params?: Record<string, unknown>): Promise<ApiResponse<PaginatedData<unknown>>> {
    return get<PaginatedData<unknown>>('/admin/cms', params);
  },

  getGlobalSettings(): Promise<ApiResponse<IAdminGlobalSettings>> {
    return get<IAdminGlobalSettings>('/admin/settings');
  },

  updateGlobalSettings(settings: Partial<IAdminGlobalSettings>): Promise<ApiResponse<IAdminGlobalSettings>> {
    return put<IAdminGlobalSettings>('/admin/settings', settings);
  },

  getMediaVault(params?: Record<string, unknown>): Promise<ApiResponse<PaginatedData<unknown>>> {
    return get<PaginatedData<unknown>>('/admin/media', params);
  },
};

export default adminApi;
