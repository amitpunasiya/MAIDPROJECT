import { useAppDispatch, useAppSelector } from './useAppStore';
import {
  loginSuccess,
  logout as logoutAction,
  loginThunk,
  registerThunk,
  sendOtpThunk,
  verifyOtpThunk,
  forgotPasswordThunk,
  resetPasswordThunk,
  changePasswordThunk,
  getProfileThunk,
  updateProfileThunk,
  logoutThunk,
  logoutAllThunk,
  clearAuthError as clearAuthErrorAction,
  clearOtpStatus as clearOtpStatusAction,
} from '../store/authSlice';
import { IUser, UserRole } from '../types';
import {
  LoginPayload,
  RegisterPayload,
  VerifyOtpPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  ChangePasswordPayload,
  UpdateProfilePayload,
} from '../services/api';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated, loading, error, otpStatus, profileStatus } =
    useAppSelector((state) => state.auth);

  const loginDemoUser = (role: UserRole = UserRole.CUSTOMER) => {
    const demoUser: IUser = {
      id: role === UserRole.COOK ? 'cook-demo-1' : role === UserRole.MAID ? 'maid-demo-1' : 'cust-demo-1',
      name: role === UserRole.COOK ? 'Ramesh Cook' : role === UserRole.MAID ? 'Sunita Maid' : 'Anita Customer',
      email: `${role}@example.com`,
      phone: '+919876543210',
      role,
      city: 'Bengaluru',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    };
    dispatch(loginSuccess({ user: demoUser, token: 'mock-jwt-token-12345' }));
  };

  const login = async (payload: LoginPayload) => {
    return dispatch(loginThunk(payload)).unwrap();
  };

  const register = async (payload: RegisterPayload) => {
    return dispatch(registerThunk(payload)).unwrap();
  };

  const sendOtp = async (phone: string) => {
    return dispatch(sendOtpThunk(phone)).unwrap();
  };

  const verifyOtp = async (payload: VerifyOtpPayload) => {
    return dispatch(verifyOtpThunk(payload)).unwrap();
  };

  const forgotPassword = async (payload: ForgotPasswordPayload) => {
    return dispatch(forgotPasswordThunk(payload)).unwrap();
  };

  const resetPassword = async (payload: ResetPasswordPayload) => {
    return dispatch(resetPasswordThunk(payload)).unwrap();
  };

  const changePassword = async (payload: ChangePasswordPayload) => {
    return dispatch(changePasswordThunk(payload)).unwrap();
  };

  const getProfile = async () => {
    return dispatch(getProfileThunk()).unwrap();
  };

  const updateProfile = async (payload: UpdateProfilePayload) => {
    return dispatch(updateProfileThunk(payload)).unwrap();
  };

  const logout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
    } catch {
      dispatch(logoutAction());
    }
  };

  const logoutAll = async () => {
    try {
      await dispatch(logoutAllThunk()).unwrap();
    } catch {
      dispatch(logoutAction());
    }
  };

  const clearError = () => {
    dispatch(clearAuthErrorAction());
  };

  const clearOtp = () => {
    dispatch(clearOtpStatusAction());
  };

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    otpStatus,
    profileStatus,
    login,
    register,
    sendOtp,
    verifyOtp,
    forgotPassword,
    resetPassword,
    changePassword,
    getProfile,
    updateProfile,
    logout,
    logoutAll,
    loginDemoUser,
    clearError,
    clearOtp,
  };
};

export default useAuth;
