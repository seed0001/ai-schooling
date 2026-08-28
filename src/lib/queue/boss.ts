import PgBoss from "pg-boss";

export const QUEUE = "generation";

export type CurriculumPayload =
  | { jobId: string; kind: "outline"; curriculumId: string }
  | { jobId: string; kind: "unit-weeks"; curriculumId: string; unitId: string; note?: string }
  | { jobId: string; kind: "week-lessons"; curriculumId: string; weekId: string; note?: string }
  | { jobId: string; kind: "unit-all-lessons"; curriculumId: string; unitId: string };

/** Jobs for the audience-agnostic LearningPlan pipeline (see src/lib/plan). */
export type PlanPayload =
  | { jobId: string; kind: "plan-outline"; planId: string }
  | { jobId: string; kind: "plan-module-sessions"; planId: string; moduleId: string; note?: string };

export type GenerationPayload = CurriculumPayload | PlanPayload;

export const PLAN_KINDS = ["plan-outline", "plan-module-sessions"] as const;

export function isPlanPayload(p: GenerationPayload): p is PlanPayload {
  return (PLAN_KINDS as readonly string[]).includes(p.kind);
}

let bossPromise: Promise<PgBoss> | null = null;

async function startBoss(): Promise<PgBoss> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  const boss = new PgBoss({ connectionString });
  boss.on("error", (err) => console.error("[pg-boss]", err));
  await boss.start();
  await boss.createQueue(QUEUE);
  return boss;
}

/**
 * Shared pg-boss instance. Postgres-backed queue — no Redis, one Railway
 * service. The web process uses this only to publish; the worker process
 * (`npm run worker`) starts it and subscribes.
 */
export function getBoss(): Promise<PgBoss> {
  if (!bossPromise) bossPromise = startBoss();
  return bossPromise;
}

export async function enqueueGeneration(payload: GenerationPayload) {
  const boss = await getBoss();
  await boss.send(QUEUE, payload, { retryLimit: 1 });
}
