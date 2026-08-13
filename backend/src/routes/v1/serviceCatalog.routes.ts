import { Router } from 'express';
import { serviceCatalogController } from '../../controllers/serviceCatalog.controller.js';
import { authenticate } from '../../modules/auth/middlewares/auth.middleware.js';

const router = Router();

// Public & Customer Catalog APIs
router.get('/categories', serviceCatalogController.getCategories);
router.get('/categories/:categoryId/services', serviceCatalogController.getServicesByCategory);
router.get('/services/:serviceId', serviceCatalogController.getServiceDetails);
router.get('/search', serviceCatalogController.searchServices);
router.post('/calculate-price', serviceCatalogController.calculatePrice);

// Admin & Provider Management APIs
router.use(authenticate);
router.post('/categories', serviceCatalogController.createCategory);
router.post('/services', serviceCatalogController.createService);
router.post('/sub-services', serviceCatalogController.createSubService);
router.get('/analytics', serviceCatalogController.getAnalytics);
router.post('/seed', serviceCatalogController.seedCatalog);

export default router;
