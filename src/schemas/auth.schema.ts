import { z } from 'zod';

export const registerSchema = z.object({
  restaurantName: z.string().min(2, 'Nombre del restaurante requerido (mín. 2 caracteres)'),
  name: z.string().min(2, 'Nombre requerido (mín. 2 caracteres)'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
