import { Request, Response, NextFunction } from 'express';
import {
  adminCategoryService,
  adminMenuItemService,
  adminTableService,
  adminOrderService,
  adminReservationService,
} from '../services/admin.service';

const tenantOf = (req: Request): string => req.user!.tenantId;

// ─── Menu Categories ─────────────────────────────────────────────────────

export const adminCategoryController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminCategoryService.list(tenantOf(req));
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminCategoryService.create(tenantOf(req), req.body);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminCategoryService.update(tenantOf(req), req.params.id as string, req.body);
      res.json({ success: true, data });
    } catch (err) {
      const m = err instanceof Error ? err.message : 'Error';
      if (m.includes('no encontrada')) {
        res.status(404).json({ success: false, error: m });
        return;
      }
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await adminCategoryService.remove(tenantOf(req), req.params.id as string);
      res.status(204).send();
    } catch (err) {
      const m = err instanceof Error ? err.message : 'Error';
      if (m.includes('no encontrada')) {
        res.status(404).json({ success: false, error: m });
        return;
      }
      next(err);
    }
  },
};

// ─── Menu Items ──────────────────────────────────────────────────────────

export const adminMenuItemController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminMenuItemService.list(tenantOf(req));
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminMenuItemService.create(tenantOf(req), req.body);
      res.status(201).json({ success: true, data });
    } catch (err) {
      const m = err instanceof Error ? err.message : 'Error';
      if (m.includes('Categoría no encontrada')) {
        res.status(404).json({ success: false, error: m });
        return;
      }
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminMenuItemService.update(tenantOf(req), req.params.id as string, req.body);
      res.json({ success: true, data });
    } catch (err) {
      const m = err instanceof Error ? err.message : 'Error';
      if (m.includes('no encontrad')) {
        res.status(404).json({ success: false, error: m });
        return;
      }
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await adminMenuItemService.remove(tenantOf(req), req.params.id as string);
      res.status(204).send();
    } catch (err) {
      const m = err instanceof Error ? err.message : 'Error';
      if (m.includes('no encontrado')) {
        res.status(404).json({ success: false, error: m });
        return;
      }
      next(err);
    }
  },
};

// ─── Tables ──────────────────────────────────────────────────────────────

export const adminTableController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminTableService.list(tenantOf(req));
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminTableService.create(tenantOf(req), req.body);
      res.status(201).json({ success: true, data });
    } catch (err) {
      const m = err instanceof Error ? err.message : 'Error';
      if (m.includes('ya existe')) {
        res.status(409).json({ success: false, error: m });
        return;
      }
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminTableService.update(tenantOf(req), req.params.id as string, req.body);
      res.json({ success: true, data });
    } catch (err) {
      const m = err instanceof Error ? err.message : 'Error';
      if (m.includes('no encontrada')) {
        res.status(404).json({ success: false, error: m });
        return;
      }
      if (m.includes('ya existe')) {
        res.status(409).json({ success: false, error: m });
        return;
      }
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await adminTableService.remove(tenantOf(req), req.params.id as string);
      res.status(204).send();
    } catch (err) {
      const m = err instanceof Error ? err.message : 'Error';
      if (m.includes('no encontrada')) {
        res.status(404).json({ success: false, error: m });
        return;
      }
      next(err);
    }
  },
};

// ─── Orders ──────────────────────────────────────────────────────────────

export const adminOrderController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminOrderService.list(tenantOf(req));
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminOrderService.getById(tenantOf(req), req.params.id as string);
      if (!data) {
        res.status(404).json({ success: false, error: 'Orden no encontrada' });
        return;
      }
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminOrderService.updateStatus(
        tenantOf(req),
        req.params.id as string,
        req.body.status,
      );
      res.json({ success: true, data });
    } catch (err) {
      const m = err instanceof Error ? err.message : 'Error';
      if (m.includes('no encontrada')) {
        res.status(404).json({ success: false, error: m });
        return;
      }
      next(err);
    }
  },
};

// ─── Reservations ────────────────────────────────────────────────────────

export const adminReservationController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminReservationService.list(tenantOf(req));
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },
};
