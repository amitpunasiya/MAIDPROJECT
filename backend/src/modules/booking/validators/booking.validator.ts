import { z } from 'zod';
import { BookingStatus, ServiceType } from '../../../types/domain.enums.js';

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
const pincodeRegex = /^\d{6}$/;

const addressSchema = z.object({
  street: z.string().trim().min(1, 'Street is required').max(200),
  houseNo: z.string().trim().max(100).optional(),
  floor: z.string().trim().max(50).optional(),
  landmark: z.string().trim().max(150).optional(),
  city: z.string().trim().min(1, 'City is required').max(100),
  state: z.string().trim().min(1, 'State is required').max(100),
  pincode: z.string().trim().regex(pincodeRegex, 'Pincode must be a valid 6-digit number'),
  country: z.string().trim().min(1).max(100).default('India'),
  coordinates: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    })
    .optional(),
});

export const createBookingSchema = z
  .object({
    cookId: z.string().trim().optional(),
    providerId: z.string().trim().optional(),
    serviceType: z.nativeEnum(ServiceType).default(ServiceType.COOK),
    scheduledDate: z.coerce.date().refine((date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const scheduled = new Date(date);
      scheduled.setHours(0, 0, 0, 0);
      return scheduled >= today;
    }, 'Scheduled date cannot be in the past'),
    startTime: z.string().trim().regex(timePattern, 'Start time must be in HH:mm format'),
    endTime: z.string().trim().regex(timePattern, 'End time must be in HH:mm format'),
    durationHours: z.number().min(0.5, 'Duration must be at least 0.5 hours').max(24).default(2),
    serviceAddress: addressSchema,
    hourlyRate: z.number().min(0, 'Hourly rate cannot be negative').default(250),
    taskName: z.string().trim().optional(),
    taskDetails: z.record(z.unknown()).optional(),
    instructions: z.string().trim().max(1000).optional(),
    photos: z.array(z.string()).optional(),
    notes: z.string().trim().max(1000).optional(),
    slotType: z.enum(['PREDEFINED', 'CUSTOM']).optional().default('PREDEFINED'),
    providerSelectionMode: z.enum(['SPECIFIC', 'AUTO_MATCH']).optional().default('SPECIFIC'),
  })
  .refine(
    (data) => {
      return data.endTime > data.startTime;
    },
    {
      message: 'End time must be after start time',
      path: ['endTime'],
    },
  );

export const updateBookingSchema = z
  .object({
    scheduledDate: z.coerce.date().optional(),
    startTime: z.string().trim().regex(timePattern, 'Start time must be in HH:mm format').optional(),
    endTime: z.string().trim().regex(timePattern, 'End time must be in HH:mm format').optional(),
    durationHours: z.number().min(0.5).max(24).optional(),
    serviceAddress: addressSchema.optional(),
    status: z.nativeEnum(BookingStatus).optional(),
    notes: z.string().trim().max(1000).optional(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return data.endTime > data.startTime;
      }
      return true;
    },
    {
      message: 'End time must be after start time',
      path: ['endTime'],
    },
  );

export const cancelBookingSchema = z.object({
  cancellationReason: z
    .string()
    .trim()
    .min(3, 'Cancellation reason must be at least 3 characters')
    .max(500, 'Cancellation reason cannot exceed 500 characters')
    .optional(),
});

export const rejectBookingSchema = z.object({
  rejectionReason: z
    .string()
    .trim()
    .min(3, 'Rejection reason must be at least 3 characters')
    .max(500, 'Rejection reason cannot exceed 500 characters')
    .optional(),
  notes: z.string().trim().max(500).optional(),
});

export const acceptBookingSchema = z.object({
  notes: z.string().trim().max(500).optional(),
});

export const startServiceSchema = z.object({
  notes: z.string().trim().max(500).optional(),
});

export const completeBookingSchema = z.object({
  notes: z.string().trim().max(500).optional(),
});

export const checkAvailabilityQuerySchema = z.object({
  cookId: z.string().trim().min(1, 'Provider ID (cookId) is required'),
  date: z.string().trim().min(1, 'Date is required'),
  startTime: z.string().trim().regex(timePattern, 'Start time must be in HH:mm format'),
  endTime: z.string().trim().regex(timePattern, 'End time must be in HH:mm format').optional(),
  durationHours: z.coerce.number().min(0.5).max(24).optional(),
  slotType: z.enum(['PREDEFINED', 'CUSTOM']).optional().default('CUSTOM'),
});

const emptyStringToUndefined = (val: unknown) =>
  val === '' || val === 'all' || val === null || val === 'undefined' ? undefined : val;

export const bookingListQuerySchema = z.object({
  search: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
  status: z.preprocess(emptyStringToUndefined, z.nativeEnum(BookingStatus).optional()),
  serviceType: z.preprocess(emptyStringToUndefined, z.nativeEnum(ServiceType).optional()),
  startDate: z.preprocess(emptyStringToUndefined, z.coerce.date().optional()),
  endDate: z.preprocess(emptyStringToUndefined, z.coerce.date().optional()),
  minAmount: z.preprocess(emptyStringToUndefined, z.coerce.number().min(0).optional()),
  maxAmount: z.preprocess(emptyStringToUndefined, z.coerce.number().min(0).optional()),
  cookId: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
  providerId: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
  customerId: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
  page: z.preprocess(emptyStringToUndefined, z.coerce.number().min(1).default(1)),
  limit: z.preprocess(emptyStringToUndefined, z.coerce.number().min(1).max(100).default(10)),
  sort: z.preprocess(emptyStringToUndefined, z.enum(['scheduledDate', 'createdAt', 'pricing.totalAmount']).default('scheduledDate')),
  order: z.preprocess(emptyStringToUndefined, z.enum(['asc', 'desc']).default('desc')),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
export type RejectBookingInput = z.infer<typeof rejectBookingSchema>;
export type AcceptBookingInput = z.infer<typeof acceptBookingSchema>;
export type StartServiceInput = z.infer<typeof startServiceSchema>;
export type CompleteBookingInput = z.infer<typeof completeBookingSchema>;
export type CheckAvailabilityQueryInput = z.infer<typeof checkAvailabilityQuerySchema>;
export type BookingListQueryInput = z.infer<typeof bookingListQuerySchema>;
