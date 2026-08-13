import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ITrackingState {
  bookingId: string;
  providerName: string;
  providerPhone: string;
  providerAvatar: string;
  etaMinutes: number;
  currentStepIndex: number; // 0 = Accepted, 1 = On the way, 2 = Arrived, 3 = Service Started, 4 = Completed
  liveLocation: { lat: number; lng: number; address: string };
}

const initialState: ITrackingState = {
  bookingId: 'BK-89421',
  providerName: 'Chef Rajesh Sharma',
  providerPhone: '+91 9876543210',
  providerAvatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=300&q=80',
  etaMinutes: 14,
  currentStepIndex: 1, // On The Way
  liveLocation: {
    lat: 12.9172,
    lng: 77.6412,
    address: 'HSR Layout Sector 2, 80 Feet Road, Bengaluru',
  },
};

const trackingSlice = createSlice({
  name: 'tracking',
  initialState,
  reducers: {
    updateTrackingStep: (state, action: PayloadAction<number>) => {
      state.currentStepIndex = action.payload;
    },
    updateEta: (state, action: PayloadAction<number>) => {
      state.etaMinutes = action.payload;
    },
  },
});

export const { updateTrackingStep, updateEta } = trackingSlice.actions;
export default trackingSlice.reducer;
