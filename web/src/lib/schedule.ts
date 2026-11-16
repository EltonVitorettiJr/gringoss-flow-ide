import type { Appointment, Conflict, DayRule, GeneralRules, Service, TimeWindow } from "../types";

export const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

export const toHHMM = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

export const fmtDuration = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
};

export const fmtPrice = (v: number) =>
  `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: Number.isInteger(v) ? 0 : 2 })}`;

export const uid = () => Math.random().toString(36).slice(2, 10);

/** Valida as janelas de um dia. Retorna mensagem de erro ou null. */
export function validateWindows(windows: TimeWindow[]): string | null {
  for (const w of windows) {
    if (!w.start || !w.end) return "Preencha o início e o fim de todas as janelas.";
    if (toMin(w.start) >= toMin(w.end)) return "O início da janela precisa ser antes do fim.";
  }
  const sorted = [...windows].sort((a, b) => toMin(a.start) - toMin(b.start));
  for (let i = 1; i < sorted.length; i++) {
    if (toMin(sorted[i].start) < toMin(sorted[i - 1].end)) return "Há janelas sobrepostas neste dia.";
  }
  return null;
}

const endOf = (a: Appointment, services: Service[]) => {
  const s = services.find((x) => x.id === a.serviceId);
  return toMin(a.start) + (s?.durationMin ?? 0);
};

/** Procura conflitos: fora do horário, dia fechado e sobreposição (considerando o intervalo). */
export function findConflicts(
  appts: Appointment[],
  services: Service[],
  rules: DayRule[],
  general: GeneralRules,
): Conflict[] {
  const out: Conflict[] = [];
  const byDay = new Map<number, Appointment[]>();
  appts.forEach((a) => byDay.set(a.day, [...(byDay.get(a.day) ?? []), a]));

  for (const [day, list] of byDay) {
    const rule = rules.find((r) => r.day === day);
    const dayName = rule?.label ?? "Dia";
    const sorted = [...list].sort((a, b) => toMin(a.start) - toMin(b.start));

    sorted.forEach((a, i) => {
      const svc = services.find((s) => s.id === a.serviceId);
      const name = svc?.name ?? "Serviço";
      const start = toMin(a.start);
      const end = endOf(a, services);

      if (!rule?.open) {
        out.push({ day, time: a.start, title: `${dayName}, ${a.start}`, message: `${name} está em um dia fechado.`, ids: [a.id] });
      } else if (!rule.windows.some((w) => start >= toMin(w.start) && end <= toMin(w.end))) {
        out.push({ day, time: a.start, title: `${dayName}, ${a.start}`, message: `${name} fica fora das janelas de atendimento.`, ids: [a.id] });
      }

      const next = sorted[i + 1];
      if (next && end + general.bufferMin > toMin(next.start)) {
        out.push({
          day,
          time: next.start,
          title: `${dayName}, ${a.start}`,
          message: `${name} termina às ${toHHMM(end)} e o próximo começa ${next.start}.`,
          ids: [a.id, next.id],
        });
      }
    });
  }
  return out;
}

/** Gera uma grade sem conflitos, preenchendo cada janela com os serviços ativos. */
export function generateGrid(rules: DayRule[], services: Service[], general: GeneralRules): Appointment[] {
  const active = services.filter((s) => s.active);
  if (active.length === 0) return [];
  const result: Appointment[] = [];
  let n = 0;
  for (const r of rules) {
    if (!r.open) continue;
    for (const w of r.windows) {
      let cursor = toMin(w.start);
      const end = toMin(w.end);
      let skip = false; // pula de 2 em 2 slots para a grade não ficar lotada
      for (;;) {
        const svc = active[(n + r.day) % active.length];
        if (cursor + svc.durationMin > end) break;
        if (!skip) result.push({ id: uid(), day: r.day, start: toHHMM(cursor), serviceId: svc.id });
        skip = !skip;
        cursor += svc.durationMin + general.bufferMin;
        n++;
      }
    }
  }
  return result;
}
