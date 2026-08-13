import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { paymentApi, IVerifyPaymentPayload, IPaymentHistoryItem, IPaymentOrderResponse, IRefundStatusResponse } from '../services/api';

export type IPaymentRecord = IPaymentHistoryItem;

interface PaymentState {
  lastPayment: IPaymentRecord | null;
  paymentHistory: IPaymentRecord[];
  currentOrder: IPaymentOrderResponse | null;
  refundStatus: IRefundStatusResponse | null;
  isProcessing: boolean;
  historyLoading: boolean;
  refundLoading: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  lastPayment: {
    paymentId: 'PAY-981240',
    bookingId: 'BK-89421',
    amount: 715,
    method: 'upi',
    status: 'SUCCESS',
    timestamp: new Date().toISOString(),
    transactionRef: 'TXN-UPI-8849201',
  },
  paymentHistory: [
    {
      paymentId: 'PAY-981240',
      bookingId: 'BK-89421',
      amount: 715,
      method: 'upi',
      status: 'SUCCESS',
      timestamp: '2026-08-01T10:30:00Z',
      transactionRef: 'TXN-UPI-8849201',
    },
    {
      paymentId: 'PAY-773190',
      bookingId: 'BK-77319',
      amount: 529,
      method: 'card',
      status: 'SUCCESS',
      timestamp: '2026-07-28T14:15:00Z',
      transactionRef: 'TXN-CARD-5541029',
    },
  ],
  currentOrder: null,
  refundStatus: null,
  isProcessing: false,
  historyLoading: false,
  refundLoading: false,
  error: null,
};

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const createPaymentOrder = createAsyncThunk(
  'payment/createPaymentOrder',
  async ({ bookingId, amount, paymentMethod }: { bookingId: string; amount: number; paymentMethod: string }, { rejectWithValue }) => {
    try {
      const res = await paymentApi.createPaymentOrder(bookingId, amount, paymentMethod);
      return res.data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create payment order';
      return rejectWithValue(msg);
    }
  },
);

export const verifyPayment = createAsyncThunk(
  'payment/verifyPayment',
  async (payload: IVerifyPaymentPayload, { rejectWithValue }) => {
    try {
      const res = await paymentApi.verifyPayment(payload);
      return res.data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to verify payment';
      return rejectWithValue(msg);
    }
  },
);

export const getPaymentHistory = createAsyncThunk(
  'payment/getPaymentHistory',
  async (params: { page?: number; limit?: number } | undefined, { rejectWithValue }) => {
    try {
      const res = await paymentApi.getPaymentHistory(params);
      return res.data?.items || [];
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch payment history';
      return rejectWithValue(msg);
    }
  },
);

export const getRefundStatus = createAsyncThunk(
  'payment/getRefundStatus',
  async (paymentId: string, { rejectWithValue }) => {
    try {
      const res = await paymentApi.getRefundStatus(paymentId);
      return res.data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch refund status';
      return rejectWithValue(msg);
    }
  },
);

// ─── Slice Definition ─────────────────────────────────────────────────────────

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    startPaymentProcess: (state) => {
      state.isProcessing = true;
      state.error = null;
    },
    paymentSuccess: (state, action: PayloadAction<IPaymentRecord>) => {
      state.isProcessing = false;
      state.lastPayment = action.payload;
      state.paymentHistory.unshift(action.payload);
    },
    paymentFailed: (state, action: PayloadAction<string>) => {
      state.isProcessing = false;
      state.error = action.payload;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    // Create Order
    builder.addCase(createPaymentOrder.pending, (state) => {
      state.isProcessing = true;
      state.error = null;
    });
    builder.addCase(createPaymentOrder.fulfilled, (state, action) => {
      state.isProcessing = false;
      state.currentOrder = action.payload || null;
    });
    builder.addCase(createPaymentOrder.rejected, (state, action) => {
      state.isProcessing = false;
      state.error = (action.payload as string) || 'Order creation failed';
    });

    // Verify Payment
    builder.addCase(verifyPayment.pending, (state) => {
      state.isProcessing = true;
      state.error = null;
    });
    builder.addCase(verifyPayment.fulfilled, (state, action) => {
      state.isProcessing = false;
      if (action.payload?.verified) {
        const record: IPaymentRecord = {
          paymentId: `PAY-${Date.now()}`,
          bookingId: 'BK-CONFIRMED',
          amount: 715,
          method: 'upi',
          status: 'SUCCESS',
          timestamp: new Date().toISOString(),
          transactionRef: action.payload.transactionRef || `TXN-${Date.now()}`,
        };
        state.lastPayment = record;
        state.paymentHistory.unshift(record);
      }
    });
    builder.addCase(verifyPayment.rejected, (state, action) => {
      state.isProcessing = false;
      state.error = (action.payload as string) || 'Verification failed';
    });

    // History
    builder.addCase(getPaymentHistory.pending, (state) => {
      state.historyLoading = true;
    });
    builder.addCase(getPaymentHistory.fulfilled, (state, action) => {
      state.historyLoading = false;
      if (action.payload && action.payload.length > 0) {
        state.paymentHistory = action.payload;
      }
    });
    builder.addCase(getPaymentHistory.rejected, (state) => {
      state.historyLoading = false;
    });

    // Refund Status
    builder.addCase(getRefundStatus.pending, (state) => {
      state.refundLoading = true;
    });
    builder.addCase(getRefundStatus.fulfilled, (state, action) => {
      state.refundLoading = false;
      state.refundStatus = action.payload || null;
    });
    builder.addCase(getRefundStatus.rejected, (state) => {
      state.refundLoading = false;
    });
  },
});

export const { startPaymentProcess, paymentSuccess, paymentFailed, clearCurrentOrder } = paymentSlice.actions;
export default paymentSlice.reducer;
