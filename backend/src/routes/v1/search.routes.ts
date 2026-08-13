import { Router } from 'express';
import { searchController } from '../../controllers/search.controller.js';

const router = Router();

// GET /api/v1/search?q=cook
router.get('/', searchController.search);

export default router;
