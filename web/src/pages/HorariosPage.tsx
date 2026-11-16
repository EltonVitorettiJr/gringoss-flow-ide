import { useState } from "react";
import { apiEnabled } from "../api";
import PageHeader from "../components/PageHeader";
import Toggle from "../components/Toggle";
import { toHHMM, toMin, uid, validateWindows } from "../lib/schedule";
import { useStore } from "../store";
import type { DayRule } from "../types";

// Ordem de exibição: segunda a domingo
const order = [1, 2, 3, 4, 5, 6, 0];

export default function HorariosPage() {
  const { rules, saveRules, notify } = useStore();
  const [draft, setDraft] = useState<DayRule[]>(() =>
    order.map((d) => structuredClone(rules.find((r) => r.day === d)!)),
  );
  const [errors, setErrors] = useState<Record<number, string>>({});

  const update = (day: number, fn: (r: DayRule) => DayRule) =>
    setDraft((cur) => cur.map((r) => (r.day === day ? fn(r) : r)));

  const toggle = (day: number, open: boolean) =>
    update(day, (r) => ({
      ...r,
      open,
      windows: open && r.windows.length === 0 ? [{ id: uid(), start: "09:00", end: "18:00" }] : r.windows,
    }));

  const addWindow = (day: number) =>
    update(day, (r) => {
      const last = r.windows.at(-1);
      const start = last ? Math.min(toMin(last.end) + 60, 22 * 60) : 9 * 60;
      return { ...r, windows: [...r.windows, { id: uid(), start: toHHMM(start), end: toHHMM(Math.min(start + 120, 23 * 60 + 59)) }] };
    });

  const setTime = (day: number, id: string, field: "start" | "end", value: string) =>
    update(day, (r) => ({ ...r, windows: r.windows.map((w) => (w.id === id ? { ...w, [field]: value } : w)) }));

  const removeWindow = (day: number, id: string) =>
    update(day, (r) => ({ ...r, windows: r.windows.filter((w) => w.id !== id) }));

  const save = async () => {
    const next: Record<number, string> = {};
    for (const r of draft) {
      if (!r.open) continue;
      const err =
        r.windows.length === 0
          ? "Adicione ao menos uma janela ou feche o dia."
          : apiEnabled && r.windows.length > 2
            ? "A API aceita no máximo 2 janelas por dia (uma pausa no meio)."
            : validateWindows(r.windows);
      if (err) next[r.day] = err;
    }
    setErrors(next);
    if (Object.keys(next).length > 0) {
      notify("Corrija os dias destacados antes de salvar.", "error");
      return;
    }
    const sorted = draft.map((r) => ({
      ...r,
      windows: [...r.windows].sort((a, b) => toMin(a.start) - toMin(b.start)),
    }));
    if (await saveRules(sorted)) notify("Regras salvas");
  };

  return (
    <>
      <PageHeader title="Regras de horário" subtitle="Defina em quais dias e janelas a barbearia atende." />
      <section className="card">
        {apiEnabled && <p className="hint">Cada dia aceita até 2 janelas: o intervalo entre elas é a pausa (ex.: almoço).</p>}
        <ul className="day-list">
          {draft.map((r) => (
            <li key={r.day} className="day-row">
              <div className="day-main">
                <Toggle checked={r.open} onChange={(v) => toggle(r.day, v)} label={`${r.label}: ${r.open ? "aberto" : "fechado"}`} />
                <span className={r.open ? "day-name" : "day-name muted"}>{r.label}</span>
                {r.open ? (
                  <div className="windows">
                    {r.windows.map((w) => (
                      <div className="pill" key={w.id}>
                        <input type="time" aria-label={`${r.label}: início`} value={w.start} onChange={(e) => setTime(r.day, w.id, "start", e.target.value)} />
                        <span aria-hidden>–</span>
                        <input type="time" aria-label={`${r.label}: fim`} value={w.end} onChange={(e) => setTime(r.day, w.id, "end", e.target.value)} />
                        <button type="button" className="pill-x" aria-label={`Remover janela de ${r.label}`} onClick={() => removeWindow(r.day, w.id)}>×</button>
                      </div>
                    ))}
                    <button type="button" className="link-btn" onClick={() => addWindow(r.day)}>+ janela</button>
                  </div>
                ) : (
                  <span className="muted">Fechado</span>
                )}
              </div>
              {errors[r.day] && <p className="field-error" role="alert">{errors[r.day]}</p>}
            </li>
          ))}
        </ul>
        <div className="card-footer">
          <button type="button" className="btn primary" onClick={save}>Salvar regras</button>
        </div>
      </section>
    </>
  );
}
