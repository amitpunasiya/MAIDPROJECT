import { AxiosRequestConfig } from 'axios';
import apiClient from './client';
import { ApiResponse } from './types';

/**
 * Typed HTTP GET Helper
 */
export async function get<T>(
  url: string,
  params?: Record<string, unknown>,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  return (apiClient.get(url, { ...config, params }) as unknown) as Promise<ApiResponse<T>>;
}

/**
 * Typed HTTP POST Helper
 */
export async function post<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  return (apiClient.post(url, data, config) as unknown) as Promise<ApiResponse<T>>;
}

/**
 * Typed HTTP PUT Helper
 */
export async function put<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  return (apiClient.put(url, data, config) as unknown) as Promise<ApiResponse<T>>;
}

/**
 * Typed HTTP PATCH Helper
 */
export async function patch<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  return (apiClient.patch(url, data, config) as unknown) as Promise<ApiResponse<T>>;
}

/**
 * Typed HTTP DELETE Helper
 */
export async function del<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  return (apiClient.delete(url, config) as unknown) as Promise<ApiResponse<T>>;
}

/**
 * Typed Multipart File Upload Helper
 */
export async function upload<T>(
  url: string,
  formData: FormData,
  onUploadProgress?: (progress: number) => void,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  return (apiClient.post(url, formData, {
    ...config,
    headers: {
      'Content-Type': 'multipart/form-data',
      ...config?.headers,
    },
    onUploadProgress: (progressEvent) => {
      if (onUploadProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress(percentCompleted);
      }
    },
  }) as unknown) as Promise<ApiResponse<T>>;
}
