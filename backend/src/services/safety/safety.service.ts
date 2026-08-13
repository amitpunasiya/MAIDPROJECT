import { Report } from '../../models/report.model.js';
import { Dispute } from '../../models/dispute.model.js';
import { Booking } from '../../models/booking.model.js';
import { Notification } from '../../models/notification.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { Types } from 'mongoose';

export class SafetyService {
  async createReport(input: {
    reporterId: string;
    reportedUserId?: string;
    bookingId?: string;
    category: string;
    description: string;
    attachments?: string[];
  }) {
    let targetUserId = input.reportedUserId;
    if (!targetUserId && input.bookingId) {
      const booking = await Booking.findById(input.bookingId);
      if (booking) {
        const cId = booking.customerId.toString();
        const wId = booking.cookId.toString();
        targetUserId = input.reporterId === cId ? wId : cId;
      }
    }

    if (!targetUserId) {
      throw ApiError.badRequest('Target user to report must be specified');
    }

    const report = await Report.create({
      reporterId: new Types.ObjectId(input.reporterId),
      reportedUserId: new Types.ObjectId(targetUserId),
      bookingId: input.bookingId ? new Types.ObjectId(input.bookingId) : undefined,
      category: input.category,
      description: input.description,
      attachments: input.attachments || [],
      status: 'pending',
    });

    // Send confirmation to reporter
    await Notification.create({
      userId: new Types.ObjectId(input.reporterId),
      title: 'Safety Report Received 🛡️',
      message: 'Your safety report has been submitted to our support team for immediate review.',
      type: 'system',
    }).catch(() => null);

    return report;
  }

  async createDispute(input: {
    bookingId: string;
    openedBy: string;
    reason: string;
    description: string;
    attachments?: string[];
  }) {
    const booking = await Booking.findById(input.bookingId);
    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    const cId = booking.customerId.toString();
    const wId = booking.cookId.toString();

    if (input.openedBy !== cId && input.openedBy !== wId) {
      throw ApiError.forbidden('Only booking participants can open a dispute');
    }

    const againstUser = input.openedBy === cId ? wId : cId;

    const existingDispute = await Dispute.findOne({
      bookingId: booking._id,
      openedBy: new Types.ObjectId(input.openedBy),
      status: { $in: ['open', 'under_review'] },
    });

    if (existingDispute) {
      throw ApiError.badRequest('An active dispute already exists for this booking');
    }

    const dispute = await Dispute.create({
      bookingId: booking._id,
      openedBy: new Types.ObjectId(input.openedBy),
      againstUser: new Types.ObjectId(againstUser),
      reason: input.reason,
      description: input.description,
      attachments: input.attachments || [],
      status: 'open',
    });

    // Notify other party
    await Notification.create({
      userId: new Types.ObjectId(againstUser),
      title: 'Dispute Opened ⚖️',
      message: `A dispute has been opened for Booking #${booking.bookingNumber}. Reason: ${input.reason}`,
      type: 'booking',
      metadata: { bookingId: input.bookingId },
    }).catch(() => null);

    return dispute;
  }

  async getMyReports(userId: string) {
    return Report.find({ reporterId: new Types.ObjectId(userId) }).sort({ createdAt: -1 });
  }

  async getMyDisputes(userId: string) {
    return Dispute.find({ openedBy: new Types.ObjectId(userId) }).sort({ createdAt: -1 });
  }

  async getAllReports(status?: string) {
    const query: any = {};
    if (status) query.status = status;
    return Report.find(query)
      .populate('reporterId', 'fullName email phone role')
      .populate('reportedUserId', 'fullName email phone role')
      .sort({ createdAt: -1 });
  }

  async getAllDisputes(status?: string) {
    const query: any = {};
    if (status) query.status = status;
    return Dispute.find(query)
      .populate('openedBy', 'fullName email phone role')
      .populate('againstUser', 'fullName email phone role')
      .populate('bookingId')
      .sort({ createdAt: -1 });
  }

  async updateReportStatus(reportId: string, status: string, adminNotes?: string) {
    const report = await Report.findByIdAndUpdate(
      reportId,
      { status, adminNotes },
      { new: true }
    );
    if (!report) throw ApiError.notFound('Report not found');
    return report;
  }

  async updateDisputeStatus(disputeId: string, status: string, resolution?: string, refundAmount?: number) {
    const dispute = await Dispute.findByIdAndUpdate(
      disputeId,
      { status, resolution, refundAmount },
      { new: true }
    );
    if (!dispute) throw ApiError.notFound('Dispute not found');

    // Notify user
    await Notification.create({
      userId: dispute.openedBy,
      title: 'Dispute Resolved ⚖️',
      message: `Your dispute resolution: ${resolution || status}`,
      type: 'booking',
    }).catch(() => null);

    return dispute;
  }
}

export const safetyService = new SafetyService();
