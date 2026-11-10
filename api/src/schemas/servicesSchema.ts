import z from "zod";

export const createServiceSchema = z.object({
  name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres.'),
  durationMinutes: z.number().min(1, 'A duração deve ser no mínimo 1 minuto.'),
  price: z.number().min(0, 'O valor deve ser no mínimo 0.')
});

export const deleteServiceSchema = z.object({
  id: z.uuid(),
});

export const editServiceParamsSchema = z.object({
  id: z.uuid(),
});

export const editServiceBodySchema = z.object({
  name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres.').optional(),
  durationMinutes: z.number().min(1, 'A duração deve ser no mínimo 1 minuto.').optional(),
  price: z.number().min(0, 'O valor deve ser no mínimo 0.').optional(),
});