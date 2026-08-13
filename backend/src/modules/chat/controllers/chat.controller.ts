import type { Request, Response } from 'express';
import { chatService } from '../services/chat.service.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiError } from '../../../utils/ApiError.js';

export class ChatController {
  sendMessage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const { receiverId, bookingId, message, attachments } = req.body;
    if (!receiverId || !message) {
      throw ApiError.badRequest('receiverId and message are required');
    }

    const result = await chatService.sendMessage({
      senderId: req.user.id,
      receiverId,
      bookingId,
      message,
      attachments,
    });

    return ApiResponse.created(res, 'Message sent successfully', result);
  });

  getConversation = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const { userId } = req.params;
    const { page, limit } = req.query;

    const result = await chatService.getConversation({
      userId1: req.user.id,
      userId2: String(userId),
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 50,
    });

    return ApiResponse.ok(res, 'Conversation retrieved successfully', result);
  });

  getBookingMessages = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const { bookingId } = req.params;
    const messages = await chatService.getBookingMessages(String(bookingId), req.user.id);
    return ApiResponse.ok(res, 'Booking messages retrieved', messages);
  });

  sendBookingMessage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const { bookingId } = req.params;
    const { message, attachments } = req.body;
    if (!message) {
      throw ApiError.badRequest('Message content is required');
    }

    const result = await chatService.sendBookingMessage(String(bookingId), req.user.id, message, attachments || []);
    return ApiResponse.created(res, 'Booking message sent', result);
  });
}

export const chatController = new ChatController();
