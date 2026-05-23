import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/order.service';
import type { CreateOrderInput } from '../schemas/order.schema';

export const orderController = {
  /**
   * POST /api/public/:slug/orders
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = req.body as CreateOrderInput;
      const order = await orderService.create(req.tenantId!, input);
      res.status(201).json({ success: true, data: order });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear la orden';
      if (message.includes('no encontrado')) {
        res.status(422).json({ success: false, error: message });
        return;
      }
      next(err);
    }
  },

  /**
   * GET /api/public/:slug/orders/:id
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await orderService.getById(req.tenantId!, req.params.id as string);
      if (!order) {
        res.status(404).json({ success: false, error: 'Orden no encontrada' });
        return;
      }
      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  },
};
