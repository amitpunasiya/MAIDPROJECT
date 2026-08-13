import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { walletApi, IWalletTransactionItem } from '../services/api';

export type IWalletTx = IWalletTransactionItem;

interface WalletState {
  balance: number;
  transactions: IWalletTx[];
  offers: { code: string; discount: number; desc: string }[];
  loading: boolean;
  rechargeLoading: boolean;
  error: string | null;
}

const initialState: WalletState = {
  balance: 2450,
  transactions: [
    { id: 'w-1', title: 'Top-up via UPI GPay', amount: 1000, type: 'credit', timestamp: '2026-08-01', status: 'Completed' },
    { id: 'w-2', title: 'Booking #BK-89421 Paid', amount: 715, type: 'debit', timestamp: '2026-08-01', status: 'Completed' },
    { id: 'w-3', title: 'Referral Bonus Cashback', amount: 200, type: 'credit', timestamp: '2026-07-25', status: 'Completed' },
  ],
  offers: [
    { code: 'WALLET50', discount: 50, desc: 'Get ₹50 cashback on wallet top-up above ₹500' },
    { code: 'FESTIVE100', discount: 100, desc: 'Get ₹100 cashback on festival house cleaning' },
  ],
  loading: false,
  rechargeLoading: false,
  error: null,
};

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const getWalletBalance = createAsyncThunk(
  'wallet/getWalletBalance',
  async (_, { rejectWithValue }) => {
    try {
      const res = await walletApi.getWalletBalance();
      return res.data?.balance ?? 2450;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch wallet balance';
      return rejectWithValue(msg);
    }
  },
);

export const getWalletTransactions = createAsyncThunk(
  'wallet/getWalletTransactions',
  async (params: { page?: number; limit?: number } | undefined, { rejectWithValue }) => {
    try {
      const res = await walletApi.getWalletTransactions(params);
      return res.data?.items || [];
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch wallet transactions';
      return rejectWithValue(msg);
    }
  },
);

export const rechargeWallet = createAsyncThunk(
  'wallet/rechargeWallet',
  async ({ amount, method = 'upi' }: { amount: number; method?: string }, { rejectWithValue }) => {
    try {
      const res = await walletApi.rechargeWallet(amount, method);
      return {
        amount,
        newBalance: res.data?.newBalance,
        transactionId: res.data?.transactionId || `w-${Date.now()}`,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to recharge wallet';
      return rejectWithValue(msg);
    }
  },
);

export const payWithWallet = createAsyncThunk(
  'wallet/payWithWallet',
  async ({ bookingId, amount }: { bookingId: string; amount: number }, { rejectWithValue }) => {
    try {
      const res = await walletApi.payWithWallet(bookingId, amount);
      return {
        bookingId,
        amount,
        newBalance: res.data?.newBalance,
        transactionRef: res.data?.transactionRef || `tx-wallet-${Date.now()}`,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Wallet payment failed';
      return rejectWithValue(msg);
    }
  },
);

// ─── Slice Definition ─────────────────────────────────────────────────────────

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    addMoneyToWallet: (state, action: PayloadAction<number>) => {
      state.balance += action.payload;
      state.transactions.unshift({
        id: `w-${Date.now()}`,
        title: 'Wallet Top-up via UPI',
        amount: action.payload,
        type: 'credit',
        timestamp: new Date().toISOString().split('T')[0],
        status: 'Completed',
      });
    },
    deductFromWallet: (state, action: PayloadAction<{ amount: number; title: string }>) => {
      state.balance -= action.payload.amount;
      state.transactions.unshift({
        id: `w-${Date.now()}`,
        title: action.payload.title,
        amount: action.payload.amount,
        type: 'debit',
        timestamp: new Date().toISOString().split('T')[0],
        status: 'Completed',
      });
    },
  },
  extraReducers: (builder) => {
    // Balance
    builder.addCase(getWalletBalance.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getWalletBalance.fulfilled, (state, action) => {
      state.loading = false;
      if (typeof action.payload === 'number') state.balance = action.payload;
    });
    builder.addCase(getWalletBalance.rejected, (state) => {
      state.loading = false;
    });

    // Transactions
    builder.addCase(getWalletTransactions.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getWalletTransactions.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload && action.payload.length > 0) {
        state.transactions = action.payload;
      }
    });
    builder.addCase(getWalletTransactions.rejected, (state) => {
      state.loading = false;
    });

    // Recharge
    builder.addCase(rechargeWallet.pending, (state) => {
      state.rechargeLoading = true;
      state.error = null;
    });
    builder.addCase(rechargeWallet.fulfilled, (state, action) => {
      state.rechargeLoading = false;
      const added = action.payload.amount;
      state.balance = action.payload.newBalance ?? state.balance + added;
      state.transactions.unshift({
        id: action.payload.transactionId,
        title: 'Wallet Top-up via UPI',
        amount: added,
        type: 'credit',
        timestamp: new Date().toISOString().split('T')[0],
        status: 'Completed',
      });
    });
    builder.addCase(rechargeWallet.rejected, (state, action) => {
      state.rechargeLoading = false;
      state.error = (action.payload as string) || 'Recharge failed';
    });

    // Pay with Wallet
    builder.addCase(payWithWallet.fulfilled, (state, action) => {
      const amt = action.payload.amount;
      state.balance = action.payload.newBalance ?? Math.max(0, state.balance - amt);
      state.transactions.unshift({
        id: action.payload.transactionRef,
        title: `Paid for Booking #${action.payload.bookingId}`,
        amount: amt,
        type: 'debit',
        timestamp: new Date().toISOString().split('T')[0],
        status: 'Completed',
      });
    });
  },
});

export const { addMoneyToWallet, deductFromWallet } = walletSlice.actions;
export default walletSlice.reducer;
