import z from "zod";

export const createAppointmentSchema = z.object({
  customerName: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres.'),
  customerPhone: z.string().optional(),
  startTime: z.coerce.date({
    error: () => ({ message: 'Data e hora inválidas. O formato deve ser ISO-8601.' }),
  }),
  serviceId: z.uuid(),
});

export const listAppointmentsSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'O formato da data deve ser YYYY-MM-DD.').optional(),
});

export const deleteAppointmentSchema = z.object({
  id: z.uuid(),
});

export const editAppointmentParamsSchema = z.object({
  id: z.uuid(),
});

export const editAppointmentBodySchema = z.object({
  customerName: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres.').optional(),
  customerPhone: z.string().optional(),
  startTime: z.coerce.date({
    error: () => ({ message: 'Data e hora inválidas. O formato deve ser ISO-8601.' }),
  }).optional(),
  serviceId: z.uuid().optional(),
});