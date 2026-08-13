import { Router } from 'express';
import { reportsController } from '../controllers/reports.controller.js';
import { authenticate, requireRoles } from '../../auth/middlewares/auth.middleware.js';
import { UserRole } from '../../../types/auth.types.js';

const router = Router();

// Public / Invoice Endpoint
router.get('/invoice/:bookingId', reportsController.getInvoiceHtml);

// All Analytics & Report Endpoints require Admin / Super Admin Authorization
router.use(authenticate);
router.use(requireRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN));

router.get('/dashboard', reportsController.getDashboard);
router.get('/summary', reportsController.getSummary);
router.get('/export/revenue', reportsController.exportRevenueReportCsv);
router.get('/export/csv', reportsController.exportRevenueReportCsv);

export default router;
