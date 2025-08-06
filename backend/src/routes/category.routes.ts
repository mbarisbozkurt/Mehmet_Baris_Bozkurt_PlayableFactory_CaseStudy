import express from 'express';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';
import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory
} from '../controllers/category.controller';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategory);

// Protected routes (Admin only)
router.post(
  '/',
  authenticate,
  authorizeAdmin,
  createCategory
);

router.patch(
  '/:id',
  authenticate,
  authorizeAdmin,
  updateCategory
);

router.delete(
  '/:id',
  authenticate,
  authorizeAdmin,
  deleteCategory
);

export default router;