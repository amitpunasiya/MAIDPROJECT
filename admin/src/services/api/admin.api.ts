import api from '../api';

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const adminApi = {
  // Dashboard & Overview
  getOverview: async () => {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },

  getAnalytics: async () => {
    const res = await api.get('/admin/analytics');
    return res.data;
  },

  // User Management
  getUsers: async (params?: Record<string, unknown>) => {
    const res = await api.get('/admin/users', { params });
    return res.data;
  },

  updateUser: async (id: string, data: Record<string, unknown>) => {
    const res = await api.patch(`/admin/users/${id}`, data);
    return res.data;
  },

  deleteUser: async (id: string) => {
    const res = await api.delete(`/admin/users/${id}`);
    return res.data;
  },

  // Provider Management
  getProviders: async (params?: Record<string, unknown>) => {
    const res = await api.get('/providers', { params });
    return res.data;
  },

  getProviderStatistics: async () => {
    const res = await api.get('/providers/statistics');
    return res.data;
  },

  verifyProvider: async (id: string) => {
    const res = await api.patch(`/providers/${id}/verify`);
    return res.data;
  },

  suspendProvider: async (id: string) => {
    const res = await api.patch(`/providers/${id}/suspend`);
    return res.data;
  },

  activateProvider: async (id: string) => {
    const res = await api.patch(`/providers/${id}/activate`);
    return res.data;
  },

  permanentlyBlockProvider: async (id: string, reason?: string) => {
    const res = await api.patch(`/providers/${id}/block`, { reason });
    return res.data;
  },

  rejectProvider: async (id: string) => {
    const res = await api.patch(`/providers/${id}/reject`);
    return res.data;
  },

  deleteProvider: async (id: string) => {
    const res = await api.delete(`/providers/${id}`);
    return res.data;
  },

  // Healthcare & KYC Management
  getAdminKycDetails: async (providerId: string) => {
    const res = await api.get(`/providers/admin/kyc/${providerId}`);
    return res.data;
  },

  verifyHealthcareKyc: async (providerId: string, action: 'approve' | 'reject' | 'request_resubmission', rejectionReason?: string) => {
    const res = await api.patch(`/providers/admin/kyc/${providerId}/verify`, { action, rejectionReason });
    return res.data;
  },

  // Booking Management
  getBookings: async (params?: Record<string, unknown>) => {
    const res = await api.get('/admin/bookings', { params });
    return res.data;
  },

  getBookingById: async (id: string) => {
    const res = await api.get(`/admin/bookings/${id}`);
    return res.data;
  },

  assignProvider: async (bookingId: string, providerId: string) => {
    const res = await api.patch(`/admin/bookings/${bookingId}/assign`, { providerId });
    return res.data;
  },

  updateBookingStatus: async (bookingId: string, status: string, note?: string) => {
    const res = await api.patch(`/admin/bookings/${bookingId}/status`, { status, note });
    return res.data;
  },

  cancelBooking: async (bookingId: string, cancellationReason: string) => {
    const res = await api.patch(`/admin/bookings/${bookingId}/cancel`, { cancellationReason });
    return res.data;
  },

  refundBooking: async (bookingId: string, refundAmount: number, reason: string) => {
    const res = await api.patch(`/admin/bookings/${bookingId}/refund`, { refundAmount, reason });
    return res.data;
  },

  // Payment Management
  getPayments: async (params?: Record<string, unknown>) => {
    const res = await api.get('/payments/history', { params });
    return res.data;
  },

  processRefund: async (payload: { bookingId: string; amount: number; reason: string }) => {
    const res = await api.post('/payments/refund', payload);
    return res.data;
  },

  // Wallet Management
  getWalletBalance: async () => {
    const res = await api.get('/wallets/balance');
    return res.data;
  },

  getWalletTransactions: async () => {
    const res = await api.get('/wallets/transactions');
    return res.data;
  },

  // Coupon Management
  getCoupons: async (params?: Record<string, unknown>) => {
    const res = await api.get('/coupons', { params });
    return res.data;
  },

  createCoupon: async (data: Record<string, unknown>) => {
    const res = await api.post('/coupons', data);
    return res.data;
  },

  updateCoupon: async (id: string, data: Record<string, unknown>) => {
    const res = await api.put(`/coupons/${id}`, data);
    return res.data;
  },

  toggleCouponStatus: async (id: string) => {
    const res = await api.patch(`/coupons/${id}/status`);
    return res.data;
  },

  deleteCoupon: async (id: string) => {
    const res = await api.delete(`/coupons/${id}`);
    return res.data;
  },

  // Referrals Management
  getReferrals: async (params?: Record<string, unknown>) => {
    const res = await api.get('/referrals', { params });
    return res.data;
  },

  generateReferralCode: async () => {
    const res = await api.post('/referrals/generate');
    return res.data;
  },

  // Reports
  getReportsDashboard: async () => {
    const res = await api.get('/reports/dashboard');
    return res.data;
  },

  getReportsSummary: async () => {
    const res = await api.get('/reports/summary');
    return res.data;
  },

  exportReportCsvUrl: (type = 'revenue') => `/api/v1/admin/reports/export/csv?type=${type}`,

  // CMS Content
  getCmsPages: async (params?: Record<string, unknown>) => {
    const res = await api.get('/cms/pages', { params });
    return res.data;
  },

  createCmsPage: async (data: Record<string, unknown>) => {
    const res = await api.post('/cms/pages', data);
    return res.data;
  },

  updateCmsPage: async (id: string, data: Record<string, unknown>) => {
    const res = await api.put(`/cms/pages/${id}`, data);
    return res.data;
  },

  deleteCmsPage: async (id: string) => {
    const res = await api.delete(`/cms/pages/${id}`);
    return res.data;
  },

  getCmsBanners: async (params?: Record<string, unknown>) => {
    const res = await api.get('/cms/banners', { params });
    return res.data;
  },

  createCmsBanner: async (data: Record<string, unknown>) => {
    const res = await api.post('/cms/banners', data);
    return res.data;
  },

  updateCmsBanner: async (id: string, data: Record<string, unknown>) => {
    const res = await api.put(`/cms/banners/${id}`, data);
    return res.data;
  },

  deleteCmsBanner: async (id: string) => {
    const res = await api.delete(`/cms/banners/${id}`);
    return res.data;
  },

  getCmsTestimonials: async (params?: Record<string, unknown>) => {
    const res = await api.get('/cms/testimonials', { params });
    return res.data;
  },

  createCmsTestimonial: async (data: Record<string, unknown>) => {
    const res = await api.post('/cms/testimonials', data);
    return res.data;
  },

  updateCmsTestimonial: async (id: string, data: Record<string, unknown>) => {
    const res = await api.put(`/cms/testimonials/${id}`, data);
    return res.data;
  },

  deleteCmsTestimonial: async (id: string) => {
    const res = await api.delete(`/cms/testimonials/${id}`);
    return res.data;
  },

  // Global Settings
  getPlatformSettings: async () => {
    const res = await api.get('/admin/settings');
    return res.data;
  },

  updatePlatformSettings: async (data: Record<string, unknown>) => {
    const res = await api.patch('/admin/settings', data);
    return res.data;
  },

  // Broadcast Notifications
  broadcastNotification: async (payload: { title: string; body: string; targetRole?: string }) => {
    const res = await api.post('/admin/notifications/broadcast', payload);
    return res.data;
  },

  // Media Management
  getMediaList: async (params?: Record<string, unknown>) => {
    const res = await api.get('/media/list', { params });
    return res.data;
  },

  uploadMedia: async (formData: FormData) => {
    const res = await api.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  deleteMedia: async (id: string) => {
    const res = await api.delete(`/media/${id}`);
    return res.data;
  },

  // Security / Audit Logs
  getActivityLogs: async (params?: Record<string, unknown>) => {
    const res = await api.get('/activity-logs', { params });
    return res.data;
  },

  // Catalog / Services
  getCategories: async () => {
    const res = await api.get('/catalog/categories');
    return res.data;
  },

  createCategory: async (data: Record<string, unknown>) => {
    const res = await api.post('/catalog/categories', data);
    return res.data;
  },

  getServicesByCategory: async (categoryId: string) => {
    const res = await api.get(`/catalog/categories/${categoryId}/services`);
    return res.data;
  },

  createService: async (data: Record<string, unknown>) => {
    const res = await api.post('/catalog/services', data);
    return res.data;
  },

  // Locations
  getCities: async () => {
    const res = await api.get('/locations/cities');
    return res.data;
  },

  getStates: async () => {
    const res = await api.get('/locations/states');
    return res.data;
  },

  getLocations: async () => {
    const res = await api.get('/locations/cities');
    return res.data;
  },

  createLocation: async (data: Record<string, unknown>) => {
    const res = await api.post('/locations/cities', data);
    return res.data;
  },

  // Authentication
  login: async (credentials: Record<string, unknown>) => {
    const res = await api.post('/auth/login/admin', credentials);
    return res.data;
  },
};
