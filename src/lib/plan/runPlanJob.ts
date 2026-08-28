import { db } from "../db";
import type { PlanPayload } from "../queue/boss";
import { generatePlanOutline } from "./outline";
import { generateModuleSessions } from "./sessions";

/**
 * Executes one LearningPlan generation job and keeps its PlanJob row up to date
 * so the UI can show progress. Mirrors runGenerationJob for the old pipeline.
 */
export async function runPlanJob(payload: PlanPayload) {
  const { jobId } = payload;
  await db.planJob.update({
    where: { id: jobId },
    data: { status: "RUNNING", error: null },
  });

  try {
    switch (payload.kind) {
      case "plan-outline": {
        await generatePlanOutline(payload.planId);
        break;
      }
      case "plan-module-sessions": {
        await generateModuleSessions(payload.moduleId, payload.note);
        break;
      }
    }

    await db.planJob.update({ where: { id: jobId }, data: { status: "DONE" } });
  } catch (err) {
    await db.planJob.update({
      where: { id: jobId },
      data: { status: "FAILED", error: String(err instanceof Error ? err.message : err) },
    });
    throw err;
  }
}
