import { reportsRepository, type DashboardReportData } from '../repositories/reports.repository.js';
import { Booking } from '../../../models/booking.model.js';
import { activityLogService } from '../../activityLogs/services/activityLog.service.js';
import { logger } from '../../../utils/logger.js';

export class ReportsService {
  async getDashboardReport(startDate?: Date, endDate?: Date, adminUserId?: string): Promise<DashboardReportData> {
    const data = await reportsRepository.getDashboardAnalytics(startDate, endDate);

    if (adminUserId) {
      void activityLogService.log({
        userId: adminUserId,
        userRole: 'admin',
        action: 'GET_REPORTS_DASHBOARD',
        module: 'reports',
        details: { startDate, endDate },
      });
    }

    logger.info('Reports dashboard retrieved', { adminUserId, startDate, endDate });

    return data;
  }

  async getRevenueReportData(startDate?: Date, endDate?: Date) {
    const query: any = { status: 'completed', isDeleted: false };
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = startDate;
      if (endDate) query.createdAt.$lte = endDate;
    }

    const bookings = await Booking.find(query).sort({ createdAt: -1 }).limit(500);

    return bookings.map((b) => ({
      bookingId: b._id.toString(),
      bookingNumber: b.bookingNumber,
      serviceType: b.serviceType,
      status: b.status,
      amount: b.pricing?.totalAmount || 0,
      scheduledDate: b.scheduledDate?.toISOString() || '',
      date: b.createdAt.toISOString(),
    }));
  }

  exportToCsv(data: Record<string, any>[]): string {
    if (!data.length) return '';
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map((header) => {
        const val = row[header] ?? '';
        const escaped = String(val).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }
}

export const reportsService = new ReportsService();
