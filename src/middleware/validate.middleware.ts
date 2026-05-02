import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Express middleware factory that validates req.body against a Zod schema.
 * Returns 400 with field-level errors when validation fails.
 */
export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = (result.error as ZodError).errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));

      res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        details: errors,
      });
      return;
    }

    // Replace body with the parsed + coerced data
    req.body = result.data;
    next();
  };
