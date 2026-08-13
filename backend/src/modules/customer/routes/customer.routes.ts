import { Router } from 'express';
import { customerController } from '../controllers/customer.controller.js';
import { authenticate, requireRoles } from '../../auth/middlewares/auth.middleware.js';
import { validate } from '../../../middleware/validation/validate.js';
import { UserRole } from '../../../types/auth.types.js';
import {
  updateCustomerProfileSchema,
  customerBookingQuerySchema,
  cancelBookingSchema,
  rescheduleBookingSchema,
  repeatBookingSchema,
  createCustomerReviewSchema,
  updateCustomerReviewSchema,
  customerAddressSchema,
  updateCustomerAddressSchema,
} from '../validators/customer.validator.js';

const router = Router();

// All customer routes require authentication and customer role access
router.use(authenticate);
router.use(requireRoles(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.SUPER_ADMIN));

// Dashboard Analytics
router.get('/dashboard', customerController.getDashboard);

// Profile
router.get('/profile', customerController.getProfile);
router.patch('/profile', validate(updateCustomerProfileSchema), customerController.updateProfile);

// Bookings
router.get('/bookings', validate(customerBookingQuerySchema, 'query'), customerController.getBookings);
router.get('/bookings/:id', customerController.getBookingById);
router.patch('/bookings/:id/cancel', validate(cancelBookingSchema), customerController.cancelBooking);
router.patch('/bookings/:id/reschedule', validate(rescheduleBookingSchema), customerController.rescheduleBooking);
router.post('/bookings/:id/repeat', validate(repeatBookingSchema), customerController.repeatBooking);

// Payments
router.get('/payments', customerController.getPayments);

// Reviews
router.get('/reviews', customerController.getReviews);
router.post('/reviews', validate(createCustomerReviewSchema), customerController.createReview);
router.patch('/reviews/:id', validate(updateCustomerReviewSchema), customerController.updateReview);
router.delete('/reviews/:id', customerController.deleteReview);

// Addresses
router.get('/addresses', customerController.getAddresses);
router.post('/addresses', validate(customerAddressSchema), customerController.createAddress);
router.patch('/addresses/:id/default', customerController.setDefaultAddress);
router.patch('/addresses/:id', validate(updateCustomerAddressSchema), customerController.updateAddress);
router.delete('/addresses/:id', customerController.deleteAddress);

// Notifications
router.get('/notifications', customerController.getNotifications);
router.patch('/notifications/read-all', customerController.markAllNotificationsRead);
router.patch('/notifications/:id/read', customerController.markNotificationRead);

export default router;
