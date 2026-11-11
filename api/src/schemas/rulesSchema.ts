import { z } from 'zod';

// Regex que aceita estritamente o formato HH:MM (00:00 a 23:59)
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

// Validador customizado: testa a string e depois converte seguro
const timeStringSchema = z.string().trim().regex(timeRegex, 'Formato de hora inválido. Use HH:MM.')
  .transform(val => new Date(`1970-01-01T${val}:00.000Z`));

export const createRuleSchema = z.object({
  dayOfWeek: z.number().int('O dia deve ser inteiro.').min(0).max(6, 'O dia da semana deve ser entre 0 (Domingo) e 6 (Sábado).'),
  openTime: timeStringSchema,
  closeTime: timeStringSchema,
  breakStart: timeStringSchema.optional(),
  breakEnd: timeStringSchema.optional(),
});

export const editRuleBodySchema = createRuleSchema.partial();

export const editRuleParamsSchema = z.object({
  id: z.uuid('ID da regra inválido.'),
});

export const deleteRuleSchema = z.object({
  id: z.uuid('ID da regra inválido.'),
});