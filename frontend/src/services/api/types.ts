/**
 * API Response & Error Types matching Backend API Contracts
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    [key: string]: unknown;
  };
  requestId?: string;
  category?: string;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  category?: string;
  requestId?: string;
  errors?: Record<string, string[]>;
  stack?: string;
}

export class CustomApiError extends Error {
  public readonly statusCode: number;
  public readonly category?: string;
  public readonly requestId?: string;
  public readonly errors?: Record<string, string[]>;

  constructor(
    message: string,
    statusCode = 500,
    category?: string,
    requestId?: string,
    errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'CustomApiError';
    this.statusCode = statusCode;
    this.category = category;
    this.requestId = requestId;
    this.errors = errors;
    Object.setPrototypeOf(this, CustomApiError.prototype);
  }
}
