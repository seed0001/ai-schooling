import { z } from "zod";

export const PreferencesSchema = z.object({
  /** e.g. "Charlotte Mason", "classical", "traditional", "project-based", "unschool-leaning" */
  approach: z.string().default("balanced / eclectic"),
  minutesPerDay: z.number().int().min(10).max(360).default(45),
  resourcesOnHand: z.string().default(""),
  notes: z.string().default(""),
});
export type Preferences = z.infer<typeof PreferencesSchema>;

export const CalendarSchema = z.object({
  startDate: z.string().default("2026-09-08"),
  endDate: z.string().default("2027-06-11"),
  daysPerWeek: z.number().int().min(1).max(7).default(5),
  weeksOfInstruction: z.number().int().min(4).max(52).default(36),
  breaks: z.array(z.string()).default([]),
});
export type Calendar = z.infer<typeof CalendarSchema>;

export function parsePreferences(value: unknown): Preferences {
  return PreferencesSchema.parse(value ?? {});
}

export function parseCalendar(value: unknown): Calendar {
  return CalendarSchema.parse(value ?? {});
}
