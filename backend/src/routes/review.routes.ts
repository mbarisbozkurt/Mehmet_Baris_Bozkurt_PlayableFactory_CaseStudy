import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { z } from 'zod';
import { createReview, getProductReviews } from '../controllers/review.controller';

const router = Router();

// Public: list approved reviews of a product
router.get('/:productId', getProductReviews);

// Authenticated: create review (basic body validation)
const createReviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10).max(1000),
});

router.post('/', authenticate, validateRequest(createReviewSchema), createReview);

export default router;


