import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import bookingReducer from './bookingSlice';
import serviceReducer from './serviceSlice';
import paymentReducer from './paymentSlice';
import walletReducer from './walletSlice';
import notificationReducer from './notificationSlice';
import trackingReducer from './trackingSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    booking: bookingReducer,
    service: serviceReducer,
    payment: paymentReducer,
    wallet: walletReducer,
    notification: notificationReducer,
    tracking: trackingReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
