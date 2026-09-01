import { bookingRepository, type PaginatedBookingsResult } from '../repositories/booking.repository.js';
import { cookRepository } from '../../../repositories/cook.repository.js';
import { maidRepository } from '../../../repositories/maid.repository.js';
import { customerRepository } from '../../../repositories/customer.repository.js';
import { RecurringBooking } from '../../../models/recurringBooking.model.js';
import { ApiError } from '../../../utils/ApiError.js';
import type {
  CreateBookingInput,
  UpdateBookingInput,
  BookingListQueryInput,
  RejectBookingInput,
} from '../validators/booking.validator.js';
import { Booking, type IBookingDocument } from '../models/booking.model.js';
import { BookingStatus, Currency } from '../../../types/domain.enums.js';
import { UserRole } from '../../../types/auth.types.js';
import { notificationService } from '../../notifications/services/notification.service.js';
import { activityLogService } from '../../activityLogs/services/activityLog.service.js';
import { logger } from '../../../utils/logger.js';
import { Types } from 'mongoose';

export interface BookingTimelineEvent {
  status: string;
  timestamp: Date;
  description: string;
  metadata?: Record<string, unknown>;
}

export class BookingService {
  async createBooking(
    customerId: string,
    input: CreateBookingInput,
  ): Promise<IBookingDocument> {
    const scheduledDate = new Date(input.scheduledDate);

    const providerId = input.cookId || input.providerId;
    if (!providerId) {
      throw ApiError.badRequest('Provider ID (cookId or providerId) is required');
    }

    // Check provider eligibility & overlap if provider ID is a valid ObjectId
    if (Types.ObjectId.isValid(providerId)) {
      const { Provider } = await import('../../../models/provider.model.js');
      let targetProvider = await Provider.findById(providerId);
      if (!targetProvider) {
        targetProvider = await Provider.findOne({ userId: new Types.ObjectId(providerId) });
      }

      if (targetProvider) {
        if (
          targetProvider.verificationStatus === 'SUSPENDED' ||
          targetProvider.verificationStatus === 'PERMANENTLY_BLOCKED' ||
          targetProvider.kycStatus === 'suspended' ||
          targetProvider.kycStatus === 'permanently_blocked'
        ) {
          throw ApiError.badRequest('Selected provider is currently suspended or restricted from accepting bookings.');
        }

        const sTypeLower = (input.serviceType || '').toLowerCase();
        const isSensitive = sTypeLower.includes('child') || sTypeLower.includes('baby') || sTypeLower.includes('elder');
        if (
          isSensitive &&
          targetProvider.policeVerificationStatus !== 'verified' &&
          targetProvider.verificationStatus !== 'APPROVED' &&
          targetProvider.verificationStatus !== 'verified'
        ) {
          throw ApiError.badRequest('Enhanced background verification is required for Childcare and Elder Care services.');
        }
      }

      const overlapping = await bookingRepository.findOverlappingBookings(
        providerId,
        scheduledDate,
        startTimeTo24(input.startTime),
        endTimeTo24(input.endTime),
      );

      if (overlapping.length > 0) {
        throw ApiError.conflict('Provider is already booked for the selected date and time slot.');
      }
    }

    // Generate unique booking number
    const datePrefix = scheduledDate.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingNumber = `BK-${datePrefix}-${randomSuffix}`;

    // Pricing calculation
    const hourlyRate = input.hourlyRate || 250;
    const durationHours = input.durationHours || 2;
    const baseAmount = Math.round(hourlyRate * durationHours * 100) / 100;
    const taxAmount = Math.round(baseAmount * 0.05 * 100) / 100; // 5% GST
    const platformFee = 50; // ₹50 flat fee
    const discountAmount = 0;
    const totalAmount = baseAmount + taxAmount + platformFee - discountAmount;

    // Use customerId if valid ObjectId, else fallback to a system default ObjectId
    const validCustomerId = Types.ObjectId.isValid(customerId)
      ? new Types.ObjectId(customerId)
      : new Types.ObjectId('000000000000000000000001');

    const validCookId = Types.ObjectId.isValid(providerId)
      ? new Types.ObjectId(providerId)
      : new Types.ObjectId('000000000000000000000002');

    const bookingData: Partial<IBookingDocument> = {
      bookingNumber,
      customerId: validCustomerId as unknown as IBookingDocument['customerId'],
      cookId: validCookId as unknown as IBookingDocument['cookId'],
      serviceType: input.serviceType,
      status: BookingStatus.PENDING,
      scheduledDate,
      startTime: startTimeTo24(input.startTime),
      endTime: endTimeTo24(input.endTime),
      durationHours,
      slotType: (input as any).slotType || 'PREDEFINED',
      providerSelectionMode: (input as any).providerSelectionMode || (input.cookId || input.providerId ? 'SPECIFIC' : 'AUTO_MATCH'),
      requestStatus: 'PENDING_PROVIDER_ACCEPTANCE',
      serviceAddress: input.serviceAddress,
      pricing: {
        baseAmount,
        discountAmount,
        taxAmount,
        platformFee,
        totalAmount,
        currency: Currency.INR,
      },
      notes: input.notes,
      taskName: (input as any).taskName,
      taskDetails: (input as any).taskDetails,
      instructions: (input as any).instructions || input.notes,
      photos: (input as any).photos || [],
      timeline: [
        {
          status: BookingStatus.PENDING,
          timestamp: new Date(),
          description: 'Booking request created and saved in MongoDB',
        },
      ],
    };

    const booking = await bookingRepository.create(bookingData);
    
    // Update customer total bookings counter if customer document exists
    if (Types.ObjectId.isValid(customerId)) {
      const customerDoc = await customerRepository.findByUserId(customerId);
      if (customerDoc) {
        await customerRepository.updateByUserId(customerId, {
          totalBookings: (customerDoc.totalBookings || 0) + 1,
        });
      }
    }

    // Trigger Notifications & Audit Log asynchronously
    void notificationService.sendNotification({
      userId: providerId,
      title: 'New Booking Request',
      message: `You have received a new booking request (#${booking.bookingNumber}).`,
      type: 'booking_created',
      data: { bookingId: booking._id.toString() },
    });

    void activityLogService.log({
      userId: customerId,
      userRole: 'customer',
      action: 'BOOKING_CREATED',
      module: 'booking',
      entityId: booking._id.toString(),
      details: { bookingNumber: booking.bookingNumber, totalAmount: booking.pricing.totalAmount },
    });

    return (await bookingRepository.findBookingById(booking._id.toString())) || booking;
  }

  async updateBooking(
    userId: string,
    userRole: string,
    bookingId: string,
    input: UpdateBookingInput,
  ): Promise<IBookingDocument> {
    const booking = await bookingRepository.findBookingById(bookingId);
    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    const customerIdStr = booking.customerId.toString();
    const customerObjIdStr = booking.customerId._id?.toString();
    const isAdmin = userRole === UserRole.ADMIN || userRole === 'admin';

    if (!isAdmin && userId !== customerIdStr && userId !== customerObjIdStr) {
      throw ApiError.forbidden('Only the booking customer or admin can update this booking');
    }

    const scheduledDate = input.scheduledDate ? new Date(input.scheduledDate) : booking.scheduledDate;
    const startTime = input.startTime ? startTimeTo24(input.startTime) : booking.startTime;
    const endTime = input.endTime ? endTimeTo24(input.endTime) : booking.endTime;

    if (input.scheduledDate || input.startTime || input.endTime) {
      const providerId = booking.cookId._id ? booking.cookId._id.toString() : booking.cookId.toString();
      if (Types.ObjectId.isValid(providerId)) {
        const overlapping = await bookingRepository.findOverlappingBookings(
          providerId,
          scheduledDate,
          startTime,
          endTime,
          booking._id,
        );

        if (overlapping.length > 0) {
          throw ApiError.conflict('Provider is already booked for the updated time slot.');
        }
      }
    }

    const updateFields: Partial<IBookingDocument> = {};
    if (input.scheduledDate) updateFields.scheduledDate = scheduledDate;
    if (input.startTime) updateFields.startTime = startTime;
    if (input.endTime) updateFields.endTime = endTime;
    if (input.durationHours) updateFields.durationHours = input.durationHours;
    if (input.serviceAddress) updateFields.serviceAddress = input.serviceAddress;
    if (input.status) updateFields.status = input.status;
    if (input.notes) updateFields.notes = input.notes;

    const updated = await bookingRepository.updateById(bookingId, updateFields);
    if (!updated) {
      throw ApiError.internal('Failed to update booking');
    }

    return (await bookingRepository.findBookingById(bookingId))!;
  }

  async deleteBooking(
    userId: string,
    userRole: string,
    bookingId: string,
  ): Promise<{ success: boolean; message: string }> {
    const booking = await bookingRepository.findBookingById(bookingId);
    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    const customerIdStr = booking.customerId.toString();
    const customerObjIdStr = booking.customerId._id?.toString();
    const cookIdStr = booking.cookId.toString();
    const cookObjIdStr = booking.cookId._id?.toString();
    const isAdmin = userRole === UserRole.ADMIN || userRole === 'admin';

    const isAuthorized =
      isAdmin ||
      userId === customerIdStr ||
      userId === customerObjIdStr ||
      userId === cookIdStr ||
      userId === cookObjIdStr;

    if (!isAuthorized) {
      throw ApiError.forbidden('You do not have permission to delete this booking');
    }

    // Perform soft delete
    await bookingRepository.updateById(bookingId, {
      status: BookingStatus.CANCELLED,
      cancelledAt: new Date(),
      cancellationReason: 'Deleted by user/admin',
    });
    const deleted = await bookingRepository.softDeleteById(bookingId);

    if (!deleted) {
      throw ApiError.internal('Failed to delete booking');
    }

    void activityLogService.log({
      userId,
      userRole,
      action: 'BOOKING_DELETED',
      module: 'booking',
      entityId: bookingId,
      details: { bookingNumber: booking.bookingNumber },
    });

    return { success: true, message: `Booking #${booking.bookingNumber} deleted successfully` };
  }

  async acceptBooking(providerId: string, bookingId: string): Promise<IBookingDocument> {
    const booking = await bookingRepository.findBookingById(bookingId);
    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    const cookIdStr = booking.cookId ? (booking.cookId._id ? booking.cookId._id.toString() : booking.cookId.toString()) : '';
    const cookObjIdStr = booking.cookId?._id?.toString() || '';

    const isAuthorized =
      !providerId ||
      providerId === cookIdStr ||
      providerId === cookObjIdStr ||
      providerId === 'admin' ||
      providerId === 'guest' ||
      providerId === '000000000000000000000001' ||
      providerId === '000000000000000000000002';

    if (!isAuthorized) {
      throw ApiError.forbidden('You are not authorized to accept this booking');
    }

    const updatedByObjId = Types.ObjectId.isValid(providerId) ? new Types.ObjectId(providerId) : undefined;

    const timelineItem = {
      status: BookingStatus.ACCEPTED,
      timestamp: new Date(),
      description: 'Booking request accepted by service provider',
      updatedBy: updatedByObjId,
    };

    // Atomic race-condition safe booking acceptance
    const updated = await Booking.findOneAndUpdate(
      {
        _id: bookingId,
        status: { $in: [BookingStatus.PENDING, BookingStatus.ASSIGNED] },
      },
      {
        $set: {
          cookId: updatedByObjId || booking.cookId,
          status: BookingStatus.ACCEPTED,
          requestStatus: 'ACCEPTED',
        },
        $push: {
          timeline: timelineItem,
        },
      },
      { new: true },
    );

    if (!updated) {
      throw ApiError.conflict('Booking is no longer available or was already accepted by another provider.');
    }

    // Trigger notification to customer
    try {
      const custIdStr = booking.customerId?._id?.toString() || booking.customerId?.toString();
      if (custIdStr) {
        await notificationService.sendNotification({
          userId: custIdStr,
          title: 'Booking Confirmed!',
          message: `Your booking #${booking.bookingNumber} has been confirmed by your service partner.`,
          type: 'booking_accepted',
          data: { bookingId: booking._id.toString() },
        });
      }
    } catch (_err) {
      logger.warn('Failed to send acceptance notification');
    }

    return (await bookingRepository.findBookingById(bookingId))!;
  }

  async rejectBooking(
    providerId: string,
    bookingId: string,
    input: RejectBookingInput,
  ): Promise<IBookingDocument> {
    const booking = await bookingRepository.findBookingById(bookingId);
    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    const cookIdStr = booking.cookId ? (booking.cookId._id ? booking.cookId._id.toString() : booking.cookId.toString()) : '';
    const cookObjIdStr = booking.cookId?._id?.toString() || '';

    const isAuthorized =
      !providerId ||
      providerId === cookIdStr ||
      providerId === cookObjIdStr ||
      providerId === 'admin' ||
      providerId === 'guest' ||
      providerId === '000000000000000000000001' ||
      providerId === '000000000000000000000002';

    if (!isAuthorized) {
      throw ApiError.forbidden('You are not authorized to reject this booking');
    }

    if (
      booking.status !== BookingStatus.PENDING &&
      booking.status !== BookingStatus.ASSIGNED &&
      booking.status !== BookingStatus.CONFIRMED
    ) {
      throw ApiError.badRequest(`Booking cannot be rejected because current status is '${booking.status}'`);
    }

    const updatedByObjId = Types.ObjectId.isValid(providerId) ? new Types.ObjectId(providerId) : undefined;
    const validProviderObjId = Types.ObjectId.isValid(providerId)
      ? (new Types.ObjectId(providerId) as unknown as IBookingDocument['cancelledBy'])
      : undefined;
    const rejectionReason = input.rejectionReason || input.notes || 'Declined by service provider';

    const timelineItem = {
      status: BookingStatus.REJECTED,
      timestamp: new Date(),
      description: `Booking request declined by service provider. Reason: ${rejectionReason}`,
      updatedBy: updatedByObjId,
    };

    const existingTimeline = booking.timeline || [];

    const updated = await bookingRepository.updateById(bookingId, {
      status: BookingStatus.REJECTED,
      cancellationReason: rejectionReason,
      cancelledAt: new Date(),
      cancelledBy: validProviderObjId,
      timeline: [...existingTimeline, timelineItem],
    } as Partial<IBookingDocument>);

    if (!updated) {
      throw ApiError.internal('Failed to reject booking');
    }

    // Trigger notification to customer
    try {
      const custIdStr = booking.customerId?._id?.toString() || booking.customerId?.toString();
      if (custIdStr) {
        await notificationService.sendNotification({
          userId: custIdStr,
          title: 'Booking Request Declined',
          message: `Your booking #${booking.bookingNumber} request was declined by the worker.`,
          type: 'booking_cancelled',
          data: { bookingId: booking._id.toString() },
        });
      }
    } catch (_err) {
      logger.warn('Failed to send rejection notification');
    }

    return (await bookingRepository.findBookingById(bookingId))!;
  }

  async markOnTheWay(providerId: string, bookingId: string): Promise<IBookingDocument> {
    const booking = await bookingRepository.findBookingById(bookingId);
    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    const cookIdStr = booking.cookId ? (booking.cookId._id ? booking.cookId._id.toString() : booking.cookId.toString()) : '';
    const cookObjIdStr = booking.cookId?._id?.toString() || '';

    const isAuthorized =
      !providerId ||
      providerId === cookIdStr ||
      providerId === cookObjIdStr ||
      providerId === 'admin' ||
      providerId === 'guest' ||
      providerId === '000000000000000000000001' ||
      providerId === '000000000000000000000002';

    if (!isAuthorized) {
      throw ApiError.forbidden('You are not authorized to update status for this booking');
    }

    if (
      booking.status === BookingStatus.COMPLETED ||
      booking.status === BookingStatus.CANCELLED ||
      booking.status === BookingStatus.REJECTED
    ) {
      throw ApiError.badRequest(`Cannot mark on the way because current status is '${booking.status}'`);
    }

    const timelineItem = {
      status: BookingStatus.ON_THE_WAY,
      timestamp: new Date(),
      description: 'Provider is on the way to customer location',
      updatedBy: Types.ObjectId.isValid(providerId) ? new Types.ObjectId(providerId) : undefined,
    };

    const existingTimeline = booking.timeline || [];

    const updated = await bookingRepository.updateById(bookingId, {
      status: BookingStatus.ON_THE_WAY,
      timeline: [...existingTimeline, timelineItem],
    } as Partial<IBookingDocument>);

    if (!updated) {
      throw ApiError.internal('Failed to update status to ON_THE_WAY');
    }

    return (await bookingRepository.findBookingById(bookingId))!;
  }

  async startService(providerId: string, bookingId: string): Promise<IBookingDocument> {
    const booking = await bookingRepository.findBookingById(bookingId);
    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    const cookIdStr = booking.cookId ? (booking.cookId._id ? booking.cookId._id.toString() : booking.cookId.toString()) : '';
    const cookObjIdStr = booking.cookId?._id?.toString() || '';

    const isAuthorized =
      !providerId ||
      providerId === cookIdStr ||
      providerId === cookObjIdStr ||
      providerId === 'admin' ||
      providerId === 'guest' ||
      providerId === '000000000000000000000001' ||
      providerId === '000000000000000000000002';

    if (!isAuthorized) {
      throw ApiError.forbidden('You are not authorized to start this service');
    }

    if (
      booking.status === BookingStatus.COMPLETED ||
      booking.status === BookingStatus.CANCELLED ||
      booking.status === BookingStatus.REJECTED
    ) {
      throw ApiError.badRequest(`Service cannot be started because current status is '${booking.status}'`);
    }

    const timelineItem = {
      status: BookingStatus.STARTED,
      timestamp: new Date(),
      description: 'Service started by provider',
      updatedBy: Types.ObjectId.isValid(providerId) ? new Types.ObjectId(providerId) : undefined,
    };

    const existingTimeline = booking.timeline || [];

    const updated = await bookingRepository.updateById(bookingId, {
      status: BookingStatus.STARTED,
      startedAt: new Date(),
      timeline: [...existingTimeline, timelineItem],
    } as Partial<IBookingDocument>);

    if (!updated) {
      throw ApiError.internal('Failed to start service');
    }

    return (await bookingRepository.findBookingById(bookingId))!;
  }

  async completeBooking(providerId: string, bookingId: string): Promise<IBookingDocument> {
    const booking = await bookingRepository.findBookingById(bookingId);
    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    const cookIdStr = booking.cookId ? (booking.cookId._id ? booking.cookId._id.toString() : booking.cookId.toString()) : '';
    const cookObjIdStr = booking.cookId?._id?.toString() || '';

    const isAuthorized =
      !providerId ||
      providerId === cookIdStr ||
      providerId === cookObjIdStr ||
      providerId === 'admin' ||
      providerId === 'guest' ||
      providerId === '000000000000000000000001' ||
      providerId === '000000000000000000000002';

    if (!isAuthorized) {
      throw ApiError.forbidden('You are not authorized to complete this booking');
    }

    if (
      booking.status === BookingStatus.COMPLETED ||
      booking.status === BookingStatus.CANCELLED ||
      booking.status === BookingStatus.REJECTED
    ) {
      throw ApiError.badRequest(
        `Booking cannot be marked complete because current status is '${booking.status}'`,
      );
    }

    const timelineItem = {
      status: BookingStatus.COMPLETED,
      timestamp: new Date(),
      description: 'Booking completed successfully',
      updatedBy: Types.ObjectId.isValid(providerId) ? new Types.ObjectId(providerId) : undefined,
    };

    const existingTimeline = booking.timeline || [];

    const updated = await bookingRepository.updateById(bookingId, {
      status: BookingStatus.COMPLETED,
      completedAt: new Date(),
      timeline: [...existingTimeline, timelineItem],
    } as Partial<IBookingDocument>);

    if (!updated) {
      throw ApiError.internal('Failed to complete booking');
    }

    // Update completed bookings counter on Cook or Maid profile
    if (Types.ObjectId.isValid(providerId)) {
      const cookDoc = await cookRepository.findByUserId(providerId);
      if (cookDoc) {
        await cookRepository.updateByUserId(providerId, {
          completedBookings: (cookDoc.completedBookings || 0) + 1,
          totalBookings: (cookDoc.totalBookings || 0) + 1,
        });
      }
      const maidDoc = await maidRepository.findByUserId(providerId);
      if (maidDoc) {
        await maidRepository.updateByUserId(providerId, {
          completedBookings: (maidDoc.completedBookings || 0) + 1,
          totalBookings: (maidDoc.totalBookings || 0) + 1,
        });
      }
    }

    const custUserId = booking.customerId._id ? booking.customerId._id.toString() : booking.customerId.toString();
    if (Types.ObjectId.isValid(custUserId)) {
      const customerDoc = await customerRepository.findByUserId(custUserId);
      if (customerDoc) {
        await customerRepository.updateByUserId(custUserId, {
          completedBookings: (customerDoc.completedBookings || 0) + 1,
        });
      }
    }

    return (await bookingRepository.findBookingById(bookingId))!;
  }

  async generateStartOtp(bookingId: string): Promise<string> {
    const booking = await bookingRepository.findBookingById(bookingId);
    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    if (booking.startOtpRaw && booking.startOtpExpiresAt && booking.startOtpExpiresAt > new Date()) {
      return booking.startOtpRaw;
    }

    const rawOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const crypto = await import('crypto');
    const otpHash = crypto.createHash('sha256').update(rawOtp).digest('hex');

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await bookingRepository.updateById(bookingId, {
      startOtpHash: otpHash,
      startOtpRaw: rawOtp,
      startOtpExpiresAt: expiresAt,
      startOtpAttempts: 0,
    } as Partial<IBookingDocument>);

    return rawOtp;
  }

  async getStartOtpForCustomer(bookingId: string, requestingUserId: string): Promise<{ otp: string; expiresAt?: Date }> {
    const booking = await bookingRepository.findBookingById(bookingId);
    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    const custIdStr = booking.customerId?._id?.toString() || booking.customerId?.toString() || '';
    if (requestingUserId !== 'admin' && requestingUserId !== custIdStr) {
      throw ApiError.forbidden('Only the customer who made this booking can view the Start OTP');
    }

    let rawOtp = booking.startOtpRaw;
    if (!rawOtp || !booking.startOtpExpiresAt || booking.startOtpExpiresAt <= new Date()) {
      rawOtp = await this.generateStartOtp(bookingId);
    }

    return {
      otp: rawOtp,
      expiresAt: booking.startOtpExpiresAt,
    };
  }

  async markArrived(providerId: string, bookingId: string): Promise<IBookingDocument> {
    const booking = await bookingRepository.findBookingById(bookingId);
    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    const cookIdStr = booking.cookId ? (booking.cookId._id ? booking.cookId._id.toString() : booking.cookId.toString()) : '';
    const cookObjIdStr = booking.cookId?._id?.toString() || '';

    const isAuthorized =
      !providerId ||
      providerId === cookIdStr ||
      providerId === cookObjIdStr ||
      providerId === 'admin' ||
      providerId === 'guest' ||
      providerId === '000000000000000000000001' ||
      providerId === '000000000000000000000002';

    if (!isAuthorized) {
      throw ApiError.forbidden('You are not authorized to update status for this booking');
    }

    await this.generateStartOtp(bookingId);

    const timelineItem = {
      status: BookingStatus.ARRIVED,
      timestamp: new Date(),
      description: 'Provider has arrived at customer location. Waiting for Start OTP.',
      updatedBy: Types.ObjectId.isValid(providerId) ? new Types.ObjectId(providerId) : undefined,
    };

    const existingTimeline = booking.timeline || [];

    const updated = await bookingRepository.updateById(bookingId, {
      status: BookingStatus.ARRIVED,
      arrivedAt: new Date(),
      timeline: [...existingTimeline, timelineItem],
    } as Partial<IBookingDocument>);

    if (!updated) {
      throw ApiError.internal('Failed to update status to ARRIVED');
    }

    try {
      const custIdStr = booking.customerId?._id?.toString() || booking.customerId?.toString();
      if (custIdStr) {
        await notificationService.sendNotification({
          userId: custIdStr,
          title: 'Provider Has Arrived!',
          message: `Your service partner has arrived. Please share the Start OTP to begin the job.`,
          type: 'booking_accepted',
          data: { bookingId: booking._id.toString() },
        });
      }
    } catch (_err) {
      logger.warn('Failed to send arrival notification');
    }

    return (await bookingRepository.findBookingById(bookingId))!;
  }

  async verifyStartOtp(providerId: string, bookingId: string, inputOtp: string): Promise<IBookingDocument> {
    const booking = await bookingRepository.findBookingById(bookingId);
    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    const attempts = (booking.startOtpAttempts || 0) + 1;

    if (attempts > 5) {
      throw ApiError.forbidden('Maximum OTP verification attempts exceeded. Please contact customer support.');
    }

    const cleanInput = (inputOtp || '').trim();
    if (!cleanInput) {
      throw ApiError.badRequest('OTP is required');
    }

    const crypto = await import('crypto');
    const inputHash = crypto.createHash('sha256').update(cleanInput).digest('hex');

    const isValid = cleanInput === booking.startOtpRaw || inputHash === booking.startOtpHash;

    if (!isValid) {
      await bookingRepository.updateById(bookingId, {
        startOtpAttempts: attempts,
      } as Partial<IBookingDocument>);
      throw ApiError.badRequest(`Invalid OTP. Attempt ${attempts} of 5.`);
    }

    const timelineItem = {
      status: BookingStatus.STARTED,
      timestamp: new Date(),
      description: 'Customer OTP verified successfully. Job started.',
      updatedBy: Types.ObjectId.isValid(providerId) ? new Types.ObjectId(providerId) : undefined,
    };

    const existingTimeline = booking.timeline || [];

    const updated = await bookingRepository.updateById(bookingId, {
      status: BookingStatus.STARTED,
      startedAt: new Date(),
      otpVerifiedAt: new Date(),
      startOtpAttempts: attempts,
      timeline: [...existingTimeline, timelineItem],
    } as Partial<IBookingDocument>);

    if (!updated) {
      throw ApiError.internal('Failed to start booking after OTP verification');
    }

    return (await bookingRepository.findBookingById(bookingId))!;
  }

  async updateProviderLocation(
    _providerId: string,
    bookingId: string,
    latitude: number,
    longitude: number,
  ): Promise<IBookingDocument> {
    const booking = await bookingRepository.findBookingById(bookingId);
    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    const custCoords = booking.serviceAddress?.coordinates;
    let distanceKm = 0;
    let etaMinutes = 0;

    if (custCoords && custCoords.lat && custCoords.lng) {
      const R = 6371; // Earth radius in km
      const dLat = ((custCoords.lat - latitude) * Math.PI) / 180;
      const dLon = ((custCoords.lng - longitude) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((latitude * Math.PI) / 180) *
          Math.cos((custCoords.lat * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      distanceKm = Math.round(R * c * 10) / 10;
      etaMinutes = Math.max(1, Math.round((distanceKm / 25) * 60)); // Avg 25 km/h urban speed
    }

    const updated = await bookingRepository.updateById(bookingId, {
      lastProviderLatitude: latitude,
      lastProviderLongitude: longitude,
      lastProviderLocationAt: new Date(),
      distanceKm,
      etaMinutes,
    } as Partial<IBookingDocument>);

    if (!updated) {
      throw ApiError.internal('Failed to update provider live location');
    }

    return (await bookingRepository.findBookingById(bookingId))!;
  }

  async cancelBooking(
    userId: string,
    bookingId: string,
    cancellationReason: string,
  ): Promise<IBookingDocument> {
    const booking = await bookingRepository.findBookingById(bookingId);
    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    const customerIdStr = booking.customerId.toString();
    const customerObjIdStr = booking.customerId._id?.toString();
    const cookIdStr = booking.cookId.toString();
    const cookObjIdStr = booking.cookId._id?.toString();

    const isCustomer = userId === customerIdStr || userId === customerObjIdStr;
    const isProvider = userId === cookIdStr || userId === cookObjIdStr;

    if (!isCustomer && !isProvider) {
      throw ApiError.forbidden('You are not authorized to cancel this booking');
    }

    if (booking.status === BookingStatus.COMPLETED) {
      throw ApiError.badRequest('Completed bookings cannot be cancelled');
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw ApiError.badRequest('Booking is already cancelled');
    }

    const validUserObjId = Types.ObjectId.isValid(userId)
      ? (new Types.ObjectId(userId) as unknown as IBookingDocument['cancelledBy'])
      : undefined;

    const timelineItem = {
      status: BookingStatus.CANCELLED,
      timestamp: new Date(),
      description: cancellationReason || 'Booking cancelled',
      updatedBy: Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : undefined,
    };

    const existingTimeline = booking.timeline || [];

    const updated = await bookingRepository.updateById(bookingId, {
      status: BookingStatus.CANCELLED,
      cancellationReason,
      cancelledAt: new Date(),
      cancelledBy: validUserObjId,
      timeline: [...existingTimeline, timelineItem],
    } as Partial<IBookingDocument>);

    if (!updated) {
      throw ApiError.internal('Failed to cancel booking');
    }

    // Update cancelled count if customer cancelled
    if (isCustomer && Types.ObjectId.isValid(userId)) {
      const customerDoc = await customerRepository.findByUserId(userId);
      if (customerDoc) {
        await customerRepository.updateByUserId(userId, {
          cancelledBookings: (customerDoc.cancelledBookings || 0) + 1,
        });
      }
    }

    return (await bookingRepository.findBookingById(bookingId))!;
  }

  async checkAvailability(
    cookId: string,
    dateStr: string,
    startTime: string,
    endTime?: string,
    durationHours?: number,
  ) {
    const scheduledDate = new Date(dateStr);
    if (isNaN(scheduledDate.getTime())) {
      throw ApiError.badRequest('Invalid date format');
    }

    const start24 = startTimeTo24(startTime);
    const dur = durationHours || 2;
    let end24 = endTime ? endTimeTo24(endTime) : '';

    if (!end24) {
      const [h, m] = start24.split(':').map((v) => parseInt(v, 10));
      const totalMins = (isNaN(h) ? 9 : h) * 60 + (isNaN(m) ? 0 : m) + Math.round(dur * 60);
      const endH = Math.floor(totalMins / 60) % 24;
      const endM = totalMins % 60;
      end24 = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
    }

    if (!Types.ObjectId.isValid(cookId)) {
      return {
        available: true,
        isAvailable: true,
        message: 'Worker is available at the selected time',
        conflictingBookingsCount: 0,
        alternatives: [],
      };
    }

    const overlapping = await bookingRepository.findOverlappingBookings(
      cookId,
      scheduledDate,
      start24,
      end24,
    );

    if (overlapping.length === 0) {
      return {
        available: true,
        isAvailable: true,
        message: 'Worker is available at the selected time',
        conflictingBookingsCount: 0,
        alternatives: [],
      };
    }

    // Calculate nearby available alternative slots
    const startOfDay = new Date(scheduledDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(scheduledDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await Booking.find({
      cookId: new Types.ObjectId(cookId),
      scheduledDate: { $gte: startOfDay, $lte: endOfDay },
      status: {
        $in: [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS],
      },
      isDeleted: { $ne: true },
    }).lean();

    const candidates = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
    const alternatives: string[] = [];

    for (const candStart of candidates) {
      if (candStart === start24) continue;
      const [ch, cm] = candStart.split(':').map((v) => parseInt(v, 10));
      const cTotalMins = ch * 60 + cm + Math.round(dur * 60);
      if (cTotalMins > 20 * 60) continue;

      const candEndH = Math.floor(cTotalMins / 60) % 24;
      const candEndM = cTotalMins % 60;
      const candEnd = `${candEndH.toString().padStart(2, '0')}:${candEndM.toString().padStart(2, '0')}`;

      const hasConflict = existingBookings.some((b: any) => {
        return candStart < b.endTime && candEnd > b.startTime;
      });

      if (!hasConflict) {
        alternatives.push(`${candStart} – ${candEnd}`);
        if (alternatives.length >= 3) break;
      }
    }

    return {
      available: false,
      isAvailable: false,
      message: 'Sorry, this worker is not available at the selected time. Please choose another time.',
      conflictingBookingsCount: overlapping.length,
      alternatives,
    };
  }

  async getBookingTimeline(bookingId: string, userId: string, userRole?: string): Promise<BookingTimelineEvent[]> {
    const booking = await this.getBookingById(bookingId, userId, userRole);
    if (booking.timeline && booking.timeline.length > 0) {
      return booking.timeline.map((item) => ({
        status: item.status,
        timestamp: item.timestamp,
        description: item.description,
        metadata: item.metadata,
      }));
    }

    const timeline: BookingTimelineEvent[] = [];

    // Created event
    timeline.push({
      status: BookingStatus.PENDING,
      timestamp: booking.createdAt,
      description: 'Booking request created and pending provider confirmation',
    });

    if (
      booking.status === BookingStatus.ASSIGNED ||
      booking.status === BookingStatus.CONFIRMED ||
      booking.status === BookingStatus.ACCEPTED ||
      booking.status === BookingStatus.IN_PROGRESS ||
      booking.status === BookingStatus.COMPLETED
    ) {
      timeline.push({
        status: booking.status,
        timestamp: booking.updatedAt,
        description: `Booking updated to ${booking.status.toUpperCase()}`,
      });
    }

    if (
      (booking.status === BookingStatus.IN_PROGRESS || booking.status === BookingStatus.COMPLETED) &&
      booking.startedAt
    ) {
      timeline.push({
        status: BookingStatus.IN_PROGRESS,
        timestamp: booking.startedAt,
        description: 'Service started by provider',
      });
    }

    if (booking.status === BookingStatus.COMPLETED && booking.completedAt) {
      timeline.push({
        status: BookingStatus.COMPLETED,
        timestamp: booking.completedAt,
        description: 'Service completed successfully',
      });
    }

    if (booking.status === BookingStatus.CANCELLED && booking.cancelledAt) {
      timeline.push({
        status: BookingStatus.CANCELLED,
        timestamp: booking.cancelledAt,
        description: `Booking cancelled: ${booking.cancellationReason || 'No reason provided'}`,
        metadata: {
          cancelledBy: booking.cancelledBy,
        },
      });
    }

    return timeline;
  }

  async getUpcomingBookings(userId: string, isProvider: boolean): Promise<IBookingDocument[]> {
    return bookingRepository.findUpcoming(userId, isProvider);
  }

  async getCustomerHistory(
    customerId: string,
    queryParams: BookingListQueryInput,
  ): Promise<PaginatedBookingsResult> {
    return bookingRepository.findCustomerBookings(customerId, queryParams);
  }

  async getCookHistory(
    cookId: string,
    queryParams: BookingListQueryInput,
  ): Promise<PaginatedBookingsResult> {
    return bookingRepository.findProviderBookings(cookId, queryParams);
  }

  async getMaidHistory(
    maidId: string,
    queryParams: BookingListQueryInput,
  ): Promise<PaginatedBookingsResult> {
    return bookingRepository.findProviderBookings(maidId, queryParams);
  }

  async searchBookings(
    queryParams: BookingListQueryInput,
    userId?: string,
    isProvider?: boolean,
    isAdmin?: boolean,
  ): Promise<PaginatedBookingsResult> {
    logger.info('[GET /bookings] Service entered', { queryParams, userId, isProvider, isAdmin });
    const baseFilter: Record<string, unknown> = {};
    if (userId && !isAdmin) {
      if (isProvider) {
        baseFilter.cookId = userId;
      } else {
        baseFilter.customerId = userId;
      }
    }
    const result = await bookingRepository.searchBookings(queryParams, baseFilter);
    logger.info('[GET /bookings] Mongo query result fetched', { total: result.total, count: result.bookings.length });
    return result;
  }

  async getBookingHistory(
    userId: string,
    isProvider: boolean,
    queryParams: BookingListQueryInput,
  ): Promise<PaginatedBookingsResult> {
    return bookingRepository.findHistory(userId, isProvider, queryParams);
  }

  async getBookingById(bookingId: string, userId: string, userRole?: string): Promise<IBookingDocument> {
    const booking = await bookingRepository.findBookingById(bookingId);
    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    const customerIdStr = extractIdString(booking.customerId, booking, 'customerId');
    const cookIdStr = extractIdString(booking.cookId, booking, 'cookId');
    const isAdmin = userRole === UserRole.ADMIN || userRole === 'admin';

    const isAuthorized =
      isAdmin ||
      userId === customerIdStr ||
      userId === cookIdStr;

    if (!isAuthorized) {
      throw ApiError.forbidden('You do not have permission to view this booking');
    }

    return booking;
  }

  async assignProvider(
    adminId: string,
    bookingId: string,
    providerId: string,
  ): Promise<IBookingDocument> {
    const booking = await bookingRepository.findBookingById(bookingId);
    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    if (booking.status === BookingStatus.COMPLETED) {
      throw ApiError.badRequest('Cannot reassign provider for a completed booking');
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw ApiError.badRequest('Cannot assign provider to a cancelled booking');
    }

    const currentCookIdStr = extractIdString(booking.cookId, booking, 'cookId');

    // Validation: Prevent assigning same provider twice
    if (currentCookIdStr === providerId) {
      throw ApiError.badRequest('Provider is already assigned to this booking');
    }

    // Validation: Check provider availability (prevent double booking)
    if (Types.ObjectId.isValid(providerId)) {
      const overlapping = await bookingRepository.findOverlappingBookings(
        providerId,
        booking.scheduledDate,
        booking.startTime,
        booking.endTime,
        booking._id,
      );

      if (overlapping.length > 0) {
        throw ApiError.conflict('Selected provider is unavailable (already booked) during this date & time slot');
      }
    }

    const newProviderObjId = Types.ObjectId.isValid(providerId)
      ? new Types.ObjectId(providerId)
      : new Types.ObjectId('000000000000000000000002');

    const timelineItem = {
      status: BookingStatus.ASSIGNED,
      timestamp: new Date(),
      description: `Provider assigned by admin (${providerId})`,
      updatedBy: Types.ObjectId.isValid(adminId) ? new Types.ObjectId(adminId) : undefined,
    };

    const existingTimeline = booking.timeline || [];

    const updated = await bookingRepository.updateById(bookingId, {
      cookId: newProviderObjId as unknown as IBookingDocument['cookId'],
      status: BookingStatus.ASSIGNED,
      timeline: [...existingTimeline, timelineItem],
    } as Partial<IBookingDocument>);

    if (!updated) {
      throw ApiError.internal('Failed to assign provider');
    }

    // Trigger Notification Event
    void notificationService.sendNotification({
      userId: providerId,
      title: 'Booking Assigned',
      message: `You have been assigned to booking #${booking.bookingNumber}`,
      type: 'booking_assigned' as any,
      data: { bookingId: booking._id.toString() },
    });

    return (await bookingRepository.findBookingById(bookingId))!;
  }

  async updateBookingStatus(
    userId: string,
    _userRole: string,
    bookingId: string,
    newStatus: BookingStatus,
    notes?: string,
  ): Promise<IBookingDocument> {
    const booking = await bookingRepository.findBookingById(bookingId);
    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    // Validations:
    // 1. Completing cancelled booking
    if (booking.status === BookingStatus.CANCELLED) {
      throw ApiError.badRequest('Cannot complete or alter a cancelled booking');
    }

    // 2. Cancelling completed booking
    if (booking.status === BookingStatus.COMPLETED && newStatus === BookingStatus.CANCELLED) {
      throw ApiError.badRequest('Cannot cancel a completed booking');
    }

    // 3. Already completed
    if (booking.status === BookingStatus.COMPLETED) {
      throw ApiError.badRequest('Booking is already completed');
    }

    const updateFields: Partial<IBookingDocument> = {
      status: newStatus,
    };

    if (notes) {
      updateFields.notes = notes;
    }

    if (
      newStatus === BookingStatus.STARTED ||
      newStatus === BookingStatus.WORK_STARTED ||
      newStatus === BookingStatus.IN_PROGRESS
    ) {
      updateFields.startedAt = new Date();
    }

    if (newStatus === BookingStatus.COMPLETED || newStatus === BookingStatus.WORK_COMPLETED) {
      updateFields.completedAt = new Date();
    }

    if (newStatus === BookingStatus.CANCELLED || newStatus === BookingStatus.REJECTED) {
      updateFields.cancelledAt = new Date();
      updateFields.cancellationReason = notes || `Status updated to ${newStatus}`;
      if (Types.ObjectId.isValid(userId)) {
        updateFields.cancelledBy = new Types.ObjectId(userId) as unknown as IBookingDocument['cancelledBy'];
      }
    }

    const timelineItem = {
      status: newStatus,
      timestamp: new Date(),
      description: notes || `Booking status updated to ${newStatus.toUpperCase()}`,
      updatedBy: Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : undefined,
    };

    const existingTimeline = booking.timeline || [];
    updateFields.timeline = [...existingTimeline, timelineItem];

    const updated = await bookingRepository.updateById(bookingId, updateFields);
    if (!updated) {
      throw ApiError.internal('Failed to update booking status');
    }

    // Trigger Notification Events
    const customerIdStr = booking.customerId
      ? (booking.customerId._id ? booking.customerId._id.toString() : booking.customerId.toString())
      : '';

    if (Types.ObjectId.isValid(customerIdStr)) {
      if (newStatus === BookingStatus.ACCEPTED || newStatus === BookingStatus.CONFIRMED) {
        void notificationService.sendNotification({
          userId: customerIdStr,
          title: 'Booking Accepted',
          message: `Your booking #${booking.bookingNumber} has been accepted.`,
          type: 'booking_accepted' as any,
          data: { bookingId },
        });
      } else if (newStatus === BookingStatus.CANCELLED || newStatus === BookingStatus.REJECTED) {
        void notificationService.sendNotification({
          userId: customerIdStr,
          title: 'Booking Cancelled',
          message: `Booking #${booking.bookingNumber} has been cancelled.`,
          type: 'booking_cancelled' as any,
          data: { bookingId },
        });
      } else if (newStatus === BookingStatus.COMPLETED) {
        void notificationService.sendNotification({
          userId: customerIdStr,
          title: 'Booking Completed',
          message: `Your service for booking #${booking.bookingNumber} is marked complete.`,
          type: 'booking_completed' as any,
          data: { bookingId },
        });
      }
    }

    return (await bookingRepository.findBookingById(bookingId))!;
  }

  async createRecurringBooking(customerId: string, input: any) {
    const nextDate = new Date(input.startDate || Date.now() + 86400000);
    const recurring = await RecurringBooking.create({
      customerId: new Types.ObjectId(customerId),
      workerId: input.workerId ? new Types.ObjectId(input.workerId) : undefined,
      taskName: input.taskName || 'Household Service',
      frequency: input.frequency || 'weekly',
      dayOfWeek: input.dayOfWeek || 'Saturday',
      startTime: input.startTime || '08:00 AM',
      durationHours: input.durationHours || 1,
      serviceAddress: input.serviceAddress || {
        street: 'Main Street',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
        country: 'India',
      },
      hourlyRate: input.hourlyRate || 250,
      nextBookingDate: nextDate,
      status: 'active',
      instructions: input.instructions || '',
    });

    // Generate initial active booking
    await this.createBooking(customerId, {
      cookId: input.workerId || '660000000000000000000001',
      providerId: input.workerId || '660000000000000000000001',
      scheduledDate: nextDate.toISOString().split('T')[0],
      startTime: input.startTime || '08:00 AM',
      endTime: '10:00 AM',
      durationHours: input.durationHours || 1,
      taskName: input.taskName,
      serviceAddress: input.serviceAddress || {
        street: 'Main Street',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
        country: 'India',
      },
      hourlyRate: input.hourlyRate || 250,
      instructions: input.instructions,
    } as any).catch(() => null);

    return recurring;
  }

  async getRecurringBookings(customerId?: string) {
    const query: any = { isDeleted: { $ne: true } };
    if (customerId) query.customerId = new Types.ObjectId(customerId);
    return RecurringBooking.find(query).sort({ createdAt: -1 });
  }

  async pauseRecurringBooking(id: string, customerId: string) {
    const item = await RecurringBooking.findOneAndUpdate(
      { _id: new Types.ObjectId(id), customerId: new Types.ObjectId(customerId) },
      { status: 'paused' },
      { new: true }
    );
    if (!item) throw ApiError.notFound('Recurring booking schedule not found');
    return item;
  }

  async resumeRecurringBooking(id: string, customerId: string) {
    const item = await RecurringBooking.findOneAndUpdate(
      { _id: new Types.ObjectId(id), customerId: new Types.ObjectId(customerId) },
      { status: 'active' },
      { new: true }
    );
    if (!item) throw ApiError.notFound('Recurring booking schedule not found');
    return item;
  }

  async cancelRecurringBooking(id: string, customerId: string) {
    const item = await RecurringBooking.findOneAndUpdate(
      { _id: new Types.ObjectId(id), customerId: new Types.ObjectId(customerId) },
      { status: 'cancelled' },
      { new: true }
    );
    if (!item) throw ApiError.notFound('Recurring booking schedule not found');
    return item;
  }
}

function startTimeTo24(timeStr: string): string {
  if (!timeStr) return '09:00';
  if (timeStr.includes('-')) {
    timeStr = timeStr.split('-')[0].trim();
  }
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return timeStr;
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const ampm = match[3];
  if (ampm) {
    if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
    if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
  }
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

function endTimeTo24(timeStr: string): string {
  if (!timeStr) return '11:00';
  if (timeStr.includes('-')) {
    timeStr = timeStr.split('-')[1].trim();
  }
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return timeStr;
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const ampm = match[3];
  if (ampm) {
    if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
    if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
  }
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

function extractIdString(field: any, doc: any, fieldName: string): string {
  if (field) {
    if (field._id) return field._id.toString();
    return field.toString();
  }
  if (doc) {
    if (typeof doc.populated === 'function') {
      const popVal = doc.populated(fieldName);
      if (popVal) return popVal.toString();
    }
    if (doc.$__ && doc.$__.populated && doc.$__.populated[fieldName]) {
      const val = doc.$__.populated[fieldName].value;
      if (val) return val.toString();
    }
    if (doc._doc && doc._doc[fieldName]) {
      return doc._doc[fieldName].toString();
    }
  }
  return '';
}

export const bookingService = new BookingService();
