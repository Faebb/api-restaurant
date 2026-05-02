import { z } from 'zod';

const orderItemSchema = z.object({
  menuItemId: z.string().min(1, 'menuItemId es requerido'),
  quantity: z.number().int().min(1, 'La cantidad mínima es 1'),
});

export const createOrderSchema = z.object({
  reservationId: z.string().optional(),

  customerName: z.string().min(3, 'Nombre requerido (mín. 3 caracteres)'),
  documentType: z.string().min(1, 'Tipo de documento requerido'),
  documentNumber: z.string().min(5, 'Número de documento inválido'),
  email: z.string().email('Email inválido'),

  paymentMethod: z.enum(['card', 'cash']),
  tipType: z.enum(['fixed', 'custom']),
  tipValue: z.number().min(0, 'La propina no puede ser negativa'),

  items: z
    .array(orderItemSchema)
    .min(1, 'El pedido debe incluir al menos un ítem'),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
