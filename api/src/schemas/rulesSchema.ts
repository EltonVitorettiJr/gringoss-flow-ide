import { z } from 'zod';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
const timeMessage = 'O formato deve ser HH:MM (ex: 07:00, 14:30).';

const parseTime = (val: string) => new Date(`1970-01-01T${val}:00.000Z`);

export const createRuleSchema = z.object({
  dayOfWeek: z.number().min(0).max(6, 'O dia da semana deve ser entre 0 (Domingo) e 6 (Sábado).'),
  openTime: z.string().regex(timeRegex, timeMessage).transform(parseTime),
  closeTime: z.string().regex(timeRegex, timeMessage).transform(parseTime),
  breakStart: z.string().regex(timeRegex, timeMessage).optional().transform((val) => val ? parseTime(val) : undefined),
  breakEnd: z.string().regex(timeRegex, timeMessage).optional().transform((val) => val ? parseTime(val) : undefined),
});

export const deleteRuleSchema = z.object({
  id: z.string().regex(uuidRegex, 'ID da regra inválido.'),
});

export const editRuleParamsSchema = z.object({
  id: z.string().regex(uuidRegex, 'ID da regra inválido.'),
});

export const editRuleBodySchema = z.object({
  dayOfWeek: z.number().min(0).max(6).optional(),
  openTime: z.string().regex(timeRegex, timeMessage).optional().transform((val) => val ? parseTime(val) : undefined),
  closeTime: z.string().regex(timeRegex, timeMessage).optional().transform((val) => val ? parseTime(val) : undefined),
  breakStart: z.string().regex(timeRegex, timeMessage).optional().transform((val) => val ? parseTime(val) : undefined),
  breakEnd: z.string().regex(timeRegex, timeMessage).optional().transform((val) => val ? parseTime(val) : undefined),
});