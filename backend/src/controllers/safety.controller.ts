import type { Request, Response } from 'express';
import { safetyService } from '../services/safety/safety.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export class SafetyController {
  createReport = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();

    const { reportedUserId, bookingId, category, description, attachments } = req.body;
    if (!category || !description) {
      throw ApiError.badRequest('Category and description are required for safety reports');
    }

    const report = await safetyService.createReport({
      reporterId: req.user.id,
      reportedUserId,
      bookingId,
      category,
      description,
      attachments,
    });

    return ApiResponse.created(res, 'Safety report submitted successfully', report);
  });

  createDispute = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();

    const { bookingId, reason, description, attachments } = req.body;
    if (!bookingId || !reason || !description) {
      throw ApiError.badRequest('Booking ID, reason, and description are required');
    }

    const dispute = await safetyService.createDispute({
      bookingId,
      openedBy: req.user.id,
      reason,
      description,
      attachments,
    });

    return ApiResponse.created(res, 'Booking dispute opened successfully', dispute);
  });

  getMyReports = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const reports = await safetyService.getMyReports(req.user.id);
    return ApiResponse.ok(res, 'User safety reports retrieved', reports);
  });

  getMyDisputes = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const disputes = await safetyService.getMyDisputes(req.user.id);
    return ApiResponse.ok(res, 'User booking disputes retrieved', disputes);
  });

  // Admin Controller Handlers
  getAllReports = asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.query;
    const reports = await safetyService.getAllReports(status as string);
    return ApiResponse.ok(res, 'All reports retrieved', reports);
  });

  getAllDisputes = asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.query;
    const disputes = await safetyService.getAllDisputes(status as string);
    return ApiResponse.ok(res, 'All disputes retrieved', disputes);
  });

  updateReportStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, adminNotes } = req.body;
    const report = await safetyService.updateReportStatus(String(id), status, adminNotes);
    return ApiResponse.ok(res, 'Report status updated', report);
  });

  updateDisputeStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, resolution, refundAmount } = req.body;
    const dispute = await safetyService.updateDisputeStatus(String(id), status, resolution, refundAmount);
    return ApiResponse.ok(res, 'Dispute status updated', dispute);
  });
}

export const safetyController = new SafetyController();
