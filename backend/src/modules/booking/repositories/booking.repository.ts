import { BaseRepository } from '../../../repositories/base.repository.js';
import { Booking, type IBookingDocument } from '../models/booking.model.js';
import type { FilterQuery, Types } from 'mongoose';
import { BookingStatus } from '../../../types/domain.enums.js';
import { mergeNotDeleted } from '../../../models/common/softDelete.js';
import type { BookingListQueryInput } from '../validators/booking.validator.js';

export interface PaginatedBookingsResult {
  bookings: IBookingDocument[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class BookingRepository extends BaseRepository<IBookingDocument> {
  constructor() {
    super(Booking);
  }

  async findByBookingNumber(bookingNumber: string): Promise<IBookingDocument | null> {
    return this.model
      .findOne(mergeNotDeleted({ bookingNumber: bookingNumber.toUpperCase() }))
      .populate('customerId', 'name email phone avatar address')
      .populate('cookId', 'name email phone avatar address')
      .exec();
  }

  async findBookingById(id: string | Types.ObjectId): Promise<IBookingDocument | null> {
    return this.model
      .findOne(mergeNotDeleted({ _id: id }))
      .populate('customerId', 'name email phone avatar address')
      .populate('cookId', 'name email phone avatar address')
      .exec();
  }

  async findOverlappingBookings(
    cookId: string | Types.ObjectId,
    scheduledDate: Date,
    startTime: string,
    endTime: string,
    excludeBookingId?: string | Types.ObjectId,
  ): Promise<IBookingDocument[]> {
    const startOfDay = new Date(scheduledDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(scheduledDate);
    endOfDay.setHours(23, 59, 59, 999);

    const filter: FilterQuery<IBookingDocument> = mergeNotDeleted({
      cookId,
      scheduledDate: { $gte: startOfDay, $lte: endOfDay },
      status: {
        $in: [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS],
      },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    if (excludeBookingId) {
      filter._id = { $ne: excludeBookingId };
    }

    return this.model.find(filter).exec();
  }

  async searchBookings(
    queryParams: BookingListQueryInput,
    baseFilter: FilterQuery<IBookingDocument> = {},
  ): Promise<PaginatedBookingsResult> {
    const {
      search,
      status,
      serviceType,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      cookId,
      providerId,
      customerId,
      page,
      limit,
      sort,
      order,
    } = queryParams;

    const filter: FilterQuery<IBookingDocument> = mergeNotDeleted({
      ...baseFilter,
    });

    if (status) {
      filter.status = status;
    }

    if (serviceType) {
      filter.serviceType = serviceType;
    }

    const effectiveProviderId = cookId || providerId;
    if (effectiveProviderId) {
      filter.cookId = effectiveProviderId;
    }

    if (customerId) {
      filter.customerId = customerId;
    }

    if (startDate || endDate) {
      filter.scheduledDate = {};
      if (startDate) {
        const sDate = new Date(startDate);
        sDate.setHours(0, 0, 0, 0);
        filter.scheduledDate.$gte = sDate;
      }
      if (endDate) {
        const eDate = new Date(endDate);
        eDate.setHours(23, 59, 59, 999);
        filter.scheduledDate.$lte = eDate;
      }
    }

    if (minAmount !== undefined || maxAmount !== undefined) {
      filter['pricing.totalAmount'] = {};
      if (minAmount !== undefined) filter['pricing.totalAmount'].$gte = minAmount;
      if (maxAmount !== undefined) filter['pricing.totalAmount'].$lte = maxAmount;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { bookingNumber: searchRegex },
        { notes: searchRegex },
        { 'serviceAddress.city': searchRegex },
        { 'serviceAddress.street': searchRegex },
        { 'serviceAddress.state': searchRegex },
      ];
    }

    const sortOption: Record<string, 1 | -1> = {
      [sort]: order === 'asc' ? 1 : -1,
    };

    return this.getPaginatedBookings(filter, page, limit, sortOption);
  }

  async findCustomerBookings(
    customerId: string | Types.ObjectId,
    queryParams: BookingListQueryInput,
  ): Promise<PaginatedBookingsResult> {
    return this.searchBookings(queryParams, { customerId });
  }

  async findProviderBookings(
    providerId: string | Types.ObjectId,
    queryParams: BookingListQueryInput,
  ): Promise<PaginatedBookingsResult> {
    return this.searchBookings(queryParams, { cookId: providerId });
  }

  async findUpcoming(
    userId: string | Types.ObjectId,
    isProvider: boolean,
  ): Promise<IBookingDocument[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const userFilter = isProvider ? { cookId: userId } : { customerId: userId };
    const filter: FilterQuery<IBookingDocument> = mergeNotDeleted({
      ...userFilter,
      scheduledDate: { $gte: today },
      status: {
        $in: [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS],
      },
    });

    return this.model
      .find(filter)
      .sort({ scheduledDate: 1, startTime: 1 })
      .populate('customerId', 'name email phone avatar address')
      .populate('cookId', 'name email phone avatar address')
      .exec();
  }

  async findHistory(
    userId: string | Types.ObjectId,
    isProvider: boolean,
    queryParams: BookingListQueryInput,
  ): Promise<PaginatedBookingsResult> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const userFilter = isProvider ? { cookId: userId } : { customerId: userId };
    const baseFilter: FilterQuery<IBookingDocument> = {
      ...userFilter,
      $or: [
        { status: { $in: [BookingStatus.COMPLETED, BookingStatus.CANCELLED, BookingStatus.REFUNDED] } },
        { scheduledDate: { $lt: today } },
      ],
    };

    return this.searchBookings(queryParams, baseFilter);
  }

  private async getPaginatedBookings(
    filter: FilterQuery<IBookingDocument>,
    page: number,
    limit: number,
    sortOption: Record<string, 1 | -1> = { scheduledDate: -1, createdAt: -1 },
  ): Promise<PaginatedBookingsResult> {
    const skip = (page - 1) * limit;
    const total = await this.model.countDocuments(filter);
    const bookings = await this.model
      .find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate('customerId', 'name email phone avatar address')
      .populate('cookId', 'name email phone avatar address')
      .exec();

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      bookings,
      total,
      page,
      limit,
      totalPages,
    };
  }
}

export const bookingRepository = new BookingRepository();
