import { Types } from 'mongoose';
import { Customer } from '../../../models/customer.model.js';
import { User } from '../../../models/user.model.js';
import { Booking } from '../../../models/booking.model.js';
import { Payment } from '../../../models/payment.model.js';
import { Review } from '../../../models/review.model.js';
import Address from '../../../models/address.model.js';
import { Notification } from '../../../models/notification.model.js';
import { Favorite } from '../../../models/favorite.model.js';
import { ApiError } from '../../../utils/ApiError.js';
import { logger } from '../../../utils/logger.js';
import { BookingStatus, ServiceType } from '../../../types/domain.enums.js';
import type {
  UpdateCustomerProfileInput,
  CustomerBookingQueryInput,
  CancelBookingInput,
  RescheduleBookingInput,
  RepeatBookingInput,
  CreateCustomerReviewInput,
  UpdateCustomerReviewInput,
  CustomerAddressInput,
  UpdateCustomerAddressInput,
} from '../validators/customer.validator.js';

export class CustomerService {
  private async getOrCreateCustomer(userId: string) {
    let customer = await Customer.findOne({ userId: new Types.ObjectId(userId) });
    if (!customer) {
      customer = await Customer.create({
        userId: new Types.ObjectId(userId),
        preferences: { serviceTypes: [ServiceType.COOK], dietaryRestrictions: [], preferredLanguages: [] },
      });
    }
    return customer;
  }

  async getDashboardStats(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const customer = await this.getOrCreateCustomer(userId);

    const [
      totalBookings,
      completedBookings,
      activeBookings,
      cancelledBookings,
      pendingBookings,
      payments,
      favorites,
      recentBookings,
    ] = await Promise.all([
      Booking.countDocuments({ customerId: customer._id, isDeleted: { $ne: true } }),
      Booking.countDocuments({ customerId: customer._id, status: BookingStatus.COMPLETED, isDeleted: { $ne: true } }),
      Booking.countDocuments({
        customerId: customer._id,
        status: { $in: [BookingStatus.ASSIGNED, BookingStatus.ACCEPTED, BookingStatus.ON_THE_WAY, BookingStatus.STARTED] },
        isDeleted: { $ne: true },
      }),
      Booking.countDocuments({ customerId: customer._id, status: BookingStatus.CANCELLED, isDeleted: { $ne: true } }),
      Booking.countDocuments({ customerId: customer._id, status: BookingStatus.PENDING, isDeleted: { $ne: true } }),
      Payment.aggregate([
        { $match: { userId: userObjectId, paymentStatus: 'paid', isDeleted: { $ne: true } } },
        { $group: { _id: null, totalSpent: { $sum: '$amount' } } },
      ]),
      Favorite.find({ customerId: customer._id, itemType: 'provider', isDeleted: false }).populate('providerId', 'name avatar role'),
      Booking.find({ customerId: customer._id, isDeleted: { $ne: true } })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('cookId', 'fullName profilePhoto rating averageRating'),
    ]);

    const totalSpent = payments.length > 0 ? payments[0].totalSpent : 0;
    const favouriteProvider = favorites.length > 0 ? favorites[0].providerId : null;

    return {
      stats: {
        totalBookings,
        completed: completedBookings,
        active: activeBookings,
        cancelled: cancelledBookings,
        pending: pendingBookings,
        totalSpent,
        loyaltyPoints: customer.loyaltyPoints || 0,
      },
      favouriteProvider,
      recentBookings,
      activeBooking: recentBookings.find((b) =>
        [BookingStatus.ASSIGNED, BookingStatus.ACCEPTED, BookingStatus.ON_THE_WAY, BookingStatus.STARTED].includes(b.status as BookingStatus),
      ) || null,
    };
  }

  async getProfile(userId: string) {
    const user = await User.findById(userId).select('-password');
    if (!user) throw ApiError.notFound('User profile not found');

    const customer = await this.getOrCreateCustomer(userId);

    return {
      user,
      customer,
    };
  }

  async updateProfile(userId: string, input: UpdateCustomerProfileInput) {
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound('User profile not found');

    if (input.name) user.name = input.name;
    if (input.phone) user.phone = input.phone;
    if (input.avatar) user.avatar = input.avatar;
    await user.save();

    const customer = await this.getOrCreateCustomer(userId);
    if (input.preferences) {
      customer.preferences = {
        ...customer.preferences,
        serviceTypes: (input.preferences.serviceTypes as ServiceType[]) || customer.preferences.serviceTypes,
        dietaryRestrictions: input.preferences.dietaryRestrictions || customer.preferences.dietaryRestrictions,
        preferredLanguages: input.preferences.preferredLanguages || customer.preferences.preferredLanguages,
        notes: input.preferences.notes || customer.preferences.notes,
      };
      await customer.save();
    }

    logger.info('Customer profile updated', { userId });
    return { user, customer };
  }

  async getBookings(userId: string, query: CustomerBookingQueryInput) {
    const customer = await this.getOrCreateCustomer(userId);
    const filter: any = { customerId: customer._id, isDeleted: { $ne: true } };

    if (query.tab === 'upcoming') {
      filter.status = { $in: [BookingStatus.PENDING, BookingStatus.ASSIGNED, BookingStatus.ACCEPTED] };
    } else if (query.tab === 'active') {
      filter.status = { $in: [BookingStatus.ON_THE_WAY, BookingStatus.STARTED] };
    } else if (query.tab === 'history') {
      filter.status = { $in: [BookingStatus.COMPLETED, BookingStatus.CANCELLED, BookingStatus.REJECTED] };
    } else if (query.status) {
      filter.status = query.status;
    }

    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, query.limit ?? 20);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Booking.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('cookId', 'fullName profilePhoto averageRating'),
      Booking.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getBookingById(userId: string, bookingId: string) {
    const customer = await this.getOrCreateCustomer(userId);
    const booking = await Booking.findOne({ _id: bookingId, customerId: customer._id, isDeleted: { $ne: true } })
      .populate('cookId', 'fullName profilePhoto averageRating phone');

    if (!booking) throw ApiError.notFound('Booking not found');
    return booking;
  }

  async cancelBooking(userId: string, bookingId: string, input: CancelBookingInput) {
    const customer = await this.getOrCreateCustomer(userId);
    const booking = await Booking.findOne({ _id: bookingId, customerId: customer._id, isDeleted: { $ne: true } });

    if (!booking) throw ApiError.notFound('Booking not found');
    if ([BookingStatus.COMPLETED, BookingStatus.CANCELLED].includes(booking.status)) {
      throw ApiError.badRequest(`Booking cannot be cancelled because it is already ${booking.status.toLowerCase()}`);
    }

    booking.status = BookingStatus.CANCELLED;
    booking.cancellationReason = input.cancellationReason;
    booking.cancelledAt = new Date();
    booking.cancelledBy = new Types.ObjectId(userId);

    if (!booking.timeline) booking.timeline = [];
    booking.timeline.push({
      status: BookingStatus.CANCELLED,
      timestamp: new Date(),
      description: `Cancelled by customer: ${input.cancellationReason}`,
      updatedBy: new Types.ObjectId(userId),
    });

    await booking.save();
    logger.info('Booking cancelled by customer', { bookingId, userId });

    return booking;
  }

  async rescheduleBooking(userId: string, bookingId: string, input: RescheduleBookingInput) {
    const customer = await this.getOrCreateCustomer(userId);
    const booking = await Booking.findOne({ _id: bookingId, customerId: customer._id, isDeleted: { $ne: true } });

    if (!booking) throw ApiError.notFound('Booking not found');
    if ([BookingStatus.COMPLETED, BookingStatus.CANCELLED].includes(booking.status)) {
      throw ApiError.badRequest(`Booking cannot be rescheduled in state ${booking.status}`);
    }

    booking.scheduledDate = new Date(input.startDate);
    if (input.timeSlot) booking.startTime = input.timeSlot;

    if (!booking.timeline) booking.timeline = [];
    booking.timeline.push({
      status: booking.status,
      timestamp: new Date(),
      description: `Rescheduled by customer to ${new Date(input.startDate).toISOString()}`,
      updatedBy: new Types.ObjectId(userId),
    });

    await booking.save();
    logger.info('Booking rescheduled by customer', { bookingId, newStartDate: input.startDate, userId });

    return booking;
  }

  async repeatBooking(userId: string, bookingId: string, input: RepeatBookingInput) {
    const customer = await this.getOrCreateCustomer(userId);
    const original = await Booking.findOne({ _id: bookingId, customerId: customer._id });
    if (!original) throw ApiError.notFound('Original booking not found');

    const newBooking = await Booking.create({
      bookingNumber: `BK${Date.now()}${Math.floor(Math.random() * 1000)}`,
      customerId: customer._id,
      cookId: original.cookId,
      serviceType: original.serviceType,
      scheduledDate: new Date(input.startDate),
      startTime: input.timeSlot || original.startTime,
      endTime: original.endTime,
      durationHours: original.durationHours,
      serviceAddress: original.serviceAddress,
      pricing: original.pricing,
      status: BookingStatus.PENDING,
      timeline: [
        {
          status: BookingStatus.PENDING,
          timestamp: new Date(),
          description: 'Repeat booking created by customer',
          updatedBy: new Types.ObjectId(userId),
        },
      ],
    });

    logger.info('Repeat booking created', { originalBookingId: bookingId, newBookingId: newBooking._id });
    return newBooking;
  }

  async getPayments(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const payments = await Payment.find({ userId: userObjectId, isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .populate('bookingId', 'bookingNumber serviceType status');

    const totalSpent = payments
      .filter((p) => p.paymentStatus === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      payments,
      summary: {
        totalTransactions: payments.length,
        totalSpent,
      },
    };
  }

  async getReviews(userId: string) {
    const customer = await this.getOrCreateCustomer(userId);
    const reviews = await Review.find({ customerId: customer._id, isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .populate('bookingId', 'bookingNumber serviceType')
      .populate('cookId', 'fullName profilePhoto');

    return {
      reviews,
      count: reviews.length,
    };
  }

  async createReview(userId: string, input: CreateCustomerReviewInput) {
    const customer = await this.getOrCreateCustomer(userId);
    const booking = await Booking.findOne({ _id: input.bookingId, customerId: customer._id });

    if (!booking) throw ApiError.notFound('Booking not found');
    if (booking.status !== BookingStatus.COMPLETED) {
      throw ApiError.badRequest('Review can only be added for completed bookings');
    }

    const existing = await Review.findOne({ bookingId: booking._id, isDeleted: { $ne: true } });
    if (existing) throw ApiError.conflict('Review already submitted for this booking');

    const cookId = booking.cookId;
    if (!cookId) throw ApiError.badRequest('Booking has no assigned provider');

    const review = await Review.create({
      bookingId: booking._id,
      customerId: customer._id,
      cookId,
      comment: input.comment,
      isPublished: true,
      publishedAt: new Date(),
    });

    logger.info('Customer review submitted', { reviewId: review._id, bookingId: booking._id });
    return review;
  }

  async updateReview(userId: string, reviewId: string, input: UpdateCustomerReviewInput) {
    const customer = await this.getOrCreateCustomer(userId);
    const review = await Review.findOne({ _id: reviewId, customerId: customer._id, isDeleted: { $ne: true } });

    if (!review) throw ApiError.notFound('Review not found');

    review.comment = input.comment;
    await review.save();

    logger.info('Customer review updated', { reviewId });
    return review;
  }

  async deleteReview(userId: string, reviewId: string) {
    const customer = await this.getOrCreateCustomer(userId);
    const review = await Review.findOne({ _id: reviewId, customerId: customer._id, isDeleted: { $ne: true } });

    if (!review) throw ApiError.notFound('Review not found');

    review.isDeleted = true;
    await review.save();

    logger.info('Customer review deleted', { reviewId });
  }

  async getAddresses(userId: string) {
    const addresses = await Address.find({ customer: new Types.ObjectId(userId), isDeleted: { $ne: true } }).sort({
      isDefault: -1,
      createdAt: -1,
    });
    return addresses;
  }

  async createAddress(userId: string, input: CustomerAddressInput) {
    const userObjectId = new Types.ObjectId(userId);

    if (input.isDefault) {
      await Address.updateMany({ customer: userObjectId }, { isDefault: false });
    }

    const count = await Address.countDocuments({ customer: userObjectId, isDeleted: { $ne: true } });
    const isDefault = input.isDefault || count === 0;

    const address = await Address.create({
      ...input,
      customer: userObjectId,
      isDefault,
    });

    logger.info('Customer address created', { addressId: address._id, userId });
    return address;
  }

  async updateAddress(userId: string, addressId: string, input: UpdateCustomerAddressInput) {
    const userObjectId = new Types.ObjectId(userId);
    const address = await Address.findOne({ _id: addressId, customer: userObjectId, isDeleted: { $ne: true } });

    if (!address) throw ApiError.notFound('Address not found');

    if (input.isDefault) {
      await Address.updateMany({ customer: userObjectId }, { isDefault: false });
    }

    Object.assign(address, input);
    await address.save();

    logger.info('Customer address updated', { addressId, userId });
    return address;
  }

  async deleteAddress(userId: string, addressId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const address = await Address.findOne({ _id: addressId, customer: userObjectId, isDeleted: { $ne: true } });

    if (!address) throw ApiError.notFound('Address not found');

    address.isDeleted = true;
    await address.save();

    logger.info('Customer address deleted', { addressId, userId });
  }

  async setDefaultAddress(userId: string, addressId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const address = await Address.findOne({ _id: addressId, customer: userObjectId, isDeleted: { $ne: true } });

    if (!address) throw ApiError.notFound('Address not found');

    await Address.updateMany({ customer: userObjectId }, { isDefault: false });
    address.isDefault = true;
    await address.save();

    logger.info('Customer default address set', { addressId, userId });
    return address;
  }

  async getNotifications(userId: string) {
    const notifications = await Notification.find({ userId: new Types.ObjectId(userId) }).sort({ createdAt: -1 }).limit(50);
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return {
      notifications,
      unreadCount,
    };
  }

  async markNotificationRead(userId: string, notificationId: string) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId: new Types.ObjectId(userId) },
      { isRead: true, readAt: new Date() },
      { new: true },
    );
    if (!notification) throw ApiError.notFound('Notification not found');
    return notification;
  }

  async markAllNotificationsRead(userId: string) {
    await Notification.updateMany({ userId: new Types.ObjectId(userId), isRead: false }, { isRead: true, readAt: new Date() });
    logger.info('All customer notifications marked read', { userId });
  }
}

export const customerService = new CustomerService();
