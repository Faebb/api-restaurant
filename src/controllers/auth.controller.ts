import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import type { RegisterInput, LoginInput } from '../schemas/auth.schema';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body as RegisterInput);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al registrar';
      if (message.includes('ya está registrado')) {
        res.status(409).json({ success: false, error: message });
        return;
      }
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body as LoginInput);
      res.json({ success: true, data: result });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
      if (message.includes('Credenciales')) {
        res.status(401).json({ success: false, error: message });
        return;
      }
      next(err);
    }
  },

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'No autenticado' });
        return;
      }
      const result = await authService.me(req.user.userId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },
};
