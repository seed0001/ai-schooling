import { z } from "zod";

export const UnitDraft = z.object({
  title: z.string().min(3),
  summary: z.string().min(10),
  bigIdeas: z.array(z.string().min(3)).min(1).max(6),
  essentialQuestions: z.array(z.string().min(5)).min(1).max(6),
  estWeeks: z.number().int().min(1).max(8),
});
export type UnitDraft = z.infer<typeof UnitDraft>;

export const OutlineResult = z.object({
  units: z.array(UnitDraft).min(4).max(20),
});
export type OutlineResult = z.infer<typeof OutlineResult>;

export const WeekDraft = z.object({
  focus: z.string().min(5),
  objectives: z.array(z.string().min(5)).min(1).max(6),
});
export type WeekDraft = z.infer<typeof WeekDraft>;

export const WeeksResult = z.object({
  weeks: z.array(WeekDraft).min(1).max(10),
});
export type WeeksResult = z.infer<typeof WeeksResult>;

export const LessonDraft = z.object({
  title: z.string().min(3),
  objective: z.string().min(5),
  materials: z.array(z.string()).max(15),
  hook: z.string().min(5),
  instruction: z.string().min(10),
  practice: z.string().min(10),
  assessment: z.string().min(5),
  differentiation: z.string().min(5),
  homework: z.string().nullable().optional(),
  timeEstimateMin: z.number().int().min(10).max(180),
});
export type LessonDraft = z.infer<typeof LessonDraft>;

export const LessonsResult = z.object({
  lessons: z.array(LessonDraft).min(1).max(7),
});
export type LessonsResult = z.infer<typeof LessonsResult>;
