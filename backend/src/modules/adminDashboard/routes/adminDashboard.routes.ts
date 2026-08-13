import { Router } from 'express';
import { adminDashboardController } from '../controllers/adminDashboard.controller.js';
import { authenticate, requireRoles } from '../../auth/middlewares/auth.middleware.js';
import { validate } from '../../../middleware/validation/validate.js';
import { UserRole } from '../../../types/auth.types.js';
import {
  adminQuerySchema,
  assignProviderSchema,
  updateBookingStatusSchema,
  cancelBookingSchema,
  refundBookingSchema,
  updateUserSettingsSchema,
  updatePlatformSettingsSchema,
  broadcastNotificationSchema,
} from '../validators/adminDashboard.validator.js';

const router = Router();

// Protect ALL Admin Dashboard endpoints using authenticate and requireRoles(ADMIN, SUPER_ADMIN)
router.use(authenticate);
router.use(requireRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN));

// Overview & Analytics
router.get('/dashboard', adminDashboardController.getOverview);
router.get('/overview', adminDashboardController.getOverview);
router.get('/analytics', adminDashboardController.getAnalytics);

// User Management
router.get('/users', validate(adminQuerySchema, 'query'), adminDashboardController.getUsers);
router.patch('/users/:id', validate(updateUserSettingsSchema), adminDashboardController.updateUser);
router.delete('/users/:id', adminDashboardController.deleteUser);

// Booking Management
router.get('/bookings', validate(adminQuerySchema, 'query'), adminDashboardController.getBookings);
router.get('/bookings/:id', adminDashboardController.getBookingById);
router.patch('/bookings/:id/assign', validate(assignProviderSchema), adminDashboardController.assignProvider);
router.patch('/bookings/:id/status', validate(updateBookingStatusSchema), adminDashboardController.updateBookingStatus);
router.patch('/bookings/:id/cancel', validate(cancelBookingSchema), adminDashboardController.cancelBooking);
router.patch('/bookings/:id/refund', validate(refundBookingSchema), adminDashboardController.refundBooking);

// Broadcast Notifications
router.post('/notifications/broadcast', validate(broadcastNotificationSchema), adminDashboardController.broadcastNotification);

// Platform Settings
router.get('/settings', adminDashboardController.getSettings);
router.patch('/settings', validate(updatePlatformSettingsSchema), adminDashboardController.updateSettings);

// Reports & Export
router.get('/reports/export/csv', adminDashboardController.exportReportCsv);

export default router;
