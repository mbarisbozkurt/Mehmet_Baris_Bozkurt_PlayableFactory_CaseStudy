import { Router } from 'express';
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  bulkUpdateProductStatus,
  getRelatedProducts
} from '../controllers/product.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { productSchema } from '../utils/validation.schemas';
import { adminCreateProductSchema, adminUpdateProductSchema } from '../utils/validation.schemas';

const router = Router();

// Public routes
router.get('/', getProducts);
// Admin bulk activate/deactivate (must be before param route)
router.patch('/bulk/status', authenticate, authorizeAdmin, bulkUpdateProductStatus);
router.get('/:id', getProduct);
// Admin CRUD
router.post('/', authenticate, authorizeAdmin, validateRequest(adminCreateProductSchema), createProduct);
router.patch('/:id', authenticate, authorizeAdmin, validateRequest(adminUpdateProductSchema), updateProduct);
router.delete('/:id', authenticate, authorizeAdmin, deleteProduct);
router.get('/:id/related', getRelatedProducts);

// Protected routes (admin only)
router.use(authenticate, authorizeAdmin);
router.post('/', validateRequest(productSchema), createProduct);
router.patch('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;