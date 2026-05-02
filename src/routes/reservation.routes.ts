import { Router } from 'express';
import { reservationController } from '../controllers/reservation.controller';
import { validate } from '../middleware/validate.middleware';
import { reservationSchema } from '../schemas/reservation.schema';

const router = Router();

// POST /api/reservations
router.post('/', validate(reservationSchema), reservationController.assign);

export default router;
