import { Request, Response, NextFunction } from 'express';
import { menuService } from '../services/menu.service';

export const menuController = {
  /**
   * GET /api/menu
   * Returns all categories with their items.
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await menuService.getAll();
      res.json({ success: true, data: categories });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/menu/items/:id
   * Returns a single menu item.
   */
  async getItemById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await menuService.getItemById(req.params.id);

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
