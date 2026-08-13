import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { IUser } from '../types';
import {
  authApi,
  LoginPayload,
  RegisterPayload,
  VerifyOtpPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  ChangePasswordPayload,
  UpdateProfilePayload,
  AuthUser,
} from '../services/api/auth.api';

// ─── State Interface ──────────────────────────────────────────────────────────

export interface AuthState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  otpStatus: 'idle' | 'loading' | 'sent' | 'verified' | 'failed';
  profileStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
}

// ─── LocalStorage Persistence Helpers ─────────────────────────────────────────

const getSavedUser = (): IUser | null => {
  try {
    const saved = localStorage.getItem('authUser');
    if (saved) return JSON.parse(saved) as IUser;
  } catch {
    // ignore parse errors
  }
  return null;
};

const savedToken = localStorage.getItem('accessToken') || null;
const savedUser = getSavedUser();

const initialState: AuthState = {
  user: savedUser,
  token: savedToken,
  isAuthenticated: !!(savedToken || localStorage.getItem('demoAuth')),
  loading: false,
  error: null,
  otpStatus: 'idle',
  profileStatus: 'idle',
};

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const res = await authApi.login(payload);
      if (!res.data) throw new Error(res.message || 'Login failed');
      return res.data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      return rejectWithValue(msg);
    }
  },
);

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (payload: RegisterPayload, { rejectWithValue }) => {
    try {
      const res = await authApi.register(payload);
      if (!res.data) throw new Error(res.message || 'Registration failed');
      return res.data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      return rejectWithValue(msg);
    }
  },
);

export const sendOtpThunk = createAsyncThunk(
  'auth/sendOtp',
  async (phone: string, { rejectWithValue }) => {
    try {
      const res = await authApi.sendOtp(phone);
      return res.data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send OTP';
      return rejectWithValue(msg);
    }
  },
);

export const verifyOtpThunk = createAsyncThunk(
  'auth/verifyOtp',
  async (payload: VerifyOtpPayload, { rejectWithValue }) => {
    try {
      const res = await authApi.verifyOtp(payload);
      if (!res.data) throw new Error(res.message || 'OTP verification failed');
      return res.data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'OTP verification failed';
      return rejectWithValue(msg);
    }
  },
);

export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout();
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Logout failed';
      return rejectWithValue(msg);
    }
  },
);

export const logoutAllThunk = createAsyncThunk(
  'auth/logoutAll',
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logoutAll();
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Logout all failed';
      return rejectWithValue(msg);
    }
  },
);

export const forgotPasswordThunk = createAsyncThunk(
  'auth/forgotPassword',
  async (payload: ForgotPasswordPayload, { rejectWithValue }) => {
    try {
      const res = await authApi.forgotPassword(payload);
      return res.data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Password reset request failed';
      return rejectWithValue(msg);
    }
  },
);

export const resetPasswordThunk = createAsyncThunk(
  'auth/resetPassword',
  async (payload: ResetPasswordPayload, { rejectWithValue }) => {
    try {
      const res = await authApi.resetPassword(payload);
      return res.data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Password reset failed';
      return rejectWithValue(msg);
    }
  },
);

export const changePasswordThunk = createAsyncThunk(
  'auth/changePassword',
  async (payload: ChangePasswordPayload, { rejectWithValue }) => {
    try {
      const res = await authApi.changePassword(payload);
      return res.data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Password change failed';
      return rejectWithValue(msg);
    }
  },
);

export const getProfileThunk = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const res = await authApi.getProfile();
      if (!res.data?.user) throw new Error('Profile not found');
      return res.data.user;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load profile';
      return rejectWithValue(msg);
    }
  },
);

export const updateProfileThunk = createAsyncThunk(
  'auth/updateProfile',
  async (payload: UpdateProfilePayload, { rejectWithValue }) => {
    try {
      const res = await authApi.updateProfile(payload);
      if (!res.data?.user) throw new Error('Profile update failed');
      return res.data.user;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile';
      return rejectWithValue(msg);
    }
  },
);

export const refreshTokenThunk = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const res = await authApi.refreshToken();
      if (!res.data?.accessToken) throw new Error('Token refresh failed');
      return res.data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Token refresh failed';
      return rejectWithValue(msg);
    }
  },
);

// Helper mapper for AuthUser -> IUser
const mapAuthUser = (user: AuthUser): IUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  city: user.city,
  avatar: user.avatar,
});

// Helper for saving auth state to localStorage
const saveAuthToStorage = (user: IUser, token: string) => {
  localStorage.setItem('accessToken', token);
  localStorage.setItem('authUser', JSON.stringify(user));
  localStorage.setItem('demoAuth', 'true');
};

// Helper for clearing auth state from localStorage
const clearAuthStorage = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('authUser');
  localStorage.removeItem('demoAuth');
};

// ─── Auth Slice ───────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{ user: IUser; token: string }>,
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
      saveAuthToStorage(action.payload.user, action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.otpStatus = 'idle';
      state.profileStatus = 'idle';
      clearAuthStorage();
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearOtpStatus: (state) => {
      state.otpStatus = 'idle';
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── Login ──
    builder.addCase(loginThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginThunk.fulfilled, (state, action) => {
      state.loading = false;
      const mappedUser = mapAuthUser(action.payload.user);
      state.user = mappedUser;
      state.token = action.payload.accessToken;
      state.isAuthenticated = true;
      saveAuthToStorage(mappedUser, action.payload.accessToken);
    });
    builder.addCase(loginThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || 'Login failed';
    });

    // ── Register ──
    builder.addCase(registerThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(registerThunk.fulfilled, (state, action) => {
      state.loading = false;
      const mappedUser = mapAuthUser(action.payload.user);
      state.user = mappedUser;
      state.token = action.payload.accessToken;
      state.isAuthenticated = true;
      saveAuthToStorage(mappedUser, action.payload.accessToken);
    });
    builder.addCase(registerThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || 'Registration failed';
    });

    // ── Send OTP ──
    builder.addCase(sendOtpThunk.pending, (state) => {
      state.otpStatus = 'loading';
      state.error = null;
    });
    builder.addCase(sendOtpThunk.fulfilled, (state) => {
      state.otpStatus = 'sent';
    });
    builder.addCase(sendOtpThunk.rejected, (state, action) => {
      state.otpStatus = 'failed';
      state.error = (action.payload as string) || 'Failed to send OTP';
    });

    // ── Verify OTP ──
    builder.addCase(verifyOtpThunk.pending, (state) => {
      state.otpStatus = 'loading';
      state.error = null;
    });
    builder.addCase(verifyOtpThunk.fulfilled, (state, action) => {
      state.otpStatus = 'verified';
      const mappedUser = mapAuthUser(action.payload.user);
      state.user = mappedUser;
      state.token = action.payload.accessToken;
      state.isAuthenticated = true;
      saveAuthToStorage(mappedUser, action.payload.accessToken);
    });
    builder.addCase(verifyOtpThunk.rejected, (state, action) => {
      state.otpStatus = 'failed';
      state.error = (action.payload as string) || 'OTP verification failed';
    });

    // ── Logout ──
    builder.addCase(logoutThunk.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.otpStatus = 'idle';
      state.profileStatus = 'idle';
      clearAuthStorage();
    });
    builder.addCase(logoutThunk.rejected, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      clearAuthStorage();
    });

    // ── Logout All ──
    builder.addCase(logoutAllThunk.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      clearAuthStorage();
    });

    // ── Forgot Password ──
    builder.addCase(forgotPasswordThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(forgotPasswordThunk.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(forgotPasswordThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || 'Request failed';
    });

    // ── Reset Password ──
    builder.addCase(resetPasswordThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(resetPasswordThunk.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(resetPasswordThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || 'Reset failed';
    });

    // ── Change Password ──
    builder.addCase(changePasswordThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(changePasswordThunk.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(changePasswordThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || 'Change failed';
    });

    // ── Get Profile ──
    builder.addCase(getProfileThunk.pending, (state) => {
      state.profileStatus = 'loading';
    });
    builder.addCase(getProfileThunk.fulfilled, (state, action) => {
      state.profileStatus = 'succeeded';
      const mappedUser = mapAuthUser(action.payload);
      state.user = mappedUser;
      if (state.token) {
        saveAuthToStorage(mappedUser, state.token);
      }
    });
    builder.addCase(getProfileThunk.rejected, (state, action) => {
      state.profileStatus = 'failed';
      state.error = (action.payload as string) || 'Failed to load profile';
    });

    // ── Update Profile ──
    builder.addCase(updateProfileThunk.pending, (state) => {
      state.profileStatus = 'loading';
      state.error = null;
    });
    builder.addCase(updateProfileThunk.fulfilled, (state, action) => {
      state.profileStatus = 'succeeded';
      const mappedUser = mapAuthUser(action.payload);
      state.user = mappedUser;
      if (state.token) {
        saveAuthToStorage(mappedUser, state.token);
      }
    });
    builder.addCase(updateProfileThunk.rejected, (state, action) => {
      state.profileStatus = 'failed';
      state.error = (action.payload as string) || 'Profile update failed';
    });

    // ── Refresh Token ──
    builder.addCase(refreshTokenThunk.fulfilled, (state, action) => {
      if (action.payload?.accessToken) {
        state.token = action.payload.accessToken;
        localStorage.setItem('accessToken', action.payload.accessToken);
      }
    });
    builder.addCase(refreshTokenThunk.rejected, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      clearAuthStorage();
    });
  },
});

export const {
  loginSuccess,
  logout,
  setAuthLoading,
  setAuthError,
  clearOtpStatus,
  clearAuthError,
} = authSlice.actions;

export default authSlice.reducer;
