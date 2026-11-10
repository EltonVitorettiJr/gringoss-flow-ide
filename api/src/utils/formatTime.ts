import { BusinessRule } from "../prisma/index.js";

// Formatação para strings
export const formatTime = (date: string | null): string | null => {
  if (!date) return null;
  return date.substring(11, 16);
};

// Formatação para objetos
export const mapTimeResponse = (rule: BusinessRule) => ({
  ...rule,
  openTime: formatTime(rule.openTime),
  closeTime: formatTime(rule.closeTime),
  breakStart: formatTime(rule.breakStart),
  breakEnd: formatTime(rule.breakEnd),
});