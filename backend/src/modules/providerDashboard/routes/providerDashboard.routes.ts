import { Router } from 'express';
import { providerDashboardController } from '../controllers/providerDashboard.controller.js';
import { authenticate, requireRoles } from '../../auth/middlewares/auth.middleware.js';
import { validate } from '../../../middleware/validation/validate.js';
import { UserRole } from '../../../types/auth.types.js';
import {
  updateProviderProfileSchema,
  providerBookingQuerySchema,
  rejectBookingSchema,
  completeBookingSchema,
  updateAvailabilitySchema,
  updateLocationSchema,
} from '../validators/providerDashboard.validator.js';

const router = Router();

// All provider dashboard routes require authentication and provider role access (Cook/Maid/Provider/Admin)
router.use(authenticate);
router.use(requireRoles(UserRole.COOK, UserRole.MAID, UserRole.PROVIDER, UserRole.ADMIN, UserRole.SUPER_ADMIN));

// Dashboard Analytics
router.get('/dashboard', providerDashboardController.getDashboard);

// Profile
router.get('/profile', providerDashboardController.getProfile);
router.patch('/profile', validate(updateProviderProfileSchema), providerDashboardController.updateProfile);

// Today's & Scheduled Bookings
router.get('/bookings', validate(providerBookingQuerySchema, 'query'), providerDashboardController.getBookings);
router.get('/bookings/today', providerDashboardController.getTodayBookings);
router.get('/bookings/upcoming', providerDashboardController.getUpcomingBookings);

// Booking Actions & Timeline Events
router.patch('/bookings/:id/accept', providerDashboardController.acceptBooking);
router.patch('/bookings/:id/reject', validate(rejectBookingSchema), providerDashboardController.rejectBooking);
router.patch('/bookings/:id/on-the-way', providerDashboardController.markOnTheWay);
router.patch('/bookings/:id/reached', providerDashboardController.markReached);
router.patch('/bookings/:id/start', providerDashboardController.startService);
router.patch('/bookings/:id/complete', validate(completeBookingSchema), providerDashboardController.completeService);

// Earnings & Wallet
router.get('/earnings', providerDashboardController.getEarnings);

// Reviews & Feedback
router.get('/reviews', providerDashboardController.getReviews);

// Availability
router.patch('/availability', validate(updateAvailabilitySchema), providerDashboardController.updateAvailability);

// Location & Live Tracking
router.patch('/location', validate(updateLocationSchema), providerDashboardController.updateLocation);

// Statistics
router.get('/statistics', providerDashboardController.getStatistics);

export default router;
