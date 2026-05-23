import { Request, Response, NextFunction } from 'express';
import { menuService } from '../services/menu.service';

export const menuController = {
  /**
   * GET /api/public/:slug/menu — tenant from resolveTenant middleware.
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await menuService.getAll(req.tenantId!);
      res.json({ success: true, data: categories });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/public/:slug/menu/items/:id
   */
  async getItemById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await menuService.getItemById(req.tenantId!, req.params.id as string);
      if (!item) {
        res.status(404).json({ success: false, error: 'Ítem no encontrado' });
        return;
      }
      res.json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  },
};
