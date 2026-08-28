import { db } from "../db";
import { enqueueGeneration } from "../queue/boss";
import type { PlanPayload } from "../queue/boss";
import { runGenerationJob } from "../queue/runJob";

type NewPlanJob =
  | { kind: "plan-outline"; planId: string }
  | { kind: "plan-module-sessions"; planId: string; moduleId: string; note?: string };

/**
 * Create a PlanJob row, then either run it inline (default) or hand it to the
 * pg-boss worker. Mirrors dispatchGeneration for the old pipeline; set
 * GENERATION_MODE=queue and run `npm run worker` to use the queue.
 */
export async function dispatchPlanGeneration(input: NewPlanJob) {
  const job = await db.planJob.create({
    data: {
      planId: input.planId,
      kind: input.kind,
      targetId: "moduleId" in input ? input.moduleId : null,
    },
  });

  const payload = { jobId: job.id, ...input } as PlanPayload;

  if ((process.env.GENERATION_MODE ?? "inline") === "queue") {
    await enqueueGeneration(payload);
    return { job, mode: "queue" as const };
  }

  await runGenerationJob(payload);
  const finished = await db.planJob.findUnique({ where: { id: job.id } });
  return { job: finished ?? job, mode: "inline" as const };
}
