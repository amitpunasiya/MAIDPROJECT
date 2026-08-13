import type { IChatMessageDocument } from '../../../models/chatMessage.model.js';

export interface SendMessageDTO {
  senderId: string;
  receiverId: string;
  bookingId?: string;
  message: string;
  attachments?: string[];
}

export interface GetConversationDTO {
  userId1: string;
  userId2: string;
  page?: number;
  limit?: number;
}

export type { IChatMessageDocument };
