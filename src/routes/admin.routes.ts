import { Router } from 'express';
import {
  adminCategoryController,
  adminMenuItemController,
  adminTableController,
  adminOrderController,
  adminReservationController,
} from '../controllers/admin.controller';
import { validate } from '../middleware/validate.middleware';
import {
  createCategorySchema,
  updateCategorySchema,
  createMenuItemSchema,
  updateMenuItemSchema,
  createTableSchema,
  updateTableSchema,
  updateOrderStatusSchema,
} from '../schemas/admin.schema';

const router = Router();

// NOTE: requireAuth is mounted on this router by app.ts. All routes here
// require a valid JWT and are scoped to req.user.tenantId.

// ─── Menu Categories ─────────────────────────────────────────────────────
router.get('/menu/categories', adminCategoryController.list);
router.post('/menu/categories', validate(createCategorySchema), adminCategoryController.create);
router.put('/menu/categories/:id', validate(updateCategorySchema), adminCategoryController.update);
router.delete('/menu/categories/:id', adminCategoryController.remove);

// ─── Menu Items ──────────────────────────────────────────────────────────
router.get('/menu/items', adminMenuItemController.list);
router.post('/menu/items', validate(createMenuItemSchema), adminMenuItemController.create);
router.put('/menu/items/:id', validate(updateMenuItemSchema), adminMenuItemController.update);
router.delete('/menu/items/:id', adminMenuItemController.remove);

// ─── Tables ──────────────────────────────────────────────────────────────
router.get('/tables', adminTableController.list);
router.post('/tables', validate(createTableSchema), adminTableController.create);
router.put('/tables/:id', validate(updateTableSchema), adminTableController.update);
router.delete('/tables/:id', adminTableController.remove);

// ─── Orders ──────────────────────────────────────────────────────────────
router.get('/orders', adminOrderController.list);
router.get('/orders/:id', adminOrderController.getById);
router.patch('/orders/:id/status', validate(updateOrderStatusSchema), adminOrderController.updateStatus);

// ─── Reservations ────────────────────────────────────────────────────────
router.get('/reservations', adminReservationController.list);

export default router;
