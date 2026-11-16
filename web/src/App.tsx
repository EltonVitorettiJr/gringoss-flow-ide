import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import HorariosPage from "./pages/HorariosPage";
import ServicosPage from "./pages/ServicosPage";
import SimulacaoPage from "./pages/SimulacaoPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/horarios" replace />} />
        <Route path="horarios" element={<HorariosPage />} />
        <Route path="servicos" element={<ServicosPage />} />
        <Route path="simulacao" element={<SimulacaoPage />} />
        <Route path="*" element={<Navigate to="/horarios" replace />} />
      </Route>
    </Routes>
  );
}
