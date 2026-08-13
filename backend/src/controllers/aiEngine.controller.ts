import type { Request, Response } from 'express';
import { aiEngineService } from '../services/ai/aiEngine.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export class AiEngineController {
  getServiceRecommendations = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const services = await aiEngineService.getRecommendedServices(userId);
    return ApiResponse.ok(res, 'AI service recommendations retrieved', services);
  });

  suggestPrice = asyncHandler(async (req: Request, res: Response) => {
    const { basePrice, city, demandFactor, isWeekend } = req.body;
    const result = await aiEngineService.getPriceSuggestion({
      basePrice: Number(basePrice || 499),
      city: String(city || 'Bengaluru'),
      demandFactor: demandFactor ? Number(demandFactor) : 1.0,
      isWeekend: Boolean(isWeekend),
    });
    return ApiResponse.ok(res, 'AI price suggestion generated', result);
  });

  detectFraud = asyncHandler(async (req: Request, res: Response) => {
    const { customerId, totalAmount, ipAddress } = req.body;
    const result = await aiEngineService.detectBookingFraud({
      customerId: String(customerId || req.user?.id || ''),
      totalAmount: Number(totalAmount || 0),
      ipAddress: ipAddress ? String(ipAddress) : req.ip,
    });
    return ApiResponse.ok(res, 'AI fraud detection analysis complete', result);
  });

  predictDemand = asyncHandler(async (req: Request, res: Response) => {
    const { city, category } = req.query;
    const result = await aiEngineService.predictDemand({
      city: String(city || 'Bengaluru'),
      category: String(category || 'Cleaning'),
    });
    return ApiResponse.ok(res, 'AI demand prediction generated', result);
  });

  analyzeComplaint = asyncHandler(async (req: Request, res: Response) => {
    const { complaintText } = req.body;
    const result = await aiEngineService.analyzeComplaint(String(complaintText || ''));
    return ApiResponse.ok(res, 'AI complaint analysis complete', result);
  });

  assistantChat = asyncHandler(async (req: Request, res: Response) => {
    const { message } = req.body;
    const result = await aiEngineService.assistantChat(String(message || ''));
    return ApiResponse.ok(res, 'AI assistant response generated', result);
  });
}

export const aiEngineController = new AiEngineController();
