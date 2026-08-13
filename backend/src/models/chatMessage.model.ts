import { Schema, model, type Document, type Types } from 'mongoose';

export interface IChatMessage {
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  bookingId?: Types.ObjectId;
  message: string;
  attachments?: string[];
  isRead: boolean;
  readAt?: Date;
}

export interface IChatMessageDocument extends IChatMessage, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const chatMessageSchema = new Schema<IChatMessageDocument>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', index: true },
    message: { type: String, required: true, trim: true },
    attachments: { type: [String], default: [] },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
  },
  { timestamps: true },
);

chatMessageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
chatMessageSchema.index({ bookingId: 1, createdAt: -1 });

export const ChatMessage = model<IChatMessageDocument>('ChatMessage', chatMessageSchema);
