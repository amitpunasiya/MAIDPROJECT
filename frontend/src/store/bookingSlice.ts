import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { IBookingSearchFilters, ServiceType, IBookingRecord, BookingStatus, ICookProfile, IMaidProfile, IBooking } from '../types';
import { bookingApi, couponApi, CreateBookingPayload, ICoupon } from '../services/api';

export interface IBookingDraft {
  serviceCategory: 'cook' | 'maid' | 'cleaning' | 'babycare' | 'eldercare';
  selectedProvider: ICookProfile | IMaidProfile | null;
  selectedAddress: string;
  city: string;
  pincode: string;
  selectedDate: string;
  selectedSlot: string;
  workingHours: number;
  couponCode: string;
  couponDiscount: number;
  specialInstructions: string;
  paymentMethod: 'upi' | 'card' | 'debit' | 'cash';
  taskName?: string;
  taskDetails?: Record<string, any>;
  photos?: string[];
}

const INITIAL_MOCK_BOOKINGS: IBookingRecord[] = [
  {
    id: 'bk-101',
    bookingIdNumber: 'BK-89421',
    serviceType: 'cook',
    providerId: 'cook-1',
    providerName: 'Chef Rajesh Sharma',
    providerAvatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=300&q=80',
    providerRating: 4.9,
    customerName: 'Aarav Mehta',
    phone: '9876543210',
    address: 'Flat 402, Sunshine Apartments, HSR Layout Sector 2',
    city: 'Bengaluru',
    pincode: '560102',
    date: '2026-08-05',
    timeSlot: '08:00 AM - 10:00 AM',
    workingHours: 2,
    specialInstructions: 'Please make food less spicy with olive oil.',
    paymentMethod: 'upi',
    paymentStatus: 'paid',
    serviceCharge: 600,
    platformFee: 49,
    gstAmount: 116,
    discountAmount: 50,
    totalAmount: 715,
    status: BookingStatus.CONFIRMED,
    createdAt: '2026-08-01',
  },
  {
    id: 'bk-102',
    bookingIdNumber: 'BK-77319',
    serviceType: 'maid',
    providerId: 'maid-1',
    providerName: 'Sunita Devi',
    providerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    providerRating: 4.8,
    customerName: 'Aarav Mehta',
    phone: '9876543210',
    address: 'Flat 402, Sunshine Apartments, HSR Layout Sector 2',
    city: 'Bengaluru',
    pincode: '560102',
    date: '2026-07-28',
    timeSlot: '11:00 AM - 01:00 PM',
    workingHours: 2,
    specialInstructions: 'Deep clean balcony floor.',
    paymentMethod: 'card',
    paymentStatus: 'paid',
    serviceCharge: 400,
    platformFee: 49,
    gstAmount: 80,
    discountAmount: 0,
    totalAmount: 529,
    status: BookingStatus.COMPLETED,
    createdAt: '2026-07-25',
  },
  {
    id: 'bk-103',
    bookingIdNumber: 'BK-62104',
    serviceType: 'cook',
    providerId: 'cook-2',
    providerName: 'Priya Sundaram',
    providerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    providerRating: 4.95,
    customerName: 'Aarav Mehta',
    phone: '9876543210',
    address: 'Flat 402, Sunshine Apartments, HSR Layout Sector 2',
    city: 'Bengaluru',
    pincode: '560102',
    date: '2026-07-20',
    timeSlot: '07:00 PM - 09:00 PM',
    workingHours: 2,
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    serviceCharge: 700,
    platformFee: 49,
    gstAmount: 134,
    discountAmount: 0,
    totalAmount: 883,
    status: BookingStatus.CANCELLED,
    createdAt: '2026-07-18',
  },
];

const INITIAL_DRAFT: IBookingDraft = {
  serviceCategory: 'cook',
  selectedProvider: null,
  selectedAddress: 'Flat 402, Sunshine Apartments, HSR Layout Sector 2',
  city: 'Bengaluru',
  pincode: '560102',
  selectedDate: '2026-08-05',
  selectedSlot: '08:00 AM - 10:00 AM (Morning)',
  workingHours: 2,
  couponCode: '',
  couponDiscount: 0,
  specialInstructions: '',
  paymentMethod: 'upi',
};

interface BookingState {
  filters: IBookingSearchFilters;
  selectedProviderId: string | null;
  selectedProviderType: ServiceType | null;
  activeBookingId: string | null;
  selectedBooking: IBooking | IBookingRecord | null;
  lastCreatedBooking: IBookingRecord | null;
  currentDraft: IBookingDraft;
  bookings: IBookingRecord[];
  activeCoupons: ICoupon[];

  // Timeline & Availability
  timeline: Array<{ status: string; timestamp: string; note?: string }>;
  isAvailable: boolean | null;

  // Status flags
  loading: boolean;
  historyLoading: boolean;
  timelineLoading: boolean;
  couponLoading: boolean;
  error: string | null;
  couponError: string | null;
}

const initialState: BookingState = {
  filters: {
    serviceType: 'all',
    city: 'Bengaluru',
  },
  selectedProviderId: null,
  selectedProviderType: null,
  activeBookingId: null,
  selectedBooking: null,
  lastCreatedBooking: null,
  currentDraft: INITIAL_DRAFT,
  bookings: INITIAL_MOCK_BOOKINGS,
  activeCoupons: [],
  timeline: [],
  isAvailable: null,

  loading: false,
  historyLoading: false,
  timelineLoading: false,
  couponLoading: false,
  error: null,
  couponError: null,
};

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const createBooking = createAsyncThunk(
  'booking/createBooking',
  async (payload: CreateBookingPayload, { rejectWithValue }) => {
    try {
      const res = await bookingApi.createBooking(payload);
      return res.data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create booking';
      return rejectWithValue(msg);
    }
  },
);

export const getBookingHistory = createAsyncThunk(
  'booking/getBookingHistory',
  async (params: { status?: BookingStatus; page?: number; limit?: number } | undefined, { rejectWithValue }) => {
    try {
      const res = await bookingApi.getBookingHistory(params);
      return res.data?.items || [];
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch booking history';
      return rejectWithValue(msg);
    }
  },
);

export const getBookingDetails = createAsyncThunk(
  'booking/getBookingDetails',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await bookingApi.getBookingDetails(id);
      return res.data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch booking details';
      return rejectWithValue(msg);
    }
  },
);

export const cancelBookingApi = createAsyncThunk(
  'booking/cancelBookingApi',
  async ({ id, reason }: { id: string; reason?: string }, { rejectWithValue }) => {
    try {
      const res = await bookingApi.cancelBooking(id, reason);
      return res.data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to cancel booking';
      return rejectWithValue(msg);
    }
  },
);

export const checkAvailability = createAsyncThunk(
  'booking/checkAvailability',
  async (params: { providerId: string; date: string; timeSlot: string }, { rejectWithValue }) => {
    try {
      const res = await bookingApi.checkAvailability(params);
      return res.data?.available ?? true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to check availability';
      return rejectWithValue(msg);
    }
  },
);

export const getActiveCoupons = createAsyncThunk(
  'booking/getActiveCoupons',
  async (_, { rejectWithValue }) => {
    try {
      const res = await couponApi.getActiveCoupons();
      return res.data || [];
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch active coupons';
      return rejectWithValue(msg);
    }
  },
);

export const applyCoupon = createAsyncThunk(
  'booking/applyCoupon',
  async ({ code, bookingAmount }: { code: string; bookingAmount: number }, { rejectWithValue }) => {
    try {
      const res = await couponApi.applyCoupon(code, bookingAmount);
      if (!res.data) throw new Error('Invalid coupon payload');
      return res.data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid or expired coupon code';
      return rejectWithValue(msg);
    }
  },
);

export const getBookingTimeline = createAsyncThunk(
  'booking/getBookingTimeline',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await bookingApi.getBookingTimeline(id);
      return res.data || [];
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch booking timeline';
      return rejectWithValue(msg);
    }
  },
);

// ─── Booking Slice ────────────────────────────────────────────────────────────

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<IBookingSearchFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = { serviceType: 'all', city: 'Bengaluru' };
    },
    selectProvider: (
      state,
      action: PayloadAction<{ id: string; type: ServiceType }>,
    ) => {
      state.selectedProviderId = action.payload.id;
      state.selectedProviderType = action.payload.type;
    },
    clearSelectedProvider: (state) => {
      state.selectedProviderId = null;
      state.selectedProviderType = null;
    },
    setActiveBookingId: (state, action: PayloadAction<string | null>) => {
      state.activeBookingId = action.payload;
    },

    // Draft Actions
    setDraftCategory: (state, action: PayloadAction<'cook' | 'maid' | 'cleaning' | 'babycare' | 'eldercare'>) => {
      state.currentDraft.serviceCategory = action.payload;
    },
    setDraftProvider: (state, action: PayloadAction<ICookProfile | IMaidProfile | null>) => {
      state.currentDraft.selectedProvider = action.payload;
    },
    setDraftAddress: (state, action: PayloadAction<{ address: string; city: string; pincode: string }>) => {
      state.currentDraft.selectedAddress = action.payload.address;
      state.currentDraft.city = action.payload.city;
      state.currentDraft.pincode = action.payload.pincode;
    },
    setDraftDateTime: (state, action: PayloadAction<{ date: string; slot: string; hours?: number }>) => {
      state.currentDraft.selectedDate = action.payload.date;
      state.currentDraft.selectedSlot = action.payload.slot;
      if (action.payload.hours) state.currentDraft.workingHours = action.payload.hours;
    },
    setDraftCoupon: (state, action: PayloadAction<{ code: string; discount: number }>) => {
      state.currentDraft.couponCode = action.payload.code;
      state.currentDraft.couponDiscount = action.payload.discount;
    },
    setDraftTaskDetails: (state, action: PayloadAction<{ taskName?: string; details?: Record<string, any> }>) => {
      if (action.payload.taskName) state.currentDraft.taskName = action.payload.taskName;
      if (action.payload.details) state.currentDraft.taskDetails = action.payload.details;
    },
    setDraftPhotos: (state, action: PayloadAction<string[]>) => {
      state.currentDraft.photos = action.payload;
    },
    setDraftPaymentMethod: (state, action: PayloadAction<'upi' | 'card' | 'debit' | 'cash'>) => {
      state.currentDraft.paymentMethod = action.payload;
    },
    setDraftSpecialInstructions: (state, action: PayloadAction<string>) => {
      state.currentDraft.specialInstructions = action.payload;
    },
    resetDraft: (state) => {
      state.currentDraft = INITIAL_DRAFT;
    },

    // Synchronous Orders & Booking Actions (Fallback & Compatibility)
    addBooking: (state, action: PayloadAction<IBookingRecord>) => {
      state.bookings.unshift(action.payload);
      state.lastCreatedBooking = action.payload;
    },
    cancelBooking: (state, action: PayloadAction<string>) => {
      const found = state.bookings.find((b) => b.id === action.payload);
      if (found) {
        found.status = BookingStatus.CANCELLED;
      }
    },
    rescheduleBooking: (state, action: PayloadAction<{ id: string; date: string; slot: string }>) => {
      const found = state.bookings.find((b) => b.id === action.payload.id);
      if (found) {
        found.date = action.payload.date;
        found.timeSlot = action.payload.slot;
        found.status = BookingStatus.CONFIRMED;
      }
    },
    rebookBooking: (state, action: PayloadAction<string>) => {
      const found = state.bookings.find((b) => b.id === action.payload);
      if (found) {
        const newBooking: IBookingRecord = {
          ...found,
          id: `bk-${Date.now()}`,
          bookingIdNumber: `BK-${Math.floor(10000 + Math.random() * 90000)}`,
          status: BookingStatus.CONFIRMED,
          createdAt: new Date().toISOString().split('T')[0],
        };
        state.bookings.unshift(newBooking);
        state.lastCreatedBooking = newBooking;
      }
    },
  },
  extraReducers: (builder) => {
    // Create Booking
    builder.addCase(createBooking.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createBooking.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload) {
        state.selectedBooking = action.payload;
        const newRecord: IBookingRecord = {
          id: action.payload.id || `bk-${Date.now()}`,
          bookingIdNumber: `BK-${Math.floor(10000 + Math.random() * 90000)}`,
          serviceType: (action.payload.serviceType as any) || 'cook',
          providerId: action.payload.providerId || 'cook-1',
          providerName: state.currentDraft.selectedProvider?.name || 'Assigned Partner',
          providerAvatar: state.currentDraft.selectedProvider?.avatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=300&q=80',
          providerRating: state.currentDraft.selectedProvider?.averageRating || 4.8,
          customerName: 'Customer',
          phone: '9876543210',
          address: state.currentDraft.selectedAddress,
          city: state.currentDraft.city,
          pincode: state.currentDraft.pincode,
          date: state.currentDraft.selectedDate,
          timeSlot: state.currentDraft.selectedSlot,
          workingHours: state.currentDraft.workingHours,
          specialInstructions: state.currentDraft.specialInstructions,
          paymentMethod: state.currentDraft.paymentMethod,
          paymentStatus: 'paid',
          serviceCharge: (action.payload as any)?.pricing?.basePrice || 600,
          platformFee: 49,
          gstAmount: (action.payload as any)?.pricing?.tax || 116,
          discountAmount: state.currentDraft.couponDiscount,
          totalAmount: (action.payload as any)?.pricing?.totalAmount || 715,
          status: BookingStatus.CONFIRMED,
          createdAt: new Date().toISOString().split('T')[0],
        };
        state.bookings.unshift(newRecord);
        state.lastCreatedBooking = newRecord;
      }
    });
    builder.addCase(createBooking.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || 'Booking creation failed';
    });

    // Get History
    builder.addCase(getBookingHistory.pending, (state) => {
      state.historyLoading = true;
    });
    builder.addCase(getBookingHistory.fulfilled, (state, action) => {
      state.historyLoading = false;
      if (action.payload && action.payload.length > 0) {
        const mapped = action.payload.map((b: any) => ({
          id: b.id || b._id,
          bookingIdNumber: `BK-${(b.id || b._id).slice(-5).toUpperCase()}`,
          serviceType: b.serviceType || 'cook',
          providerId: b.providerId || 'cook-1',
          providerName: b.providerName || 'Staff Partner',
          providerAvatar: b.providerAvatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=300&q=80',
          providerRating: 4.8,
          customerName: b.customerName || 'Customer',
          phone: b.phone || '9876543210',
          address: typeof b.address === 'string' ? b.address : `${b.address?.street || ''}, ${b.address?.city || ''}`,
          city: b.address?.city || 'Bengaluru',
          pincode: b.address?.zipCode || '560102',
          date: b.startDate ? new Date(b.startDate).toISOString().split('T')[0] : '2026-08-05',
          timeSlot: b.timeSlot || '08:00 AM - 10:00 AM',
          workingHours: 2,
          paymentMethod: b.paymentMethod || 'upi',
          paymentStatus: b.paymentStatus || 'paid',
          serviceCharge: b.pricing?.basePrice || 500,
          platformFee: 49,
          gstAmount: b.pricing?.tax || 90,
          discountAmount: b.pricing?.discount || 0,
          totalAmount: b.pricing?.totalAmount || 639,
          status: (b.status as BookingStatus) || BookingStatus.CONFIRMED,
          createdAt: b.createdAt ? new Date(b.createdAt).toISOString().split('T')[0] : '2026-08-01',
        }));
        state.bookings = mapped;
      }
    });
    builder.addCase(getBookingHistory.rejected, (state, action) => {
      state.historyLoading = false;
      state.error = (action.payload as string) || 'Failed to load booking history';
    });

    // Get Details
    builder.addCase(getBookingDetails.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getBookingDetails.fulfilled, (state, action) => {
      state.loading = false;
      state.selectedBooking = action.payload || null;
    });
    builder.addCase(getBookingDetails.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || 'Failed to load booking details';
    });

    // Cancel Booking API
    builder.addCase(cancelBookingApi.fulfilled, (state, action) => {
      const targetId = action.payload?.id;
      if (targetId) {
        const found = state.bookings.find((b) => b.id === targetId);
        if (found) found.status = BookingStatus.CANCELLED;
      }
    });

    // Apply Coupon
    builder.addCase(applyCoupon.pending, (state) => {
      state.couponLoading = true;
      state.couponError = null;
    });
    builder.addCase(applyCoupon.fulfilled, (state, action) => {
      state.couponLoading = false;
      if (action.payload) {
        state.currentDraft.couponCode = action.payload.coupon.code;
        state.currentDraft.couponDiscount = action.payload.discountAmount;
      }
    });
    builder.addCase(applyCoupon.rejected, (state, action) => {
      state.couponLoading = false;
      state.couponError = (action.payload as string) || 'Coupon application failed';
    });

    // Active Coupons
    builder.addCase(getActiveCoupons.fulfilled, (state, action) => {
      state.activeCoupons = action.payload;
    });

    // Timeline
    builder.addCase(getBookingTimeline.pending, (state) => {
      state.timelineLoading = true;
    });
    builder.addCase(getBookingTimeline.fulfilled, (state, action) => {
      state.timelineLoading = false;
      state.timeline = action.payload;
    });
    builder.addCase(getBookingTimeline.rejected, (state) => {
      state.timelineLoading = false;
    });
  },
});

export const {
  setFilters,
  resetFilters,
  selectProvider,
  clearSelectedProvider,
  setActiveBookingId,
  setDraftCategory,
  setDraftProvider,
  setDraftAddress,
  setDraftDateTime,
  setDraftCoupon,
  setDraftTaskDetails,
  setDraftPhotos,
  setDraftPaymentMethod,
  setDraftSpecialInstructions,
  resetDraft,
  addBooking,
  cancelBooking,
  rescheduleBooking,
  rebookBooking,
} = bookingSlice.actions;

export default bookingSlice.reducer;
