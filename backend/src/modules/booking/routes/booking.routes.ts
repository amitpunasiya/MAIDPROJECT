import { Router } from 'express';
import { bookingController } from '../controllers/booking.controller.js';
import { authenticateOptional, authenticate } from '../../../middleware/auth/authenticate.js';
import {
  authorize,
  authorizeCustomer,
  authorizeCook,
  authorizeMaid,
} from '../../../middleware/auth/authorize.js';
import { validate } from '../../../middleware/validation/validate.js';
import {
  createBookingSchema,
  updateBookingSchema,
  cancelBookingSchema,
  rejectBookingSchema,
  acceptBookingSchema,
  startServiceSchema,
  completeBookingSchema,
} from '../validators/booking.validator.js';
import { UserRole } from '../../../types/auth.types.js';

const router = Router();

// Public / Optional Auth creation & queries
router.post('/', authenticateOptional, validate(createBookingSchema), bookingController.create);
router.post('/match-providers', bookingController.matchProviders);
router.get('/', authenticateOptional, bookingController.search);
router.get('/check-availability', bookingController.checkAvailability);

// Recurring Bookings Endpoints
router.post('/recurring', authenticateOptional, bookingController.createRecurring);
router.get('/recurring', authenticateOptional, bookingController.getRecurring);
router.post('/recurring/:id/pause', authenticateOptional, bookingController.pauseRecurring);
router.post('/recurring/:id/resume', authenticateOptional, bookingController.resumeRecurring);
router.delete('/recurring/:id', authenticateOptional, bookingController.cancelRecurring);

// Authenticated Routes
router.get('/upcoming', authenticate, bookingController.getUpcoming);

// Role Specific Booking Histories
router.get('/customer/history', authenticate, authorizeCustomer, bookingController.getCustomerHistory);
router.get('/cook/history', authenticate, authorizeCook, bookingController.getCookHistory);
router.get('/maid/history', authenticate, authorizeMaid, bookingController.getMaidHistory);
router.get('/history', authenticate, bookingController.getHistory);

// Single Booking Info & Timeline
router.get('/:id', authenticateOptional, bookingController.getById);
router.get('/:id/timeline', authenticateOptional, bookingController.getTimeline);

// Booking Updates & Deletions
router.put('/:id', authenticateOptional, validate(updateBookingSchema), bookingController.update);
router.patch('/:id', authenticateOptional, validate(updateBookingSchema), bookingController.update);
router.delete('/:id', authenticateOptional, bookingController.delete);

const authorizeProvider = authorize(UserRole.COOK, UserRole.MAID, UserRole.ADMIN);

router.patch('/:id/assign', authenticateOptional, bookingController.assign);
router.patch('/:id/status', authenticateOptional, bookingController.updateStatus);
router.patch('/:id/accept', authenticate, authorizeProvider, validate(acceptBookingSchema), bookingController.accept);
router.patch('/:id/reject', authenticate, authorizeProvider, validate(rejectBookingSchema), bookingController.reject);
router.get('/:id/otp', authenticateOptional, bookingController.getStartOtp);
router.patch('/:id/arrived', authenticateOptional, bookingController.markArrived);
router.patch('/:id/location', authenticateOptional, bookingController.updateLocation);
router.post('/:id/verify-start-otp', authenticateOptional, bookingController.verifyStartOtp);
router.patch('/:id/on-the-way', authenticateOptional, bookingController.onTheWay);
router.patch('/:id/start', authenticate, authorizeProvider, validate(startServiceSchema), bookingController.start);
router.patch('/:id/complete', authenticate, authorizeProvider, validate(completeBookingSchema), bookingController.complete);
router.patch('/:id/cancel', authenticateOptional, validate(cancelBookingSchema), bookingController.cancel);

export default router;
