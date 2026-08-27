import { db } from "../db";
import { enqueueGeneration, type GenerationPayload } from "../queue/boss";
import { runGenerationJob } from "../queue/runJob";

type NewJob =
  | { kind: "outline"; curriculumId: string }
  | { kind: "unit-weeks"; curriculumId: string; unitId: string; note?: string }
  | { kind: "week-lessons"; curriculumId: string; weekId: string; note?: string }
  | { kind: "unit-all-lessons"; curriculumId: string; unitId: string };

/**
 * Create a GenerationJob row, then either run it inline (default — simplest, and
 * fine for dev + small deployments) or hand it to the pg-boss worker.
 * Set GENERATION_MODE=queue and run `npm run worker` to use the queue.
 */
export async function dispatchGeneration(input: NewJob) {
  const job = await db.generationJob.create({
    data: {
      curriculumId: input.curriculumId,
      kind: input.kind,
      targetId: "unitId" in input ? input.unitId : "weekId" in input ? input.weekId : null,
    },
  });

  const payload = { jobId: job.id, ...input } as GenerationPayload;

  if ((process.env.GENERATION_MODE ?? "inline") === "queue") {
    await enqueueGeneration(payload);
    return { job, mode: "queue" as const };
  }

  await runGenerationJob(payload);
  const finished = await db.generationJob.findUnique({ where: { id: job.id } });
  return { job: finished ?? job, mode: "inline" as const };
}
