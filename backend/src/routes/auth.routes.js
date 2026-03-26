import { Router } from 'express';
import { validate } from '../middleware/validate.middleware.js';
import { authLimiter } from '../middleware/rateLimit.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import {
  register, login, refresh, logout, forgotPassword, resetPassword,
  registerSchema, loginSchema, refreshSchema, forgotPasswordSchema, resetPasswordSchema,
} from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', validate(refreshSchema), refresh);
router.post('/logout', authMiddleware, logout);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), resetPassword);

export default router;
