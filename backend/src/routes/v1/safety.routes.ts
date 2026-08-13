import { Router } from 'express';
import { safetyController } from '../../controllers/safety.controller.js';
import { authenticate, requireRoles } from '../../modules/auth/middlewares/auth.middleware.js';
import { UserRole } from '../../types/auth.types.js';

const router = Router();
const requireAdmin = requireRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN);

router.use(authenticate);

// Customer & Worker Safety Endpoints
router.post('/reports', safetyController.createReport);
router.get('/reports/my', safetyController.getMyReports);
router.post('/disputes', safetyController.createDispute);
router.get('/disputes/my', safetyController.getMyDisputes);

// Admin Operations
router.get('/admin/reports', requireAdmin, safetyController.getAllReports);
router.patch('/admin/reports/:id', requireAdmin, safetyController.updateReportStatus);
router.get('/admin/disputes', requireAdmin, safetyController.getAllDisputes);
router.patch('/admin/disputes/:id', requireAdmin, safetyController.updateDisputeStatus);

export default router;
