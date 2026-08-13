import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ISnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

export interface IGlobalModalState {
  open: boolean;
  title: string;
  content: string;
  type?: 'info' | 'confirm' | 'success';
}

interface UiState {
  themeMode: 'light' | 'dark' | 'system';
  snackbar: ISnackbarState;
  modal: IGlobalModalState;
  isOffline: boolean;
}

const initialState: UiState = {
  themeMode: (localStorage.getItem('maidproject_theme') as any) || 'light',
  snackbar: {
    open: false,
    message: '',
    severity: 'info',
  },
  modal: {
    open: false,
    title: '',
    content: '',
  },
  isOffline: !navigator.onLine,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.themeMode = action.payload;
      localStorage.setItem('maidproject_theme', action.payload);
    },
    showSnackbar: (
      state,
      action: PayloadAction<{ message: string; severity?: 'success' | 'error' | 'info' | 'warning' }>
    ) => {
      state.snackbar = {
        open: true,
        message: action.payload.message,
        severity: action.payload.severity || 'info',
      };
    },
    hideSnackbar: (state) => {
      state.snackbar.open = false;
    },
    openGlobalModal: (state, action: PayloadAction<Omit<IGlobalModalState, 'open'>>) => {
      state.modal = {
        open: true,
        ...action.payload,
      };
    },
    closeGlobalModal: (state) => {
      state.modal.open = false;
    },
    setOfflineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOffline = action.payload;
    },
  },
});

export const {
  setThemeMode,
  showSnackbar,
  hideSnackbar,
  openGlobalModal,
  closeGlobalModal,
  setOfflineStatus,
} = uiSlice.actions;

export default uiSlice.reducer;
