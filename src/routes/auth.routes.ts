import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { requireAuth } from '../middleware/auth.middleware';
import { registerSchema, loginSchema } from '../schemas/auth.schema';

const router = Router();

// POST /api/auth/register  — creates a tenant + OWNER user
router.post('/register', validate(registerSchema), authController.register);

// POST /api/auth/login
router.post('/login', validate(loginSchema), authController.login);

// GET /api/auth/me  — current authenticated user + tenant
router.get('/me', requireAuth, authController.me);

export default router;
