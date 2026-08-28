import { z } from "zod";
import { SessionSegment } from "../types";

export const ModuleDraft = z.object({
  title: z.string().min(3),
  summary: z.string().min(10),
  outcomes: z.array(z.string().min(3)).min(1).max(8),
  estSessions: z.number().int().min(1).max(20),
});
export type ModuleDraft = z.infer<typeof ModuleDraft>;

export const PlanOutlineResult = z.object({
  modules: z.array(ModuleDraft).min(2).max(40),
});
export type PlanOutlineResult = z.infer<typeof PlanOutlineResult>;

export const SessionDraft = z.object({
  title: z.string().min(3),
  objective: z.string().min(5),
  estMinutes: z.number().int().min(5).max(600),
  segments: z.array(SessionSegment).min(2).max(10),
});
export type SessionDraft = z.infer<typeof SessionDraft>;

export const SessionsResult = z.object({
  sessions: z.array(SessionDraft).min(1).max(20),
});
export type SessionsResult = z.infer<typeof SessionsResult>;
