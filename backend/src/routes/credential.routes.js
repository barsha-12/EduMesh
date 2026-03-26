import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  issueCredential, getStudentCredentials, verifyCredential,
  issueCredentialSchema,
} from '../controllers/credential.controller.js';

const router = Router();

router.post('/issue', authMiddleware, requireRole('ADMIN'), validate(issueCredentialSchema), issueCredential);
router.get('/student/:id', authMiddleware, getStudentCredentials);
router.get('/verify/:id', verifyCredential); // Public endpoint — no auth

export default router;
