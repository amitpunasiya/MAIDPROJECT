import { Types } from 'mongoose';
import { User } from '../../../models/user.model.js';
import { Customer } from '../../../models/customer.model.js';
import { Provider } from '../../../models/provider.model.js';
import { Booking } from '../../../models/booking.model.js';
import { Payment } from '../../../models/payment.model.js';
import { Setting } from '../../../models/setting.model.js';
import { Notification } from '../../../models/notification.model.js';
import { ApiError } from '../../../utils/ApiError.js';
import { logger } from '../../../utils/logger.js';
import { BookingStatus } from '../../../types/domain.enums.js';
import type {
  AdminQueryInput,
  AssignProviderInput,
  UpdateBookingStatusInput,
  CancelBookingInput,
  RefundBookingInput,
  UpdateUserSettingsInput,
  UpdatePlatformSettingsInput,
  BroadcastNotificationInput,
} from '../validators/adminDashboard.validator.js';

export class AdminDashboardService {
  async getDashboardOverview() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      totalCustomers,
      totalProviders,
      totalCooks,
      totalMaids,
      activeProviders,
      pendingProviders,
      totalBookings,
      completedBookings,
      cancelledBookings,
      todayRevenueRes,
      weeklyRevenueRes,
      monthlyRevenueRes,
      totalRevenueRes,
    ] = await Promise.all([
      User.countDocuments({ isDeleted: { $ne: true } }),
      Customer.countDocuments({ isDeleted: { $ne: true } }),
      Provider.countDocuments({ isDeleted: { $ne: true } }),
      Provider.countDocuments({ providerType: 'cook', isDeleted: { $ne: true } }),
      Provider.countDocuments({ providerType: 'maid', isDeleted: { $ne: true } }),
      Provider.countDocuments({ isAvailable: true, isDeleted: { $ne: true } }),
      Provider.countDocuments({ verificationStatus: 'pending', isDeleted: { $ne: true } }),
      Booking.countDocuments({ isDeleted: { $ne: true } }),
      Booking.countDocuments({ status: BookingStatus.COMPLETED, isDeleted: { $ne: true } }),
      Booking.countDocuments({ status: BookingStatus.CANCELLED, isDeleted: { $ne: true } }),

      Payment.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: startOfToday }, isDeleted: { $ne: true } } },
        { $group: { _id: null, sum: { $sum: '$amount' } } },
      ]),
      Payment.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: startOfWeek }, isDeleted: { $ne: true } } },
        { $group: { _id: null, sum: { $sum: '$amount' } } },
      ]),
      Payment.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: startOfMonth }, isDeleted: { $ne: true } } },
        { $group: { _id: null, sum: { $sum: '$amount' } } },
      ]),
      Payment.aggregate([
        { $match: { paymentStatus: 'paid', isDeleted: { $ne: true } } },
        { $group: { _id: null, sum: { $sum: '$amount' } } },
      ]),
    ]);

    return {
      users: {
        total: totalUsers,
        customers: totalCustomers,
        providers: totalProviders,
        cooks: totalCooks,
        maids: totalMaids,
        activeProviders,
        pendingProviders,
      },
      bookings: {
        total: totalBookings,
        completed: completedBookings,
        cancelled: cancelledBookings,
      },
      revenue: {
        today: todayRevenueRes[0]?.sum || 0,
        weekly: weeklyRevenueRes[0]?.sum || 0,
        monthly: monthlyRevenueRes[0]?.sum || 0,
        total: totalRevenueRes[0]?.sum || 0,
      },
    };
  }

  async getAnalytics() {
    const [
      bookingTrends,
      revenueTrends,
      userGrowth,
      providerGrowth,
      serviceDistribution,
      topCities,
      topProviders,
      topCustomers,
    ] = await Promise.all([
      // Booking Trends (by month)
      Booking.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),

      // Revenue Trends (by month)
      Payment.aggregate([
        { $match: { paymentStatus: 'paid', isDeleted: { $ne: true } } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            revenue: { $sum: '$amount' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),

      // User Growth
      User.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            users: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),

      // Provider Growth
      Provider.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            providers: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),

      // Service Distribution
      Booking.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        { $group: { _id: '$serviceType', count: { $sum: 1 } } },
      ]),

      // Top Cities
      Provider.aggregate([
        { $match: { isDeleted: { $ne: true }, 'location.city': { $exists: true, $ne: '' } } },
        { $group: { _id: '$location.city', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // Top Providers
      Provider.find({ isDeleted: { $ne: true } })
        .sort({ averageRating: -1, completedBookings: -1 })
        .limit(5)
        .select('fullName providerType averageRating completedBookings profilePhoto'),

      // Top Customers
      Customer.find({ isDeleted: { $ne: true } })
        .sort({ completedBookings: -1 })
        .limit(5)
        .populate('userId', 'name email phone avatar'),
    ]);

    return {
      bookingTrends,
      revenueTrends,
      userGrowth,
      providerGrowth,
      serviceDistribution,
      topCities,
      topProviders,
      topCustomers,
    };
  }

  async getUsers(input: AdminQueryInput) {
    const page = Math.max(1, input.page ?? 1);
    const limit = Math.min(100, input.limit ?? 20);
    const skip = (page - 1) * limit;

    const filter: any = { isDeleted: { $ne: true } };
    if (input.role) filter.role = input.role;
    if (input.search) {
      filter.$or = [
        { name: new RegExp(input.search, 'i') },
        { email: new RegExp(input.search, 'i') },
        { phone: new RegExp(input.search, 'i') },
      ];
    }

    const [items, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateUser(id: string, input: UpdateUserSettingsInput, adminUserId: string) {
    const user = await User.findById(id);
    if (!user) throw ApiError.notFound('User not found');

    if (input.name) user.name = input.name;
    if (input.phone) user.phone = input.phone;
    if (input.role) user.role = input.role as any;
    if (input.isActive !== undefined) user.isActive = input.isActive;

    await user.save();
    logger.info('User updated by admin', { userId: id, adminUserId });
    return user;
  }

  async deleteUser(id: string, adminUserId: string) {
    const user = await User.findById(id);
    if (!user) throw ApiError.notFound('User not found');

    (user as any).isDeleted = true;
    user.isActive = false;
    await user.save();

    logger.info('User soft deleted by admin', { userId: id, adminUserId });
  }

  async getBookings(input: AdminQueryInput) {
    const page = Math.max(1, input.page ?? 1);
    const limit = Math.min(100, input.limit ?? 20);
    const skip = (page - 1) * limit;

    const filter: any = { isDeleted: { $ne: true } };
    if (input.status) filter.status = input.status;
    if (input.search) {
      filter.bookingNumber = new RegExp(input.search, 'i');
    }

    const [items, total] = await Promise.all([
      Booking.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('customerId', 'name phone email')
        .populate('cookId', 'fullName profilePhoto averageRating phone'),
      Booking.countDocuments(filter),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getBookingById(id: string) {
    const booking = await Booking.findById(id)
      .populate('customerId', 'name phone email')
      .populate('cookId', 'fullName profilePhoto averageRating phone')
      .populate('maidId', 'fullName profilePhoto averageRating phone');

    if (!booking) throw ApiError.notFound('Booking not found');
    return booking;
  }

  async assignProvider(bookingId: string, input: AssignProviderInput, adminUserId: string) {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw ApiError.notFound('Booking not found');

    const provider = await Provider.findById(input.providerId);
    if (!provider) throw ApiError.notFound('Provider not found');

    booking.cookId = provider._id;
    booking.status = BookingStatus.ASSIGNED;

    if (!booking.timeline) booking.timeline = [];
    booking.timeline.push({
      status: BookingStatus.ASSIGNED,
      timestamp: new Date(),
      description: `Assigned to provider ${provider.fullName} by admin`,
      updatedBy: new Types.ObjectId(adminUserId),
    });

    await booking.save();
    logger.info('Booking assigned to provider by admin', { bookingId, providerId: provider._id, adminUserId });

    return booking;
  }

  async updateBookingStatus(bookingId: string, input: UpdateBookingStatusInput, adminUserId: string) {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw ApiError.notFound('Booking not found');

    booking.status = input.status as BookingStatus;

    if (!booking.timeline) booking.timeline = [];
    booking.timeline.push({
      status: input.status as BookingStatus,
      timestamp: new Date(),
      description: input.note || `Status updated to ${input.status} by admin`,
      updatedBy: new Types.ObjectId(adminUserId),
    });

    await booking.save();
    logger.info('Booking status updated by admin', { bookingId, status: input.status, adminUserId });

    return booking;
  }

  async cancelBooking(bookingId: string, input: CancelBookingInput, adminUserId: string) {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw ApiError.notFound('Booking not found');

    booking.status = BookingStatus.CANCELLED;
    booking.cancellationReason = input.cancellationReason;
    booking.cancelledAt = new Date();
    booking.cancelledBy = new Types.ObjectId(adminUserId);

    if (!booking.timeline) booking.timeline = [];
    booking.timeline.push({
      status: BookingStatus.CANCELLED,
      timestamp: new Date(),
      description: `Cancelled by admin: ${input.cancellationReason}`,
      updatedBy: new Types.ObjectId(adminUserId),
    });

    await booking.save();
    logger.info('Booking cancelled by admin', { bookingId, adminUserId });

    return booking;
  }

  async refundBooking(bookingId: string, input: RefundBookingInput, adminUserId: string) {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw ApiError.notFound('Booking not found');

    const payment = await Payment.findOne({ bookingId: booking._id });
    if (payment) {
      payment.paymentStatus = 'refunded';
      payment.refundAmount = input.refundAmount;
      payment.refundedAt = new Date();
      await payment.save();
    }

    if (!booking.timeline) booking.timeline = [];
    booking.timeline.push({
      status: booking.status,
      timestamp: new Date(),
      description: `Refund of ₹${input.refundAmount} issued by admin: ${input.reason}`,
      updatedBy: new Types.ObjectId(adminUserId),
    });

    await booking.save();
    logger.info('Booking refund issued by admin', { bookingId, refundAmount: input.refundAmount, adminUserId });

    return { booking, payment };
  }

  async broadcastNotification(input: BroadcastNotificationInput, adminUserId: string) {
    let query: any = { isDeleted: { $ne: true } };
    if (input.targetRole !== 'all') {
      query.role = input.targetRole;
    }

    const users = await User.find(query).select('_id');
    const docs = users.map((u) => ({
      userId: u._id,
      title: input.title,
      message: input.body,
      isRead: false,
      createdAt: new Date(),
    }));

    if (docs.length > 0) {
      await Notification.insertMany(docs);
    }

    logger.info('Broadcast notification sent by admin', { targetRole: input.targetRole, totalSent: docs.length, adminUserId });

    return { totalSent: docs.length };
  }

  async getPlatformSettings() {
    let setting = await Setting.findOne({ key: 'platform_config' });
    if (!setting) {
      setting = await Setting.create({
        category: 'global',
        key: 'platform_config',
        value: {
          platformName: 'Maid & Cook Service Platform',
          supportEmail: 'support@maidproject.com',
          supportPhone: '+91 9999999999',
          taxPercentage: 5,
          platformCommissionPercentage: 10,
          cancellationFee: 50,
          autoAssignProviders: false,
          maxSearchRadiusKm: 15,
          paymentGateways: { razorpayEnabled: true, stripeEnabled: true, codEnabled: true },
          notifications: { emailEnabled: true, smsEnabled: true, pushEnabled: true, whatsappEnabled: true },
        },
        description: 'Global Platform Configuration Settings',
        isPublic: true,
      });
    }
    return setting.value;
  }

  async updatePlatformSettings(input: UpdatePlatformSettingsInput, adminUserId: string) {
    let setting = await Setting.findOne({ key: 'platform_config' });
    if (!setting) {
      await this.getPlatformSettings();
      setting = await Setting.findOne({ key: 'platform_config' });
    }

    if (setting) {
      setting.value = {
        ...setting.value,
        ...input,
      };
      await setting.save();
    }

    logger.info('Platform settings updated by admin', { adminUserId });
    return setting?.value;
  }

  async exportCsvReport(reportType: string) {
    if (reportType === 'revenue') {
      const payments = await Payment.find({ paymentStatus: 'paid', isDeleted: { $ne: true } })
        .sort({ createdAt: -1 })
        .limit(100);
      const headers = ['Transaction ID', 'Booking ID', 'Amount', 'Currency', 'Payment Method', 'Date'];
      const rows = payments.map((p) => [
        p.transactionId || p._id.toString(),
        p.bookingId?.toString() || '',
        p.amount,
        p.currency,
        p.paymentMethod,
        p.createdAt.toISOString(),
      ]);
      return [headers.join(','), ...rows.map((r) => r.map((val) => `"${val}"`).join(','))].join('\n');
    }

    const bookings = await Booking.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 }).limit(100);
    const headers = ['Booking Number', 'Service Type', 'Status', 'Scheduled Date', 'Total Amount'];
    const rows = bookings.map((b) => [
      b.bookingNumber,
      b.serviceType,
      b.status,
      b.scheduledDate?.toISOString() || '',
      b.pricing?.totalAmount || 0,
    ]);
    return [headers.join(','), ...rows.map((r) => r.map((val) => `"${val}"`).join(','))].join('\n');
  }
}

export const adminDashboardService = new AdminDashboardService();
