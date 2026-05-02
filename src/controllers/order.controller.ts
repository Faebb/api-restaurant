import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/order.service';
import type { CreateOrderInput } from '../schemas/order.schema';

export const orderController = {
  /**
   * POST /api/orders
   * Creates a new order from cart + customer data.
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = req.body as CreateOrderInput;
      const order = await orderService.create(input);
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
   * GET /api/orders/:id
   * Returns an order by ID.
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await orderService.getById(req.params.id);

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
