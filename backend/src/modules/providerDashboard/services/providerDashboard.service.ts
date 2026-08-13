import { Types } from 'mongoose';
import { Provider } from '../../../models/provider.model.js';
import { User } from '../../../models/user.model.js';
import { Booking } from '../../../models/booking.model.js';
import { Payment } from '../../../models/payment.model.js';
import { Review } from '../../../models/review.model.js';
import { Wallet } from '../../../models/wallet.model.js';
import { ApiError } from '../../../utils/ApiError.js';
import { logger } from '../../../utils/logger.js';
import { BookingStatus, WalletOwnerType } from '../../../types/domain.enums.js';
import type {
  UpdateProviderProfileInput,
  ProviderBookingQueryInput,
  RejectBookingInput,
  CompleteBookingInput,
  UpdateAvailabilityInput,
  UpdateLocationInput,
} from '../validators/providerDashboard.validator.js';

export class ProviderDashboardService {
  private async getOrCreateProvider(userId: string) {
    let provider = await Provider.findOne({ userId: new Types.ObjectId(userId), isDeleted: { $ne: true } });
    if (!provider) {
      const user = await User.findById(userId);
      if (!user) throw ApiError.notFound('Provider user account not found');

      provider = await Provider.create({
        userId: new Types.ObjectId(userId),
        fullName: user.name || 'Provider',
        providerType: user.role === 'maid' ? 'maid' : 'cook',
        location: { country: 'India', state: '', city: '', currentAddress: '', latitude: 0, longitude: 0, serviceRadiusKm: 10 },
      });
    }
    return provider;
  }

  async getDashboard(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const provider = await this.getOrCreateProvider(userId);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const [todayJobs, upcomingCount, completedCount, cancelledCount, activeJob, wallet, todayEarnings] = await Promise.all([
      Booking.find({
        cookId: provider._id,
        scheduledDate: { $gte: startOfToday, $lte: endOfToday },
        isDeleted: { $ne: true },
      })
        .sort({ scheduledDate: 1 })
        .populate('customerId', 'name phone avatar'),

      Booking.countDocuments({
        cookId: provider._id,
        scheduledDate: { $gt: endOfToday },
        status: { $in: [BookingStatus.PENDING, BookingStatus.ASSIGNED, BookingStatus.ACCEPTED] },
        isDeleted: { $ne: true },
      }),

      Booking.countDocuments({
        cookId: provider._id,
        status: BookingStatus.COMPLETED,
        isDeleted: { $ne: true },
      }),

      Booking.countDocuments({
        cookId: provider._id,
        status: BookingStatus.CANCELLED,
        isDeleted: { $ne: true },
      }),

      Booking.findOne({
        cookId: provider._id,
        status: { $in: [BookingStatus.ACCEPTED, BookingStatus.ON_THE_WAY, BookingStatus.STARTED] },
        isDeleted: { $ne: true },
      }).populate('customerId', 'name phone avatar'),

      Wallet.findOne({ ownerId: userObjectId, ownerType: WalletOwnerType.PROVIDER }),

      Payment.aggregate([
        {
          $match: {
            providerId: userObjectId,
            paymentStatus: 'paid',
            createdAt: { $gte: startOfToday, $lte: endOfToday },
            isDeleted: { $ne: true },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    return {
      overview: {
        isAvailable: provider.isAvailable,
        kycStatus: provider.kycStatus,
        verificationStatus: provider.verificationStatus,
        averageRating: provider.averageRating,
        totalReviews: provider.totalReviews,
      },
      jobsSummary: {
        todayCount: todayJobs.length,
        upcomingCount,
        completedCount,
        cancelledCount,
      },
      earningsSummary: {
        today: todayEarnings.length > 0 ? todayEarnings[0].total : 0,
        walletBalance: wallet?.balance || 0,
      },
      activeJob: activeJob || null,
      todaySchedule: todayJobs,
    };
  }

  async getProfile(userId: string) {
    const user = await User.findById(userId).select('-password');
    const provider = await this.getOrCreateProvider(userId);

    return {
      user,
      provider,
    };
  }

  async updateProfile(userId: string, input: UpdateProviderProfileInput) {
    const provider = await this.getOrCreateProvider(userId);

    if (input.fullName) {
      provider.fullName = input.fullName;
      await User.findByIdAndUpdate(userId, { name: input.fullName });
    }

    if (input.gender) provider.gender = input.gender;
    if (input.experienceYears !== undefined) provider.experienceYears = input.experienceYears;
    if (input.languages) provider.languages = input.languages;
    if (input.skills) provider.skills = input.skills;
    if (input.bio) provider.bio = input.bio;

    if (input.documents) {
      provider.documents = {
        ...provider.documents,
        ...input.documents,
      };
    }

    if (input.bankDetails) {
      provider.bankDetails = {
        ...provider.bankDetails,
        ...input.bankDetails,
      };
    }

    await provider.save();
    logger.info('Provider profile updated by provider', { providerId: provider._id, userId });

    return provider;
  }

  async getBookings(userId: string, query: ProviderBookingQueryInput) {
    const provider = await this.getOrCreateProvider(userId);
    const filter: any = { cookId: provider._id, isDeleted: { $ne: true } };

    if (query.status) {
      filter.status = query.status;
    }

    if (query.startDate || query.endDate) {
      filter.scheduledDate = {};
      if (query.startDate) filter.scheduledDate.$gte = new Date(query.startDate);
      if (query.endDate) filter.scheduledDate.$lte = new Date(query.endDate);
    }

    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, query.limit ?? 20);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Booking.find(filter)
        .sort({ scheduledDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('customerId', 'name phone avatar'),
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

  async getTodayBookings(userId: string) {
    const provider = await this.getOrCreateProvider(userId);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const items = await Booking.find({
      cookId: provider._id,
      scheduledDate: { $gte: startOfToday, $lte: endOfToday },
      isDeleted: { $ne: true },
    })
      .sort({ scheduledDate: 1 })
      .populate('customerId', 'name phone avatar');

    return { items, count: items.length };
  }

  async getUpcomingBookings(userId: string) {
    const provider = await this.getOrCreateProvider(userId);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const items = await Booking.find({
      cookId: provider._id,
      scheduledDate: { $gt: endOfToday },
      status: { $in: [BookingStatus.PENDING, BookingStatus.ASSIGNED, BookingStatus.ACCEPTED] },
      isDeleted: { $ne: true },
    })
      .sort({ scheduledDate: 1 })
      .populate('customerId', 'name phone avatar');

    return { items, count: items.length };
  }

  async acceptBooking(userId: string, bookingId: string) {
    const provider = await this.getOrCreateProvider(userId);
    const booking = await Booking.findOne({ _id: bookingId, cookId: provider._id, isDeleted: { $ne: true } });

    if (!booking) throw ApiError.notFound('Booking assignment not found');
    if (booking.status === BookingStatus.ACCEPTED) return booking;

    booking.status = BookingStatus.ACCEPTED;

    if (!booking.timeline) booking.timeline = [];
    booking.timeline.push({
      status: BookingStatus.ACCEPTED,
      timestamp: new Date(),
      description: 'Booking request accepted by provider',
      updatedBy: new Types.ObjectId(userId),
    });

    await booking.save();
    logger.info('Booking accepted by provider', { bookingId, providerId: provider._id, userId });

    return booking;
  }

  async rejectBooking(userId: string, bookingId: string, input: RejectBookingInput) {
    const provider = await this.getOrCreateProvider(userId);
    const booking = await Booking.findOne({ _id: bookingId, cookId: provider._id, isDeleted: { $ne: true } });

    if (!booking) throw ApiError.notFound('Booking assignment not found');

    booking.status = BookingStatus.REJECTED;
    booking.cancellationReason = input.rejectionReason;

    if (!booking.timeline) booking.timeline = [];
    booking.timeline.push({
      status: BookingStatus.REJECTED,
      timestamp: new Date(),
      description: `Booking request rejected by provider: ${input.rejectionReason}`,
      updatedBy: new Types.ObjectId(userId),
    });

    await booking.save();
    logger.info('Booking rejected by provider', { bookingId, providerId: provider._id, userId });

    return booking;
  }

  async markOnTheWay(userId: string, bookingId: string) {
    const provider = await this.getOrCreateProvider(userId);
    const booking = await Booking.findOne({ _id: bookingId, cookId: provider._id, isDeleted: { $ne: true } });

    if (!booking) throw ApiError.notFound('Booking assignment not found');

    booking.status = BookingStatus.ON_THE_WAY;

    if (!booking.timeline) booking.timeline = [];
    booking.timeline.push({
      status: BookingStatus.ON_THE_WAY,
      timestamp: new Date(),
      description: 'Provider is on the way to customer location',
      updatedBy: new Types.ObjectId(userId),
    });

    await booking.save();
    logger.info('Provider marked on the way', { bookingId, providerId: provider._id, userId });

    return booking;
  }

  async markReached(userId: string, bookingId: string) {
    const provider = await this.getOrCreateProvider(userId);
    const booking = await Booking.findOne({ _id: bookingId, cookId: provider._id, isDeleted: { $ne: true } });

    if (!booking) throw ApiError.notFound('Booking assignment not found');

    if (!booking.timeline) booking.timeline = [];
    booking.timeline.push({
      status: booking.status,
      timestamp: new Date(),
      description: 'Provider reached customer location',
      updatedBy: new Types.ObjectId(userId),
    });

    await booking.save();
    logger.info('Provider reached customer location', { bookingId, providerId: provider._id, userId });

    return booking;
  }

  async startService(userId: string, bookingId: string) {
    const provider = await this.getOrCreateProvider(userId);
    const booking = await Booking.findOne({ _id: bookingId, cookId: provider._id, isDeleted: { $ne: true } });

    if (!booking) throw ApiError.notFound('Booking assignment not found');

    booking.status = BookingStatus.STARTED;
    booking.startedAt = new Date();

    if (!booking.timeline) booking.timeline = [];
    booking.timeline.push({
      status: BookingStatus.STARTED,
      timestamp: new Date(),
      description: 'Provider started service',
      updatedBy: new Types.ObjectId(userId),
    });

    await booking.save();
    logger.info('Provider started service', { bookingId, providerId: provider._id, userId });

    return booking;
  }

  async completeService(userId: string, bookingId: string, input: CompleteBookingInput) {
    const provider = await this.getOrCreateProvider(userId);
    const booking = await Booking.findOne({ _id: bookingId, cookId: provider._id, isDeleted: { $ne: true } });

    if (!booking) throw ApiError.notFound('Booking assignment not found');

    booking.status = BookingStatus.COMPLETED;
    booking.completedAt = new Date();

    if (input.completionPhoto) {
      if (!booking.photos) booking.photos = [];
      booking.photos.push(input.completionPhoto);
    }

    if (!booking.timeline) booking.timeline = [];
    booking.timeline.push({
      status: BookingStatus.COMPLETED,
      timestamp: new Date(),
      description: 'Provider completed service successfully',
      updatedBy: new Types.ObjectId(userId),
    });

    await booking.save();

    // Increment completed jobs on provider document
    provider.completedBookings = (provider.completedBookings || 0) + 1;
    await provider.save();

    logger.info('Provider completed service', { bookingId, providerId: provider._id, userId });

    return booking;
  }

  async getEarnings(userId: string) {
    const userObjectId = new Types.ObjectId(userId);

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [today, weekly, monthly, total, wallet, pending] = await Promise.all([
      Payment.aggregate([
        { $match: { providerId: userObjectId, paymentStatus: 'paid', createdAt: { $gte: startOfToday }, isDeleted: { $ne: true } } },
        { $group: { _id: null, sum: { $sum: '$amount' } } },
      ]),
      Payment.aggregate([
        { $match: { providerId: userObjectId, paymentStatus: 'paid', createdAt: { $gte: startOfWeek }, isDeleted: { $ne: true } } },
        { $group: { _id: null, sum: { $sum: '$amount' } } },
      ]),
      Payment.aggregate([
        { $match: { providerId: userObjectId, paymentStatus: 'paid', createdAt: { $gte: startOfMonth }, isDeleted: { $ne: true } } },
        { $group: { _id: null, sum: { $sum: '$amount' } } },
      ]),
      Payment.aggregate([
        { $match: { providerId: userObjectId, paymentStatus: 'paid', isDeleted: { $ne: true } } },
        { $group: { _id: null, sum: { $sum: '$amount' } } },
      ]),
      Wallet.findOne({ ownerId: userObjectId, ownerType: WalletOwnerType.PROVIDER }),
      Payment.aggregate([
        { $match: { providerId: userObjectId, paymentStatus: 'pending', isDeleted: { $ne: true } } },
        { $group: { _id: null, sum: { $sum: '$amount' } } },
      ]),
    ]);

    return {
      todayEarnings: today[0]?.sum || 0,
      weeklyEarnings: weekly[0]?.sum || 0,
      monthlyEarnings: monthly[0]?.sum || 0,
      totalEarnings: total[0]?.sum || 0,
      pendingPayments: pending[0]?.sum || 0,
      walletBalance: wallet?.balance || 0,
    };
  }

  async getReviews(userId: string) {
    const provider = await this.getOrCreateProvider(userId);
    const reviews = await Review.find({ cookId: provider._id, isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .populate('customerId', 'userId')
      .populate('bookingId', 'bookingNumber serviceType');

    return {
      averageRating: provider.averageRating,
      totalReviews: provider.totalReviews,
      reviews,
    };
  }

  async updateAvailability(userId: string, input: UpdateAvailabilityInput) {
    const provider = await this.getOrCreateProvider(userId);

    if (input.isAvailable !== undefined) provider.isAvailable = input.isAvailable;
    if (input.holidaySupport !== undefined) provider.holidaySupport = input.holidaySupport;
    if (input.schedule) provider.schedule = input.schedule as any;

    await provider.save();
    logger.info('Provider availability updated', { providerId: provider._id, isAvailable: provider.isAvailable });

    return provider;
  }

  async updateLocation(userId: string, input: UpdateLocationInput) {
    const provider = await this.getOrCreateProvider(userId);

    provider.location = {
      ...provider.location,
      latitude: input.latitude,
      longitude: input.longitude,
      currentAddress: input.currentAddress || provider.location?.currentAddress || '',
    };

    provider.geoPoint = {
      type: 'Point',
      coordinates: [input.longitude, input.latitude],
    };

    provider.lastSeen = new Date();
    await provider.save();

    logger.info('Provider location updated', { providerId: provider._id, lat: input.latitude, lng: input.longitude });

    return {
      latitude: input.latitude,
      longitude: input.longitude,
      lastSeen: provider.lastSeen,
    };
  }

  async getStatistics(userId: string) {
    const provider = await this.getOrCreateProvider(userId);

    const [totalAssigned, completed, cancelled, rejected] = await Promise.all([
      Booking.countDocuments({ cookId: provider._id, isDeleted: { $ne: true } }),
      Booking.countDocuments({ cookId: provider._id, status: BookingStatus.COMPLETED, isDeleted: { $ne: true } }),
      Booking.countDocuments({ cookId: provider._id, status: BookingStatus.CANCELLED, isDeleted: { $ne: true } }),
      Booking.countDocuments({ cookId: provider._id, status: BookingStatus.REJECTED, isDeleted: { $ne: true } }),
    ]);

    const acceptedOrDone = totalAssigned - rejected;
    const acceptanceRate = totalAssigned > 0 ? Math.round((acceptedOrDone / totalAssigned) * 100) : 100;
    const completionRate = totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 100;

    return {
      completedJobs: completed,
      cancelledJobs: cancelled,
      rejectedJobs: rejected,
      totalAssigned,
      acceptanceRate,
      completionRate,
      averageRating: provider.averageRating,
      responseTime: '15 mins',
    };
  }
}

export const providerDashboardService = new ProviderDashboardService();
