import { useState, type FormEvent } from "react";
import PageHeader from "../components/PageHeader";
import Toggle from "../components/Toggle";
import { fmtDuration, fmtPrice } from "../lib/schedule";
import { useStore } from "../store";
import type { GeneralRules, Service } from "../types";

type Form = { id?: string; name: string; durationMin: string; price: string };
const empty: Form = { name: "", durationMin: "30", price: "" };

export default function ServicosPage() {
  const { services, general, saveService, deleteService, setServiceActive, saveGeneral, notify } = useStore();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<Form | null>(null);
  const [formError, setFormError] = useState("");
  const [gen, setGen] = useState<GeneralRules>(general);

  const openEdit = (s: Service) =>
    setForm({ id: s.id, name: s.name, durationMin: String(s.durationMin), price: String(s.price) });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form) return;
    const durationMin = Number(form.durationMin);
    const price = Number(form.price.replace(",", "."));
    if (!form.name.trim()) return setFormError("Informe o nome do serviço.");
    if (!Number.isFinite(durationMin) || durationMin < 5) return setFormError("A duração precisa ser de pelo menos 5 minutos.");
    if (!Number.isFinite(price) || price <= 0) return setFormError("Informe um preço maior que zero.");
    setBusy(true);
    const ok = await saveService({ id: form.id, name: form.name.trim(), durationMin: Math.round(durationMin), price });
    setBusy(false);
    if (!ok) return;
    notify(form.id ? "Serviço atualizado" : "Serviço criado");
    setForm(null);
    setFormError("");
  };

  const remove = async () => {
    if (!form?.id || !window.confirm(`Excluir o serviço “${form.name}”?`)) return;
    setBusy(true);
    const ok = await deleteService(form.id);
    setBusy(false);
    if (ok) {
      notify("Serviço excluído");
      setForm(null);
    }
  };

  const num = (k: keyof GeneralRules) => (e: { target: { value: string } }) =>
    setGen((g) => ({ ...g, [k]: Number(e.target.value) }));

  const saveGen = () => {
    saveGeneral(gen);
    notify("Regras gerais salvas");
  };

  return (
    <>
      <PageHeader title="Serviços" subtitle="Cadastre os serviços e o tempo que cada um ocupa na agenda." />
      <div className="grid-services">
        <section className="card">
          <div className="card-head">
            <h2>Serviços</h2>
            <button type="button" className="btn primary" onClick={() => { setFormError(""); setForm(empty); }}>+ Novo serviço</button>
          </div>
          <table className="table">
            <thead>
              <tr><th>Serviço</th><th>Duração</th><th>Preço</th><th>Status</th><th><span className="sr-only">Ações</span></th></tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id} className={s.active ? "" : "inactive"}>
                  <td className="strong">{s.name}</td>
                  <td>{fmtDuration(s.durationMin)}</td>
                  <td>{fmtPrice(s.price)}</td>
                  <td><Toggle checked={s.active} onChange={(v) => setServiceActive(s.id, v)} label={`${s.name}: ${s.active ? "ativo" : "inativo"}`} /></td>
                  <td><button type="button" className="link-btn" onClick={() => { setFormError(""); openEdit(s); }}>Editar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {services.length === 0 && <p className="empty">Nenhum serviço ainda. Crie o primeiro em “Novo serviço”.</p>}
        </section>

        <section className="card side">
          <h2>Regras gerais</h2>
          <label className="field">
            <span>Intervalo entre atendimentos</span>
            <select value={gen.bufferMin} onChange={num("bufferMin")}>
              {[0, 5, 10, 15, 20, 30].map((v) => <option key={v} value={v}>{v === 0 ? "Sem intervalo" : `${v} min`}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Antecedência mínima</span>
            <select value={gen.minAdvanceHours} onChange={num("minAdvanceHours")}>
              {[0, 1, 2, 4, 12, 24].map((v) => <option key={v} value={v}>{v === 0 ? "Sem antecedência" : v === 1 ? "1 hora" : `${v} horas`}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Limite de agendamento</span>
            <select value={gen.bookingLimitDays} onChange={num("bookingLimitDays")}>
              {[7, 15, 30, 60, 90].map((v) => <option key={v} value={v}>{v} dias</option>)}
            </select>
          </label>
          <label className="field">
            <span>Máx. por cliente/dia</span>
            <select value={gen.maxPerClientPerDay} onChange={num("maxPerClientPerDay")}>
              {[1, 2, 3, 4].map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </label>
          <div className="push-bottom">
            <button type="button" className="btn primary block" onClick={saveGen}>Salvar</button>
          </div>
        </section>
      </div>

      {form && (
        <div className="overlay" onClick={() => setForm(null)}>
          <form className="dialog" onSubmit={submit} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="dlg-title">
            <h2 id="dlg-title">{form.id ? "Editar serviço" : "Novo serviço"}</h2>
            <label className="field">
              <span>Nome</span>
              <input autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <div className="two">
              <label className="field">
                <span>Duração (min)</span>
                <input inputMode="numeric" value={form.durationMin} onChange={(e) => setForm({ ...form, durationMin: e.target.value })} />
              </label>
              <label className="field">
                <span>Preço (R$)</span>
                <input inputMode="decimal" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </label>
            </div>
            {formError && <p className="field-error" role="alert">{formError}</p>}
            <div className="dialog-actions">
              {form.id && <button type="button" className="btn danger-text" onClick={remove} disabled={busy}>Excluir</button>}
              <span className="spacer" />
              <button type="button" className="btn" onClick={() => setForm(null)}>Cancelar</button>
              <button type="submit" className="btn primary" disabled={busy}>Salvar serviço</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
