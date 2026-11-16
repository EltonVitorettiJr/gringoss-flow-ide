import type { DayRule, Service } from "../types";
import { toMin } from "./schedule";

export type ApiRule = {
  id: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  breakStart?: string | null;
  breakEnd?: string | null;
};

export type ApiService = {
  id: string;
  name: string;
  durationMinutes: number;
  price?: string | number | null; // Decimal do Prisma costuma vir como string
};

export const dayNames: { day: number; label: string; short: string }[] = [
  { day: 1, label: "Segunda", short: "Seg" },
  { day: 2, label: "Terça", short: "Ter" },
  { day: 3, label: "Quarta", short: "Qua" },
  { day: 4, label: "Quinta", short: "Qui" },
  { day: 5, label: "Sexta", short: "Sex" },
  { day: 6, label: "Sábado", short: "Sáb" },
  { day: 0, label: "Domingo", short: "Dom" },
];

/** "07:00" ou ISO ("1970-01-01T07:00:00.000Z") -> "07:00" */
export function parseTime(v: string): string {
  if (/^\d{2}:\d{2}/.test(v)) return v.slice(0, 5);
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "00:00" : d.toISOString().slice(11, 16);
}

/** Uma linha por dia na API -> janelas no front (a pausa vira o intervalo entre duas janelas). */
export function rulesFromApi(rows: ApiRule[]): DayRule[] {
  return dayNames.map(({ day, label, short }) => {
    const row = rows.find((r) => r.dayOfWeek === day);
    if (!row) return { day, label, short, open: false, windows: [] };
    const open = parseTime(row.openTime);
    const close = parseTime(row.closeTime);
    const bs = row.breakStart ? parseTime(row.breakStart) : null;
    const be = row.breakEnd ? parseTime(row.breakEnd) : null;
    const windows =
      bs && be
        ? [
            { id: `${row.id}-a`, start: open, end: bs },
            { id: `${row.id}-b`, start: be, end: close },
          ]
        : [{ id: `${row.id}-a`, start: open, end: close }];
    return { day, label, short, open: true, ruleId: row.id, windows };
  });
}

/** Janelas do front -> corpo do POST/PUT /rules. Máx. 2 janelas (validado antes). */
export function ruleToPayload(r: DayRule) {
  const w = [...r.windows].sort((a, b) => toMin(a.start) - toMin(b.start));
  const base = { dayOfWeek: r.day, openTime: w[0].start, closeTime: w[w.length - 1].end };
  return w.length > 1 ? { ...base, breakStart: w[0].end, breakEnd: w[1].start } : base;
}

export function servicesFromApi(rows: ApiService[]): Service[] {
  return rows.map((s) => ({
    id: s.id,
    name: s.name,
    durationMin: s.durationMinutes,
    price: Number(s.price ?? 0),
    active: true, // a API ainda não tem campo "ativo"; o front guarda isso localmente
  }));
}
