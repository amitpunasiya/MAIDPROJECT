import { chatRepository } from '../repositories/chat.repository.js';
import type { SendMessageDTO, GetConversationDTO } from '../interfaces/chat.interface.js';
import { ChatMessage } from '../../../models/chatMessage.model.js';
import { Booking } from '../../../models/booking.model.js';
import { Notification } from '../../../models/notification.model.js';
import { ApiError } from '../../../utils/ApiError.js';
import { Types } from 'mongoose';

export class ChatService {
  async sendMessage(input: SendMessageDTO) {
    return chatRepository.create({
      senderId: new Types.ObjectId(input.senderId),
      receiverId: new Types.ObjectId(input.receiverId),
      bookingId: input.bookingId ? new Types.ObjectId(input.bookingId) : undefined,
      message: input.message,
      attachments: input.attachments ?? [],
    });
  }

  async getConversation(input: GetConversationDTO) {
    await chatRepository.markAsRead(input.userId1, input.userId2);
    return chatRepository.getConversation(input.userId1, input.userId2, input.page, input.limit);
  }

  async getBookingMessages(bookingId: string, requestingUserId: string) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    const cId = booking.customerId.toString();
    const wId = booking.cookId.toString();

    if (requestingUserId !== cId && requestingUserId !== wId) {
      throw ApiError.forbidden('You are not authorized to view messages for this booking');
    }

    const messages = await ChatMessage.find({ bookingId: new Types.ObjectId(bookingId) })
      .sort({ createdAt: 1 })
      .lean();

    return messages;
  }

  async sendBookingMessage(bookingId: string, senderId: string, message: string, attachments: string[] = []) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    const cId = booking.customerId.toString();
    const wId = booking.cookId.toString();

    if (senderId !== cId && senderId !== wId) {
      throw ApiError.forbidden('You are not authorized to send messages for this booking');
    }

    const receiverId = senderId === cId ? wId : cId;

    const chatMsg = await ChatMessage.create({
      senderId: new Types.ObjectId(senderId),
      receiverId: new Types.ObjectId(receiverId),
      bookingId: new Types.ObjectId(bookingId),
      message,
      attachments,
      isRead: false,
    });

    // Create Notification for recipient
    await Notification.create({
      userId: new Types.ObjectId(receiverId),
      title: 'New Booking Message 💬',
      message: `You received a message: "${message.slice(0, 50)}${message.length > 50 ? '...' : ''}"`,
      type: 'chat',
      metadata: { bookingId, senderId },
    }).catch(() => null);

    return chatMsg;
  }
}

export const chatService = new ChatService();
