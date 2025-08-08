import { Router } from 'express';
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getRelatedProducts
} from '../controllers/product.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { productSchema } from '../utils/validation.schemas';

const router = Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);
router.get('/:id/related', getRelatedProducts);

// Protected routes (admin only)
router.use(authenticate, authorizeAdmin);
router.post('/', validateRequest(productSchema), createProduct);
router.patch('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;