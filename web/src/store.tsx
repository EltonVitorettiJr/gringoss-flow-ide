import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, apiEnabled, routes, unwrapList } from "./api";
import { rulesFromApi, ruleToPayload, servicesFromApi, type ApiRule, type ApiService } from "./lib/mappers";
import { seedAppointments, seedGeneral, seedRules, seedServices } from "./lib/seed";
import { uid } from "./lib/schedule";
import type { Appointment, DayRule, GeneralRules, Service } from "./types";

type Toast = { id: number; text: string; kind: "ok" | "error" } | null;
type Status = "loading" | "ready" | "error";
export type ServiceInput = { id?: string; name: string; durationMin: number; price: number };

type Store = {
  status: Status;
  reload: () => Promise<void>;
  rules: DayRule[];
  services: Service[];
  general: GeneralRules;
  appointments: Appointment[];
  saveRules: (r: DayRule[]) => Promise<boolean>;
  saveService: (s: ServiceInput) => Promise<boolean>;
  deleteService: (id: string) => Promise<boolean>;
  setServiceActive: (id: string, active: boolean) => void;
  saveGeneral: (g: GeneralRules) => void;
  setAppointments: (a: Appointment[]) => void;
  toast: Toast;
  notify: (text: string, kind?: "ok" | "error") => void;
};

const Ctx = createContext<Store | null>(null);
const prefix = apiEnabled ? "gringoss:api:" : "gringoss:";

function usePersisted<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(prefix + key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(prefix + key, JSON.stringify(value));
    } catch {
      /* armazenamento indisponível: segue só em memória */
    }
  }, [key, value]);
  return [value, setValue] as const;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [rules, setRules] = useState<DayRule[]>(apiEnabled ? [] : seedRules);
  const [baseServices, setBaseServices] = useState<Service[]>(apiEnabled ? [] : seedServices);
  const [activeMap, setActiveMap] = usePersisted<Record<string, boolean>>("serviceActive", {});
  const [general, setGeneral] = usePersisted<GeneralRules>("general", seedGeneral);
  const [appointments, setAppointments] = usePersisted<Appointment[]>("appointments", seedAppointments);
  const [status, setStatus] = useState<Status>(apiEnabled ? "loading" : "ready");
  const [toast, setToast] = useState<Toast>(null);

  // Modo local: regras e serviços também persistem no navegador.
  const [localRules, setLocalRules] = usePersisted<DayRule[]>("rules", seedRules);
  const [localServices, setLocalServices] = usePersisted<Service[]>("services", seedServices);
  useEffect(() => { if (!apiEnabled) setRules(localRules); }, [localRules]);
  useEffect(() => { if (!apiEnabled) setBaseServices(localServices); }, [localServices]);

  const notify = useCallback((text: string, kind: "ok" | "error" = "ok") => {
    const id = Date.now();
    setToast({ id, text, kind });
    window.setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 3600);
  }, []);

  const reload = useCallback(async () => {
    if (!apiEnabled) return;
    try {
      const [r, s] = await Promise.all([api.get<unknown>(routes.rules), api.get<unknown>(routes.services)]);
      setRules(rulesFromApi(unwrapList<ApiRule>(r, ["rules"])));
      setBaseServices(servicesFromApi(unwrapList<ApiService>(s, ["services"])));
      setStatus("ready");
    } catch {
      setStatus((cur) => (cur === "ready" ? cur : "error"));
      notify("Não consegui falar com a API. Ela está rodando?", "error");
    }
  }, [notify]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const services = useMemo(
    () => baseServices.map((s) => ({ ...s, active: activeMap[s.id] ?? s.active })),
    [baseServices, activeMap],
  );

  const fail = useCallback(
    async (e: unknown) => {
      notify(e instanceof Error ? e.message : "Algo deu errado.", "error");
      await reload();
      return false;
    },
    [notify, reload],
  );

  const saveRules = useCallback(
    async (draft: DayRule[]) => {
      if (!apiEnabled) {
        setLocalRules(draft);
        return true;
      }
      try {
        for (const d of draft) {
          const cur = rules.find((r) => r.day === d.day);
          const id = cur?.ruleId;
          if (!d.open) {
            if (id) await api.del(`${routes.rules}/${id}`);
            continue;
          }
          const payload = ruleToPayload(d);
          const hadBreak = (cur?.windows.length ?? 0) > 1;
          const hasBreak = d.windows.length > 1;
          if (!id) {
            await api.post(routes.rules, payload);
          } else if (hadBreak && !hasBreak) {
            // A API não aceita limpar a pausa via PUT (campo opcional, não nulo): recria a regra.
            await api.del(`${routes.rules}/${id}`);
            await api.post(routes.rules, payload);
          } else {
            await api.put(`${routes.rules}/${id}`, payload);
          }
        }
        await reload();
        return true;
      } catch (e) {
        return fail(e);
      }
    },
    [rules, reload, fail, setLocalRules],
  );

  const saveService = useCallback(
    async (s: ServiceInput) => {
      if (!apiEnabled) {
        setLocalServices((cur) =>
          s.id
            ? cur.map((x) => (x.id === s.id ? { ...x, name: s.name, durationMin: s.durationMin, price: s.price } : x))
            : [...cur, { id: uid(), name: s.name, durationMin: s.durationMin, price: s.price, active: true }],
        );
        return true;
      }
      try {
        const body = { name: s.name, durationMinutes: s.durationMin, price: s.price };
        if (s.id) await api.put(`${routes.services}/${s.id}`, body);
        else await api.post(routes.services, body);
        await reload();
        return true;
      } catch (e) {
        return fail(e);
      }
    },
    [reload, fail, setLocalServices],
  );

  const deleteService = useCallback(
    async (id: string) => {
      if (!apiEnabled) {
        setLocalServices((cur) => cur.filter((x) => x.id !== id));
        return true;
      }
      try {
        await api.del(`${routes.services}/${id}`);
        await reload();
        return true;
      } catch {
        notify("Não foi possível excluir. Se houver agendamentos com este serviço, desative-o em vez de excluir.", "error");
        return false;
      }
    },
    [reload, notify, setLocalServices],
  );

  const value = useMemo<Store>(
    () => ({
      status, reload, rules, services, general, appointments, toast, notify,
      setAppointments, saveRules, saveService, deleteService,
      setServiceActive: (id, active) => setActiveMap((m) => ({ ...m, [id]: active })),
      saveGeneral: (g) => setGeneral(g),
    }),
    [status, reload, rules, services, general, appointments, toast, notify, setAppointments, saveRules, saveService, deleteService, setActiveMap, setGeneral],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore fora do StoreProvider");
  return v;
}
