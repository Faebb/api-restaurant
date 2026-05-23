import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../config/jwt';

/**
 * Verifies the Authorization: Bearer <token> header and attaches
 * req.user = { userId, tenantId, role } for downstream handlers.
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Token requerido' });
    return;
  }

  const token = header.slice(7).trim();
  try {
    const payload = verifyToken(token);
    req.user = {
      userId: payload.userId,
      tenantId: payload.tenantId,
      role: payload.role,
    };
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Token inválido o expirado' });
  }
};
