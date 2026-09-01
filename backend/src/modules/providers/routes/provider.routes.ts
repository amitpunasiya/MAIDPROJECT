import { Router } from 'express';
import { providerController } from '../controllers/provider.controller.js';
import { authenticate, requireRoles } from '../../auth/middlewares/auth.middleware.js';
import { validate } from '../../../middleware/validation/validate.js';
import { UserRole } from '../../../types/auth.types.js';
import {
  createProviderSchema,
  updateProviderSchema,
  providerQuerySchema,
  providerNearbyQuerySchema,
  toggleAvailabilitySchema,
  addGalleryItemSchema,
} from '../validators/provider.validator.js';

const router = Router();
const requireAdmin = requireRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN);

// Public & Discovery Endpoints
router.get('/match', providerController.matchProviders);
router.get('/available', validate(providerQuerySchema, 'query'), providerController.getAvailable);
router.get('/top-rated', providerController.getTopRated);
router.get('/statistics', authenticate, requireAdmin, providerController.getStatistics);
router.get('/search', validate(providerQuerySchema, 'query'), providerController.getProviders);
router.get('/nearby', validate(providerNearbyQuerySchema, 'query'), providerController.searchNearby);
router.get('/', validate(providerQuerySchema, 'query'), providerController.getProviders);
router.get('/:id', providerController.getProviderById);

// Admin Status Management & Healthcare KYC Endpoints
router.patch('/:id/verify', authenticate, requireAdmin, providerController.verifyProvider);
router.patch('/:id/suspend', authenticate, requireAdmin, providerController.suspendProvider);
router.patch('/:id/activate', authenticate, requireAdmin, providerController.activateProvider);
router.patch('/:id/reject', authenticate, requireAdmin, providerController.rejectProvider);
router.patch('/:id/block', authenticate, requireAdmin, providerController.permanentlyBlockProvider);
router.get('/admin/kyc/:providerId', authenticate, requireAdmin, providerController.getKycDetailsForAdmin);
router.patch('/admin/kyc/:providerId/verify', authenticate, requireAdmin, providerController.verifyHealthcareKyc);

// Authenticated Provider Endpoints (Self or Admin)
router.post('/', authenticate, validate(createProviderSchema), providerController.createProvider);
router.post('/kyc', authenticate, providerController.submitKycDocument);
router.post('/kyc/submit', authenticate, providerController.submitKycDocument);

// Availability & Skills Endpoints
router.patch('/skills', authenticate, providerController.updateSkills);
router.patch('/:id/skills', authenticate, providerController.updateSkills);
router.patch('/availability', authenticate, validate(toggleAvailabilitySchema), providerController.toggleAvailability);
router.patch('/:id/availability', authenticate, validate(toggleAvailabilitySchema), providerController.toggleAvailability);

// Gallery Endpoints
router.post('/gallery', authenticate, validate(addGalleryItemSchema), providerController.addGalleryItem);
router.post('/:id/gallery', authenticate, validate(addGalleryItemSchema), providerController.addGalleryItem);
router.delete('/gallery/:id', authenticate, providerController.removeGalleryItem);
router.delete('/:providerId/gallery/:galleryItemId', authenticate, providerController.removeGalleryItem);

// Update / Delete Endpoints
router.patch('/:id', authenticate, validate(updateProviderSchema), providerController.updateProvider);
router.delete('/:id', authenticate, providerController.deleteProvider);

export default router;
