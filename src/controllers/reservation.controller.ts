import { Request, Response, NextFunction } from 'express';
import { reservationService } from '../services/reservation.service';
import type { ReservationInput } from '../schemas/reservation.schema';

export const reservationController = {
  /**
   * POST /api/public/:slug/reservations
   * Body: { guests: number }. Tenant from resolveTenant middleware.
   */
  async assign(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { guests } = req.body as ReservationInput;
      const result = await reservationService.assignTable(req.tenantId!, guests);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al asignar mesa';
      if (message.includes('No hay mesas disponibles')) {
        res.status(409).json({ success: false, error: message });
        return;
      }
      next(err);
    }
  },
};
