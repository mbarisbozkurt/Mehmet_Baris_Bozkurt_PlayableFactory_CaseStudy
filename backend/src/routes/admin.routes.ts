import { Router } from 'express';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';
import { getAdminStats, getUsersWithOrderCounts, getUserDetailWithOrders } from '../controllers/admin.controller';

const router = Router();

router.use(authenticate, authorizeAdmin);

router.get('/stats', getAdminStats);
router.get('/users', getUsersWithOrderCounts);
router.get('/users/:id', getUserDetailWithOrders);

export default router;


