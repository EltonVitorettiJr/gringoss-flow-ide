import * as z from 'zod';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const createAppointmentSchema = z.object({
  customerName: z.string().trim().min(2, 'O nome deve ter no mínimo 2 caracteres.'),
  customerPhone: z.string().trim().optional(),

  startTime: z.iso.datetime({
    message: 'Data e hora inválidas. O formato deve ser ISO-8601 absoluto (ex: 2026-11-03T15:00:00.000Z).'
  }).transform(str => new Date(str)),

  serviceId: z.string().regex(uuidRegex, 'ID do serviço inválido.'),
});

export const editAppointmentBodySchema = createAppointmentSchema.partial();

export const editAppointmentParamsSchema = z.object({
  id: z.string().regex(uuidRegex, 'ID do agendamento inválido.'),
});

export const deleteAppointmentSchema = z.object({
  id: z.string().regex(uuidRegex, 'ID do agendamento inválido.'),
});

export const listAppointmentsSchema = z.object({
  // Regex simples para garantir que a consulta por data só receba YYYY-MM-DD
  date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido. Use YYYY-MM-DD.').optional(),
});