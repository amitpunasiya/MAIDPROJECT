import { get, post, put, patch } from './helpers';
import { ApiResponse, PaginatedData } from './types';
import { IBooking, BookingStatus, ServiceType } from '../../types';

export interface CreateBookingPayload {
  serviceType: ServiceType | string;
  providerId?: string;
  startDate: string;
  endDate?: string;
  timeSlot: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    location?: {
      type: string;
      coordinates: [number, number];
    };
  };
  notes?: string;
  couponCode?: string;
  pricing?: {
    basePrice: number;
    tax: number;
    discount: number;
    totalAmount: number;
  };
  [key: string]: unknown;
}

export interface AvailabilityQueryParams {
  providerId: string;
  date: string;
  timeSlot: string;
  [key: string]: unknown;
}

export const bookingApi = {
  /**
   * Create a new booking
   * POST /bookings
   */
  createBooking(payload: CreateBookingPayload): Promise<ApiResponse<IBooking>> {
    return post<IBooking>('/bookings', payload);
  },

  /**
   * Update booking details
   * PUT /bookings/:id
   */
  updateBooking(id: string, payload: Partial<CreateBookingPayload>): Promise<ApiResponse<IBooking>> {
    return put<IBooking>(`/bookings/${id}`, payload);
  },

  /**
   * Cancel an existing booking
   * PATCH /bookings/:id/cancel
   */
  cancelBooking(id: string, reason?: string): Promise<ApiResponse<IBooking>> {
    return patch<IBooking>(`/bookings/${id}/cancel`, { cancellationReason: reason || 'Customer requested cancellation' });
  },

  /**
   * Get single booking by ID
   * GET /bookings/:id
   */
  getBookingDetails(id: string): Promise<ApiResponse<IBooking>> {
    return get<IBooking>(`/bookings/${id}`);
  },

  /**
   * Get authenticated user booking history
   * GET /bookings/history
   */
  getBookingHistory(params?: { status?: BookingStatus; page?: number; limit?: number }): Promise<ApiResponse<PaginatedData<IBooking>>> {
    return get<PaginatedData<IBooking>>('/bookings/history', params);
  },

  /**
   * Get customer specific booking history
   * GET /bookings/customer/history
   */
  getCustomerHistory(params?: { status?: BookingStatus; page?: number; limit?: number }): Promise<ApiResponse<PaginatedData<IBooking>>> {
    return get<PaginatedData<IBooking>>('/bookings/customer/history', params);
  },

  /**
   * Check provider availability for a date/time
   * GET /bookings/check-availability
   */
  checkAvailability(params: AvailabilityQueryParams): Promise<ApiResponse<{ available: boolean; reason?: string }>> {
    return get<{ available: boolean; reason?: string }>('/bookings/check-availability', params);
  },

  /**
   * Get booking tracking timeline events
   * GET /bookings/:id/timeline
   */
  getBookingTimeline(id: string): Promise<ApiResponse<Array<{ status: string; timestamp: string; note?: string }>>> {
    return get<Array<{ status: string; timestamp: string; note?: string }>>(`/bookings/${id}/timeline`);
  },

  /**
   * Customer ↔ Worker Chat
   */
  getBookingMessages(bookingId: string): Promise<ApiResponse<any[]>> {
    return get<any[]>(`/chat/booking/${bookingId}`);
  },

  sendBookingMessage(bookingId: string, message: string, attachments: string[] = []): Promise<ApiResponse<any>> {
    return post<any>(`/chat/booking/${bookingId}`, { message, attachments });
  },

  /**
   * Reviews & Ratings
   */
  submitReview(bookingId: string, comment: string, scores: { overall: number; punctuality?: number; quality?: number; professionalism?: number }): Promise<ApiResponse<any>> {
    const fullScores = {
      overall: scores.overall,
      punctuality: scores.punctuality || scores.overall,
      quality: scores.quality || scores.overall,
      professionalism: scores.professionalism || scores.overall,
    };
    return post<any>('/reviews', { bookingId, comment, scores: fullScores });
  },

  /**
   * Recurring Bookings
   */
  createRecurringBooking(payload: any): Promise<ApiResponse<any>> {
    return post<any>('/bookings/recurring', payload);
  },

  getRecurringBookings(): Promise<ApiResponse<any[]>> {
    return get<any[]>('/bookings/recurring');
  },

  pauseRecurringBooking(id: string): Promise<ApiResponse<any>> {
    return post<any>(`/bookings/recurring/${id}/pause`, {});
  },

  resumeRecurringBooking(id: string): Promise<ApiResponse<any>> {
    return post<any>(`/bookings/recurring/${id}/resume`, {});
  },

  cancelRecurringBooking(id: string): Promise<ApiResponse<any>> {
    return patch<any>(`/bookings/recurring/${id}`, { status: 'cancelled' });
  },
};

export default bookingApi;
