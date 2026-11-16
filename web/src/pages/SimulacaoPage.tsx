import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { findConflicts, fmtDuration, generateGrid, toHHMM, toMin } from "../lib/schedule";
import { useStore } from "../store";

const HOUR_PX = 48;
const days = [1, 2, 3, 4, 5, 6];
const dayShort: Record<number, string> = { 1: "Seg", 2: "Ter", 3: "Qua", 4: "Qui", 5: "Sex", 6: "Sáb", 0: "Dom" };
const colors = ["#F3E3C3", "#CFE8DC", "#E3D3F0", "#F6D4D4", "#CFE0F3", "#E6E2B5"];

export default function SimulacaoPage() {
  const { rules, services, general, appointments, setAppointments, notify } = useStore();
  const navigate = useNavigate();

  const conflicts = useMemo(() => findConflicts(appointments, services, rules, general), [appointments, services, rules, general]);
  const conflictIds = useMemo(() => new Set(conflicts.flatMap((c) => c.ids)), [conflicts]);

  // Faixa vertical: do primeiro início ao último fim entre as regras (mínimo 8h–18h)
  const [from, to] = useMemo(() => {
    const all = rules.filter((r) => r.open).flatMap((r) => r.windows);
    const lo = Math.min(8 * 60, ...all.map((w) => toMin(w.start)));
    const hi = Math.max(18 * 60, ...all.map((w) => toMin(w.end)));
    return [Math.floor(lo / 60) * 60, Math.ceil(hi / 60) * 60];
  }, [rules]);

  const hours = Array.from({ length: (to - from) / 60 + 1 }, (_, i) => from + i * 60);
  const height = ((to - from) / 60) * HOUR_PX;
  const y = (min: number) => ((min - from) / 60) * HOUR_PX;

  const generate = () => {
    const grid = generateGrid(rules, services, general);
    setAppointments(grid);
    notify(`Grade gerada com ${grid.length} atendimentos`);
  };

  return (
    <>
      <PageHeader title="Simulação da agenda" subtitle="Veja como as regras ficam na prática e onde há conflitos." />
      <div className="grid-sim">
        <section className="card">
          <h2>Semana simulada</h2>
          <div className="cal" style={{ ["--cal-h" as string]: `${height}px` }}>
            <div className="cal-head">
              <span />
              {days.map((d) => <span key={d}>{dayShort[d]}</span>)}
            </div>
            <div className="cal-body">
              <div className="cal-hours" style={{ height }}>
                {hours.map((h) => <span key={h} style={{ top: y(h) - 7 }}>{toHHMM(h)}</span>)}
              </div>
              {days.map((d) => {
                const rule = rules.find((r) => r.day === d);
                return (
                  <div className="cal-col" key={d} style={{ height }}>
                    {hours.map((h) => <i key={h} className="cal-line" style={{ top: y(h) }} />)}
                    {rule?.windows.map((w) => rule.open && (
                      <div key={w.id} className="cal-window" style={{ top: y(toMin(w.start)), height: y(toMin(w.end)) - y(toMin(w.start)) }} />
                    ))}
                    {appointments.filter((a) => a.day === d).map((a) => {
                      const idx = services.findIndex((s) => s.id === a.serviceId);
                      const svc = services[idx];
                      if (!svc) return null;
                      const bad = conflictIds.has(a.id);
                      return (
                        <div
                          key={a.id}
                          className={bad ? "appt bad" : "appt"}
                          style={{ top: y(toMin(a.start)), height: Math.max((svc.durationMin / 60) * HOUR_PX, 18), background: bad ? undefined : colors[idx % colors.length] }}
                          title={`${svc.name} · ${a.start} · ${fmtDuration(svc.durationMin)}`}
                        >
                          {svc.name}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="card side">
          <h2>Resumo</h2>
          <div className="stat"><b>{appointments.length}</b><span>atendimentos simulados</span></div>
          <div className="stat"><b className={conflicts.length ? "danger" : "ok"}>{conflicts.length}</b><span>{conflicts.length === 1 ? "conflito encontrado" : "conflitos encontrados"}</span></div>
          <div className="conflicts">
            {conflicts.length === 0 && <p className="empty">Nenhum conflito. As regras atuais comportam esta agenda.</p>}
            {conflicts.map((c, i) => (
              <div className="conflict" key={i}>
                <strong>{c.title}</strong>
                <p>{c.message}</p>
              </div>
            ))}
          </div>
          <div className="push-bottom stack">
            <button type="button" className="btn primary block" onClick={generate}>Gerar grade</button>
            <button type="button" className="btn block" onClick={() => navigate("/horarios")}>Ajustar regras</button>
          </div>
        </section>
      </div>
    </>
  );
}
