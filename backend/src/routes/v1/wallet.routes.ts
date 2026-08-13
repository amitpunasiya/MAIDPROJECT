import { Router } from 'express';
import { walletController } from '../../controllers/wallet.controller.js';
import { authenticate } from '../../modules/auth/middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);
router.get('/balance', walletController.getBalance);
router.get('/transactions', walletController.getTransactions);
router.post('/withdraw', walletController.requestWithdrawal);

export default router;
