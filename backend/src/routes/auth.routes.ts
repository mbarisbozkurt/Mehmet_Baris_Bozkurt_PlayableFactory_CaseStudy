import { Router } from 'express';
import { register, login, forgotPassword, resetPassword } from '../controllers/auth.controller';
import { authRateLimiter } from '../middleware/security.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { registerSchema, loginSchema } from '../utils/validation.schemas';

const router = Router();

// Apply rate limiter to all auth routes
router.use(authRateLimiter);

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;