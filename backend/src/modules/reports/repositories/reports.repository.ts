import { Booking } from '../../../models/booking.model.js';
import { Provider } from '../../../models/provider.model.js';
import { Customer } from '../../../models/customer.model.js';
import { User } from '../../../models/user.model.js';
import { Payment } from '../../../models/payment.model.js';
import { Wallet } from '../../../models/wallet.model.js';
import { Transaction } from '../../../models/transaction.model.js';
import { BookingStatus } from '../../../types/domain.enums.js';

export interface DashboardReportData {
  totalUsers: number;
  totalCustomers: number;
  totalProviders: number;
  activeProviders: number;
  onlineProviders: number;

  totalBookings: number;
  todaysBookings: number;
  weeklyBookings: number;
  monthlyBookings: number;
  completedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;

  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  revenueLifetime: number;

  walletBalance: number;
  totalTransactions: number;

  averageBookingValue: number;
  averageRating: number;

  topProviders: any[];
  topCities: any[];
  mostBookedServices: any[];
  bookingGrowth: any[];
  revenueGrowth: any[];
}

export class ReportsRepository {
  async getDashboardAnalytics(startDate?: Date, endDate?: Date): Promise<DashboardReportData> {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);

    const bookingDateFilter: any = { isDeleted: { $ne: true } };
    const paymentDateFilter: any = { paymentStatus: 'paid', isDeleted: { $ne: true } };

    if (startDate || endDate) {
      bookingDateFilter.createdAt = {};
      paymentDateFilter.createdAt = {};
      if (startDate) {
        bookingDateFilter.createdAt.$gte = startDate;
        paymentDateFilter.createdAt.$gte = startDate;
      }
      if (endDate) {
        bookingDateFilter.createdAt.$lte = endDate;
        paymentDateFilter.createdAt.$lte = endDate;
      }
    }

    const [
      totalUsers,
      totalCustomers,
      totalProviders,
      activeProviders,
      onlineProviders,
      totalBookings,
      todaysBookings,
      weeklyBookings,
      monthlyBookings,
      completedBookings,
      pendingBookings,
      cancelledBookings,
      revenueTodayRes,
      revenueThisWeekRes,
      revenueThisMonthRes,
      revenueLifetimeRes,
      walletBalanceRes,
      totalTransactions,
      avgBookingValRes,
      avgRatingRes,
      topProviders,
      topCities,
      mostBookedServices,
      bookingGrowth,
      revenueGrowth,
    ] = await Promise.all([
      User.countDocuments({ isDeleted: { $ne: true } }),
      Customer.countDocuments({ isDeleted: { $ne: true } }),
      Provider.countDocuments({ isDeleted: { $ne: true } }),
      Provider.countDocuments({ isAvailable: true, isDeleted: { $ne: true } }),
      Provider.countDocuments({ isAvailable: true, lastSeen: { $gte: fifteenMinsAgo }, isDeleted: { $ne: true } }),

      Booking.countDocuments(bookingDateFilter),
      Booking.countDocuments({ scheduledDate: { $gte: startOfToday, $lte: endOfToday }, isDeleted: { $ne: true } }),
      Booking.countDocuments({ createdAt: { $gte: startOfWeek }, isDeleted: { $ne: true } }),
      Booking.countDocuments({ createdAt: { $gte: startOfMonth }, isDeleted: { $ne: true } }),
      Booking.countDocuments({ ...bookingDateFilter, status: BookingStatus.COMPLETED }),
      Booking.countDocuments({ ...bookingDateFilter, status: BookingStatus.PENDING }),
      Booking.countDocuments({ ...bookingDateFilter, status: BookingStatus.CANCELLED }),

      Payment.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: startOfToday, $lte: endOfToday }, isDeleted: { $ne: true } } },
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
        { $match: paymentDateFilter },
        { $group: { _id: null, sum: { $sum: '$amount' } } },
      ]),

      Wallet.aggregate([
        { $match: { isActive: true, isDeleted: { $ne: true } } },
        { $group: { _id: null, sum: { $sum: '$balance' } } },
      ]),
      Transaction.countDocuments({ isDeleted: { $ne: true } }),

      Booking.aggregate([
        { $match: { status: BookingStatus.COMPLETED, isDeleted: { $ne: true } } },
        { $group: { _id: null, avg: { $avg: '$pricing.totalAmount' } } },
      ]),

      Provider.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        { $group: { _id: null, avg: { $avg: '$averageRating' } } },
      ]),

      Provider.find({ isDeleted: { $ne: true } })
        .sort({ averageRating: -1, completedBookings: -1 })
        .limit(5)
        .select('fullName providerType averageRating completedBookings profilePhoto location'),

      Provider.aggregate([
        { $match: { isDeleted: { $ne: true }, 'location.city': { $exists: true, $ne: '' } } },
        { $group: { _id: '$location.city', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      Booking.aggregate([
        { $match: bookingDateFilter },
        { $group: { _id: '$serviceType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      Booking.aggregate([
        { $match: bookingDateFilter },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),

      Payment.aggregate([
        { $match: paymentDateFilter },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            revenue: { $sum: '$amount' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

    return {
      totalUsers,
      totalCustomers,
      totalProviders,
      activeProviders,
      onlineProviders,

      totalBookings,
      todaysBookings,
      weeklyBookings,
      monthlyBookings,
      completedBookings,
      pendingBookings,
      cancelledBookings,

      revenueToday: revenueTodayRes[0]?.sum || 0,
      revenueThisWeek: revenueThisWeekRes[0]?.sum || 0,
      revenueThisMonth: revenueThisMonthRes[0]?.sum || 0,
      revenueLifetime: revenueLifetimeRes[0]?.sum || 0,

      walletBalance: walletBalanceRes[0]?.sum || 0,
      totalTransactions,

      averageBookingValue: Math.round(avgBookingValRes[0]?.avg || 0),
      averageRating: Math.round((avgRatingRes[0]?.avg || 5) * 10) / 10,

      topProviders,
      topCities,
      mostBookedServices,
      bookingGrowth,
      revenueGrowth,
    };
  }
}

export const reportsRepository = new ReportsRepository();
