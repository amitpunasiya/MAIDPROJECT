import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { notificationApi } from '../services/api';

export interface INotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: 'booking' | 'payment' | 'promo' | 'system';
}

interface NotificationState {
  items: INotificationItem[];
  filter: 'all' | 'booking' | 'payment' | 'promo' | 'system';
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  items: [],
  filter: 'all',
  loading: false,
  error: null,
};

export const fetchNotifications = createAsyncThunk(
  'notification/fetchNotifications',
  async (params?: { page?: number; limit?: number; unreadOnly?: boolean }) => {
    const res = await notificationApi.getNotifications(params);
    // Support both paginated data or raw array from backend
    const items = Array.isArray(res.data)
      ? res.data
      : res.data?.items || (res.data as any)?.docs || [];
    return items;
  }
);

export const markNotificationReadApi = createAsyncThunk(
  'notification/markReadApi',
  async (id: string) => {
    await notificationApi.markAsRead(id);
    return id;
  }
);

export const markAllNotificationsReadApi = createAsyncThunk(
  'notification/markAllReadApi',
  async () => {
    await notificationApi.markAllAsRead();
    return true;
  }
);

export const deleteNotificationApi = createAsyncThunk(
  'notification/deleteApi',
  async (id: string) => {
    await notificationApi.deleteNotification(id);
    return id;
  }
);

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    markAsRead: (state, action: PayloadAction<string>) => {
      const item = state.items.find((i) => i.id === action.payload);
      if (item) item.read = true;
    },
    markAllAsRead: (state) => {
      state.items.forEach((i) => (i.read = true));
    },
    deleteNotification: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    setNotificationFilter: (state, action: PayloadAction<'all' | 'booking' | 'payment' | 'promo' | 'system'>) => {
      state.filter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.map((item: any) => ({
          id: item.id || item._id,
          title: item.title || 'Notification',
          message: item.message || item.body || '',
          timestamp: item.timestamp || (item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Just now'),
          read: typeof item.read === 'boolean' ? item.read : (typeof item.isRead === 'boolean' ? item.isRead : false),
          category: (item.category || item.type || 'system').includes('booking')
            ? 'booking'
            : (item.category || item.type || '').includes('payment') || (item.category || item.type || '').includes('wallet')
            ? 'payment'
            : (item.category || item.type || '').includes('promo')
            ? 'promo'
            : 'system',
        }));
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load notifications';
      })
      .addCase(markNotificationReadApi.fulfilled, (state, action) => {
        const item = state.items.find((i) => i.id === action.payload);
        if (item) item.read = true;
      })
      .addCase(markAllNotificationsReadApi.fulfilled, (state) => {
        state.items.forEach((i) => (i.read = true));
      })
      .addCase(deleteNotificationApi.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i.id !== action.payload);
      });
  },
});

export const { markAsRead, markAllAsRead, deleteNotification, setNotificationFilter } = notificationSlice.actions;
export default notificationSlice.reducer;
