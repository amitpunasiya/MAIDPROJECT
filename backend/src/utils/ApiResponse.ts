import type { Response } from 'express';

interface ApiResponsePayload<T> {
  success: boolean;
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export class ApiResponse {
  static success<T>(
    res: Response,
    statusCode: number,
    message: string,
    data?: T,
    meta?: Record<string, unknown>,
  ): Response {
    const payload: ApiResponsePayload<T> = {
      success: true,
      message,
      ...(data !== undefined && { data }),
      ...(meta && { meta }),
    };
    return res.status(statusCode).json(payload);
  }

  static created<T>(res: Response, message: string, data?: T): Response {
    return ApiResponse.success(res, 201, message, data);
  }

  static ok<T>(res: Response, message: string, data?: T): Response {
    return ApiResponse.success(res, 200, message, data);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }
}
