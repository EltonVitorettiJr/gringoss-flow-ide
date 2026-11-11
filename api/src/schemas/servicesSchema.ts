import * as z from 'zod';

export const createServiceSchema = z.object({
  name: z.string().trim().min(2, 'O nome deve ter no mínimo 2 caracteres.'),
  durationMinutes: z.number().int('A duração deve ser um número inteiro.').positive('A duração deve ser maior que zero.'),
  price: z.number().positive('O preço deve ser maior que zero.'),
});

export const editServiceBodySchema = createServiceSchema.partial();

export const editServiceParamsSchema = z.object({
  id: z.uuid('ID do serviço inválido.'),
});

export const deleteServiceSchema = z.object({
  id: z.uuid('ID do serviço inválido.'),
});