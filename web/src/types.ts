export type TimeWindow = { id: string; start: string; end: string };

export type DayRule = {
  day: number; // 0 = domingo ... 6 = sábado
  ruleId?: string; // id da linha em BusinessRule (modo API)
  label: string;
  short: string;
  open: boolean;
  windows: TimeWindow[];
};

export type Service = {
  id: string;
  name: string;
  durationMin: number;
  price: number;
  active: boolean;
};

export type GeneralRules = {
  bufferMin: number;
  minAdvanceHours: number;
  bookingLimitDays: number;
  maxPerClientPerDay: number;
};

export type Appointment = { id: string; day: number; start: string; serviceId: string };

export type Conflict = { day: number; time: string; title: string; message: string; ids: string[] };
