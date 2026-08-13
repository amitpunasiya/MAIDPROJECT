import type { Request, Response } from 'express';
import { reportsService } from '../services/reports.service.js';
import { invoiceService } from '../../../services/invoice/invoice.service.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiError } from '../../../utils/ApiError.js';

export class ReportsController {
  getDashboard = asyncHandler(async (req: Request, res: Response) => {
    const startDate = req.query.startDate ? new Date(String(req.query.startDate)) : undefined;
    const endDate = req.query.endDate ? new Date(String(req.query.endDate)) : undefined;

    const data = await reportsService.getDashboardReport(startDate, endDate, req.user?.id);
    return ApiResponse.ok(res, 'Reports dashboard analytics retrieved successfully', data);
  });

  getSummary = asyncHandler(async (req: Request, res: Response) => {
    const startDate = req.query.startDate ? new Date(String(req.query.startDate)) : undefined;
    const endDate = req.query.endDate ? new Date(String(req.query.endDate)) : undefined;

    const data = await reportsService.getDashboardReport(startDate, endDate, req.user?.id);
    return ApiResponse.ok(res, 'Analytics summary retrieved successfully', data);
  });

  exportRevenueReportCsv = asyncHandler(async (req: Request, res: Response) => {
    const startDate = req.query.startDate ? new Date(String(req.query.startDate)) : undefined;
    const endDate = req.query.endDate ? new Date(String(req.query.endDate)) : undefined;

    const reportData = await reportsService.getRevenueReportData(startDate, endDate);
    const csv = reportsService.exportToCsv(reportData);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="revenue-report.csv"');
    return res.status(200).send(csv);
  });

  getInvoiceHtml = asyncHandler(async (req: Request, res: Response) => {
    const bookingId = String(req.params.bookingId);
    if (!bookingId) throw ApiError.badRequest('Booking ID is required');

    const html = await invoiceService.generateInvoiceHtml(bookingId);
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
  });
}

export const reportsController = new ReportsController();
