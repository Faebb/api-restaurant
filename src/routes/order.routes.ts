import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { validate } from '../middleware/validate.middleware';
import { createOrderSchema } from '../schemas/order.schema';

const router = Router();

// POST /api/orders
router.post('/', validate(createOrderSchema), orderController.create);

// GET /api/orders/:id
router.get('/:id', orderController.getById);

export default router;
