import { Router } from 'express';
import { favoriteController } from '../../controllers/favorite.controller.js';
import { authenticate } from '../../middleware/auth/authenticate.js';

const router = Router();

router.use(authenticate);

router.post('/', favoriteController.add);
router.delete('/', favoriteController.remove);
router.get('/', favoriteController.list);

export default router;
