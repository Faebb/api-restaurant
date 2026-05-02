import { Request, Response, NextFunction } from 'express';
import { reservationService } from '../services/reservation.service';
import type { ReservationInput } from '../schemas/reservation.schema';

export const reservationController = {
  /**
   * POST /api/reservations
   * Body: { guests: number }
   * Assigns a table and returns reservation details.
   */
  async assign(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { guests } = req.body as ReservationInput;
      const result = await reservationService.assignTable(guests);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al asignar mesa';

      // Business-rule errors (no tables available) → 409 Conflict
      if (message.includes('No hay mesas disponibles')) {
        res.status(409).json({ success: false, error: message });
        return;
      }

      next(err);
    }
  },
};
