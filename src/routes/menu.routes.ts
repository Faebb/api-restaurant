import { Router } from 'express';
import { menuController } from '../controllers/menu.controller';

const router = Router();

// GET /api/menu
router.get('/', menuController.getAll);

// GET /api/menu/items/:id
router.get('/items/:id', menuController.getItemById);

export default router;
