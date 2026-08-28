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

// --- Second pipeline: LearningPlan.context / .shape -------------------------
// Everything here is optional. The point of this pipeline is that nothing is
// required beyond title / topic / goal — no grade, no calendar.

export const PlanContextSchema = z.object({
  /** Where the learner is starting from: prior knowledge, current level. */
  startingPoint: z.string().default(""),
  /** How much time is available overall, in the user's own words. */
  timeBudget: z.string().default(""),
  /** Delivery format: in person, online, self-paced, one weekend, etc. */
  format: z.string().default(""),
  /** Teaching / learning approach: hands-on, lecture, reading-first, etc. */
  approach: z.string().default(""),
  /** Materials, tools, or resources already on hand. */
  resources: z.string().default(""),
  /** Hard constraints: no budget, no lab, evenings only, etc. */
  constraints: z.string().default(""),
  notes: z.string().default(""),
});
export type PlanContext = z.infer<typeof PlanContextSchema>;

export const PlanShapeSchema = z.object({
  /** Pacing in the user's own words: "over about 8 weeks", "a single weekend". */
  pacing: z.string().default(""),
  /** Optional nudge for how many modules the outline should have. */
  moduleCountHint: z.number().int().min(1).max(40).optional(),
  /** Optional nudge for sessions per module. */
  sessionsPerModuleHint: z.number().int().min(1).max(20).optional(),
  /** Rough length of one session, in minutes. */
  sessionLengthMin: z.number().int().min(5).max(600).default(45),
});
export type PlanShape = z.infer<typeof PlanShapeSchema>;

export function parsePlanContext(value: unknown): PlanContext {
  return PlanContextSchema.parse(value ?? {});
}

export function parsePlanShape(value: unknown): PlanShape {
  return PlanShapeSchema.parse(value ?? {});
}

export const SessionSegment = z.object({
  heading: z.string().min(2),
  body: z.string().min(1),
});
export type SessionSegment = z.infer<typeof SessionSegment>;

export function parseSegments(value: unknown): SessionSegment[] {
  const parsed = z.array(SessionSegment).safeParse(value);
  return parsed.success ? parsed.data : [];
}
