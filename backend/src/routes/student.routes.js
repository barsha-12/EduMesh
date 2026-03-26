import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  getProfile, updateProfile, getFeed, startSession, endSession,
  getSessions, getStreak, syncOfflineData,
  updateProfileSchema, startSessionSchema, endSessionSchema, syncSchema,
} from '../controllers/student.controller.js';

const router = Router();

router.use(authMiddleware);
router.use(requireRole('STUDENT'));

router.get('/profile', getProfile);
router.put('/profile', validate(updateProfileSchema), updateProfile);
router.get('/feed', getFeed);
router.post('/session/start', validate(startSessionSchema), startSession);
router.post('/session/end', validate(endSessionSchema), endSession);
router.get('/sessions', getSessions);
router.get('/streak', getStreak);
router.post('/sync', validate(syncSchema), syncOfflineData);

export default router;
