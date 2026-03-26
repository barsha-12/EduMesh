import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import {
  getOverview, getRegionAnalytics, getSubjectAnalytics,
  getCohortAnalytics, exportAnalytics,
} from '../controllers/analytics.controller.js';

const router = Router();

router.use(authMiddleware);
router.use(requireRole('ADMIN', 'NGO'));

router.get('/overview', getOverview);
router.get('/region', getRegionAnalytics);
router.get('/subject', getSubjectAnalytics);
router.get('/cohort', getCohortAnalytics);
router.get('/export', exportAnalytics);

export default router;
