import { z } from 'zod';

// ─── Menu Categories ─────────────────────────────────────────────────────
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  type: z.string().min(1, 'Tipo requerido'),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  type: z.string().min(1).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

// ─── Menu Items ──────────────────────────────────────────────────────────
export const createMenuItemSchema = z.object({
  categoryId: z.string().min(1, 'categoryId requerido'),
  name: z.string().min(1, 'Nombre requerido'),
  description: z.string().min(1, 'Descripción requerida'),
  price: z.number().positive('Precio debe ser positivo'),
  image: z.string().url('Imagen debe ser una URL válida'),
  category: z.string().min(1, 'category requerida'),
});

export const updateMenuItemSchema = z.object({
  categoryId: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  image: z.string().url().optional(),
  category: z.string().min(1).optional(),
});

// ─── Restaurant Tables ───────────────────────────────────────────────────
export const createTableSchema = z.object({
  tableNumber: z.number().int().positive(),
  tableType: z.enum(['LOW', 'HIGH', 'VIP']),
  capacity: z.number().int().positive(),
});

export const updateTableSchema = z.object({
  tableNumber: z.number().int().positive().optional(),
  tableType: z.enum(['LOW', 'HIGH', 'VIP']).optional(),
  capacity: z.number().int().positive().optional(),
  isOccupied: z.boolean().optional(),
});

// ─── Orders ──────────────────────────────────────────────────────────────
export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERED', 'CANCELLED']),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;
export type CreateTableInput = z.infer<typeof createTableSchema>;
export type UpdateTableInput = z.infer<typeof updateTableSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
