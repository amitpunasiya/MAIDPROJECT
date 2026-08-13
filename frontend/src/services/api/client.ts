import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { ApiResponse, ApiErrorResponse, CustomApiError } from './types';

// ─── Environment & Config ─────────────────────────────────────────────────────

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env as Record<string, string>).VITE_API_URL ||
  '/api/v1';

const TIMEOUT_MS = 15000;

// ─── Refresh Queue Types ──────────────────────────────────────────────────────

interface FailedRequestQueueItem {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: FailedRequestQueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ─── Axios Instance ───────────────────────────────────────────────────────────

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

// ─── Request Interceptor ──────────────────────────────────────────────────────

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error),
);

// ─── Response Interceptor ─────────────────────────────────────────────────────

apiClient.interceptors.response.use(
  (response) => {
    // Return backend payload directly
    return response.data;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 1. Network / Timeout Errors
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        return Promise.reject(
          new CustomApiError('Request timed out. Please check your network connection and try again.', 408),
        );
      }
      return Promise.reject(
        new CustomApiError('Network Error: Unable to connect to server. Please verify your internet connection.', 0),
      );
    }

    const status = error.response.status;
    const errorData = error.response.data;

    // 2. Token Refresh Logic on 401 Unauthorized
    const isAuthRequest = originalRequest?.url?.includes('/auth/login') || originalRequest?.url?.includes('/auth/register');

    if (status === 401 && !originalRequest._retry && !isAuthRequest) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh token endpoint
        const response = await axios.post<ApiResponse<{ accessToken: string }>>(
          `${BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true },
        );

        const newAccessToken = response.data?.data?.accessToken;

        if (newAccessToken) {
          localStorage.setItem('accessToken', newAccessToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          processQueue(null, newAccessToken);
          return apiClient(originalRequest);
        } else {
          throw new Error('No access token returned from refresh');
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('demoAuth');

        // Optional event dispatch or page redirect if needed
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.dispatchEvent(new Event('auth:unauthorized'));
        }

        const msg = errorData?.message || 'Session expired. Please log in again.';
        return Promise.reject(new CustomApiError(msg, 401, errorData?.category, errorData?.requestId));
      } finally {
        isRefreshing = false;
      }
    }

    // 3. Structured Backend ApiError Format
    const message = errorData?.message || error.message || 'An unexpected error occurred';
    const customErr = new CustomApiError(
      message,
      status,
      errorData?.category,
      errorData?.requestId,
      errorData?.errors,
    );

    return Promise.reject(customErr);
  },
);

export default apiClient;
