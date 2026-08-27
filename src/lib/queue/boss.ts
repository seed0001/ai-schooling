import PgBoss from "pg-boss";

export const QUEUE = "generation";

export type GenerationPayload =
  | { jobId: string; kind: "outline"; curriculumId: string }
  | { jobId: string; kind: "unit-weeks"; curriculumId: string; unitId: string; note?: string }
  | { jobId: string; kind: "week-lessons"; curriculumId: string; weekId: string; note?: string }
  | { jobId: string; kind: "unit-all-lessons"; curriculumId: string; unitId: string };

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
