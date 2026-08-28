import { db } from "../db";
import { generateOutline } from "../generation/outline";
import { generateWeeks } from "../generation/weeks";
import { generateLessons } from "../generation/lessons";
import { runPlanJob } from "../plan/runPlanJob";
import { isPlanPayload, type GenerationPayload } from "./boss";

/**
 * Executes one generation job and keeps its GenerationJob row up to date so the
 * UI can show progress. Safe to call directly (inline mode) or from the worker.
 * Plan-pipeline jobs (see src/lib/plan) are routed to runPlanJob.
 */
export async function runGenerationJob(payload: GenerationPayload) {
  if (isPlanPayload(payload)) {
    await runPlanJob(payload);
    return;
  }

  const { jobId } = payload;
  await db.generationJob.update({
    where: { id: jobId },
    data: { status: "RUNNING", error: null },
  });

  try {
    switch (payload.kind) {
      case "outline": {
        await generateOutline(payload.curriculumId);
        break;
      }
      case "unit-weeks": {
        await generateWeeks(payload.unitId, payload.note);
        break;
      }
      case "week-lessons": {
        await generateLessons(payload.weekId, payload.note);
        break;
      }
      case "unit-all-lessons": {
        let weeks = await db.week.findMany({
          where: { unitId: payload.unitId },
          orderBy: { order: "asc" },
        });
        if (weeks.length === 0) {
          await generateWeeks(payload.unitId);
          weeks = await db.week.findMany({
            where: { unitId: payload.unitId },
            orderBy: { order: "asc" },
          });
        }
        await db.generationJob.update({
          where: { id: jobId },
          data: { total: weeks.length, progress: 0 },
        });
        for (let i = 0; i < weeks.length; i++) {
          await generateLessons(weeks[i].id);
          await db.generationJob.update({
            where: { id: jobId },
            data: { progress: i + 1 },
          });
        }
        break;
      }
    }

    await db.generationJob.update({
      where: { id: jobId },
      data: { status: "DONE" },
    });
  } catch (err) {
    await db.generationJob.update({
      where: { id: jobId },
      data: { status: "FAILED", error: String(err instanceof Error ? err.message : err) },
    });
    throw err;
  }
}
