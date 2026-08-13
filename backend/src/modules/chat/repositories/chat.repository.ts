import { ChatMessage, type IChatMessageDocument } from '../../../models/chatMessage.model.js';
import { Types } from 'mongoose';

export class ChatRepository {
  async create(data: Partial<IChatMessageDocument>): Promise<IChatMessageDocument> {
    return ChatMessage.create(data);
  }

  async getConversation(userId1: string, userId2: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const objId1 = new Types.ObjectId(userId1);
    const objId2 = new Types.ObjectId(userId2);

    const query = {
      $or: [
        { senderId: objId1, receiverId: objId2 },
        { senderId: objId2, receiverId: objId1 },
      ],
    };

    const [items, total] = await Promise.all([
      ChatMessage.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      ChatMessage.countDocuments(query),
    ]);

    return {
      items: items.reverse(),
      total,
      page,
      limit,
    };
  }

  async markAsRead(receiverId: string, senderId: string): Promise<void> {
    await ChatMessage.updateMany(
      {
        receiverId: new Types.ObjectId(receiverId),
        senderId: new Types.ObjectId(senderId),
        isRead: false,
      },
      {
        $set: { isRead: true, readAt: new Date() },
      },
    );
  }
}

export const chatRepository = new ChatRepository();
