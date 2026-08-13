import { BaseRepository } from '../../../repositories/base.repository.js';
import { Payment, type IPaymentDocument } from '../../../models/payment.model.js';
import type { FilterQuery } from 'mongoose';

export class PaymentRepository extends BaseRepository<IPaymentDocument> {
  constructor() {
    super(Payment);
  }

  async findByInvoiceNumber(invoiceNumber: string): Promise<IPaymentDocument | null> {
    return this.findOne({ invoiceNumber: invoiceNumber.toUpperCase() });
  }

  async findByBookingId(bookingId: string): Promise<IPaymentDocument | null> {
    return this.findOne({ bookingId });
  }

  async findUserPaymentHistory(
    userId: string,
    filter: { paymentStatus?: string; paymentMethod?: string; page?: number; limit?: number },
  ) {
    const page = Math.max(1, filter.page ?? 1);
    const limit = Math.min(100, Math.max(1, filter.limit ?? 20));
    const skip = (page - 1) * limit;

    const query: FilterQuery<IPaymentDocument> = {
      userId,
      isDeleted: { $ne: true },
    };

    if (filter.paymentStatus) {
      query.paymentStatus = filter.paymentStatus;
    }
    if (filter.paymentMethod) {
      query.paymentMethod = filter.paymentMethod;
    }

    const [items, total] = await Promise.all([
      this.model
        .find(query)
        .populate('bookingId', 'bookingNumber scheduledDate status serviceType')
        .populate('providerId', 'name email phone avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.model.countDocuments(query),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

export const paymentRepository = new PaymentRepository();
