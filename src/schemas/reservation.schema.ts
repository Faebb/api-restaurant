import { z } from 'zod';

export const reservationSchema = z.object({
  guests: z
    .number({ required_error: 'El número de comensales es requerido' })
    .int('Debe ser un número entero')
    .min(1, 'Mínimo 1 comensal')
    .max(10, 'Máximo 10 comensales'),
});

export type ReservationInput = z.infer<typeof reservationSchema>;
