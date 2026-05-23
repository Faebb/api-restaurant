import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';

/**
 * Resolves the tenant from the :slug route param and attaches req.tenantId.
 * Mounted on public/:slug routers so customer ordering flows know which
 * restaurant they belong to.
 */
export const resolveTenant = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const slug = req.params.slug as string | undefined;
    if (!slug) {
      res.status(400).json({ success: false, error: 'Slug del restaurante requerido' });
      return;
    }

    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) {
      res.status(404).json({ success: false, error: 'Restaurante no encontrado' });
      return;
    }

    req.tenantId = tenant.id;
    next();
  } catch (err) {
    next(err);
  }
};
