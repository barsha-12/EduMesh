import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  getAvailableMentors, requestMentor, getMatches,
  acceptMatch, completeMatch, getLeaderboard,
  requestMentorSchema, completeMentorSchema,
} from '../controllers/mentor.controller.js';

const router = Router();

router.use(authMiddleware);

router.get('/available', getAvailableMentors);
router.post('/request', requireRole('STUDENT'), validate(requestMentorSchema), requestMentor);
router.get('/matches', requireRole('MENTOR'), getMatches);
router.post('/matches/:id/accept', requireRole('MENTOR'), acceptMatch);
router.post('/matches/:id/complete', requireRole('MENTOR'), validate(completeMentorSchema), completeMatch);
router.get('/leaderboard', getLeaderboard);

export default router;
