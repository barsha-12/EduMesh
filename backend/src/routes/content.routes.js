import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  getContent, getContentById, getOfflineContent,
  createContent, updateContent, deleteContent,
  contentQuerySchema, createContentSchema, updateContentSchema,
} from '../controllers/content.controller.js';

const router = Router();

// Public read routes (auth still required for tracking)
router.get('/', authMiddleware, validate(contentQuerySchema, 'query'), getContent);
router.get('/:id', authMiddleware, getContentById);
router.get('/:id/offline', authMiddleware, getOfflineContent);

// Admin-only write routes
router.post('/', authMiddleware, requireRole('ADMIN'), validate(createContentSchema), createContent);
router.put('/:id', authMiddleware, requireRole('ADMIN'), validate(updateContentSchema), updateContent);
router.delete('/:id', authMiddleware, requireRole('ADMIN'), deleteContent);

export default router;
