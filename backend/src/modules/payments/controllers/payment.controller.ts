import type { Request, Response } from 'express';
import { paymentService } from '../services/payment.service.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiError } from '../../../utils/ApiError.js';
import type {
  CreatePaymentIntentDTO,
  VerifyPaymentDTO,
  ConfirmCodDTO,
  RefundPaymentDTO,
  PaymentFilterDTO,
} from '../interfaces/payment.interface.js';

export class PaymentController {
  createOrder = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    const input = req.body as CreatePaymentIntentDTO;
    const result = await paymentService.createPaymentOrder(req.user.id, input);

    return ApiResponse.created(res, 'Payment order created successfully', result);
  });

  createIntent = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    const input = req.body as CreatePaymentIntentDTO;
    const result = await paymentService.createPaymentOrder(req.user.id, input);

    return ApiResponse.created(res, 'Payment intent created successfully', result);
  });

  verifyPayment = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    const input = req.body as VerifyPaymentDTO;
    const payment = await paymentService.verifyPayment(req.user.id, input);

    return ApiResponse.ok(res, 'Payment verified successfully and booking confirmed', { payment });
  });

  confirmCod = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    const input = req.body as ConfirmCodDTO;
    const payment = await paymentService.confirmCod(req.user.id, input);

    return ApiResponse.ok(res, 'COD payment confirmed', { payment });
  });

  refundPayment = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    const input = req.body as RefundPaymentDTO;
    const payment = await paymentService.refundPayment(req.user.id, input);

    return ApiResponse.ok(res, 'Refund processed successfully', { payment });
  });

  getHistory = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    const filter = req.query as unknown as PaymentFilterDTO;
    const result = await paymentService.getPaymentHistory(req.user.id, filter);

    return ApiResponse.ok(res, 'Payment history retrieved successfully', result);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    const id = req.params.id as string;
    const payment = await paymentService.getPaymentById(id, req.user.id);

    return ApiResponse.ok(res, 'Invoice details retrieved successfully', { payment });
  });
}

export const paymentController = new PaymentController();
