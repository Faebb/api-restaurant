import { Request, Response, NextFunction } from 'express';

/**
 * Global error handler — must have 4 params so Express treats it as error middleware.
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  console.error('[ERROR]', err.message, err.stack);

  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { details: err.message }),
  });
};

/**
 * 404 handler — catches any unmatched routes.
 */
export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
  });
};
