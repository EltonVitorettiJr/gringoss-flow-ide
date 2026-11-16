import type { Appointment, DayRule, GeneralRules, Service } from "../types";

const w = (id: string, start: string, end: string) => ({ id, start, end });
const weekday = (day: number, label: string, short: string, end = "19:00"): DayRule => ({
  day, label, short, open: true,
  windows: [w(`${day}a`, "09:00", "12:00"), w(`${day}b`, "13:30", end)],
});

export const seedRules: DayRule[] = [
  weekday(1, "Segunda", "Seg"),
  weekday(2, "Terça", "Ter"),
  weekday(3, "Quarta", "Qua"),
  weekday(4, "Quinta", "Qui", "20:00"),
  weekday(5, "Sexta", "Sex", "20:00"),
  { day: 6, label: "Sábado", short: "Sáb", open: true, windows: [w("6a", "08:00", "16:00")] },
  { day: 0, label: "Domingo", short: "Dom", open: false, windows: [] },
];

export const seedServices: Service[] = [
  { id: "corte", name: "Corte", durationMin: 40, price: 45, active: true },
  { id: "barba", name: "Barba", durationMin: 30, price: 35, active: true },
  { id: "corte-barba", name: "Corte + Barba", durationMin: 70, price: 70, active: true },
  { id: "sobrancelha", name: "Sobrancelha", durationMin: 15, price: 15, active: true },
  { id: "pigmentacao", name: "Pigmentação", durationMin: 50, price: 60, active: true },
];

export const seedGeneral: GeneralRules = {
  bufferMin: 10,
  minAdvanceHours: 2,
  bookingLimitDays: 30,
  maxPerClientPerDay: 2,
};

const a = (id: string, day: number, start: string, serviceId: string): Appointment => ({ id, day, start, serviceId });
export const seedAppointments: Appointment[] = [
  a("s1", 1, "09:00", "corte"),
  a("s2", 1, "10:00", "corte-barba"),
  a("s3", 2, "09:30", "barba"),
  a("s4", 2, "14:00", "corte"),
  a("s5", 3, "11:00", "sobrancelha"),
  a("s6", 4, "09:00", "corte"),
  a("s7", 4, "16:00", "pigmentacao"),
  a("s8", 5, "14:00", "corte-barba"),
  a("s9", 5, "14:30", "corte"), // conflito proposital, como no protótipo
  a("s10", 6, "08:00", "corte"),
  a("s11", 6, "11:00", "barba"),
];
