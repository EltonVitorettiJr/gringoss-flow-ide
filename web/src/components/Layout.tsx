import { NavLink, Outlet } from "react-router-dom";
import { useStore } from "../store";

const links = [
  { to: "/horarios", label: "Regras de horário" },
  { to: "/servicos", label: "Serviços" },
  { to: "/simulacao", label: "Simulação da agenda" },
];

export default function Layout() {
  const { toast, status, reload } = useStore();
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <strong>Gringoss</strong>
          <span>Regras de agendamento</span>
        </div>
        <nav aria-label="Principal">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => (isActive ? "nav active" : "nav")}>
              {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="main">
        {status === "ready" && <Outlet />}
        {status === "loading" && <p className="empty">Carregando dados da API…</p>}
        {status === "error" && (
          <div className="card state-error">
            <h2>Não foi possível conectar à API</h2>
            <p>Confira se a API está rodando em <code>{import.meta.env.VITE_API_URL}</code> e se o CORS está liberado para este endereço.</p>
            <button type="button" className="btn primary" onClick={() => void reload()}>Tentar de novo</button>
          </div>
        )}
      </main>
      <div className="toast-region" role="status" aria-live="polite">
        {toast && <div className={`toast ${toast.kind}`}>{toast.text}</div>}
      </div>
    </div>
  );
}
