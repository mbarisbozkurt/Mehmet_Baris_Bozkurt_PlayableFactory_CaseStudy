import express from 'express';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  payOrder
} from '../controllers/order.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { orderSchema } from '../utils/validation.schemas';

const router = express.Router();

// All order routes require authentication
router.use(authenticate);

// Customer & Admin routes
router.post('/', validateRequest(orderSchema), createOrder);

router.get('/', getOrders);
router.get('/:id', getOrder);
router.post('/:id/cancel', cancelOrder);
router.post('/:id/pay', payOrder);

// Admin only routes
router.patch('/:id/status', authorizeAdmin, updateOrderStatus);

export default router;