import { db } from "../db";
import { MODELS } from "../ai/client";
import { generateJSON } from "../ai/generate";
import { PlanOutlineResult } from "./schemas";
import { systemFor, outlinePrompt } from "./prompts";

/**
 * Generate (or regenerate) the module outline for a learning plan. Replaces any
 * existing modules. Refuses once the outline is APPROVED so downstream work
 * isn't silently destroyed.
 */
export async function generatePlanOutline(planId: string) {
  const plan = await db.learningPlan.findUniqueOrThrow({ where: { id: planId } });
  if (plan.outlineStatus === "APPROVED") {
    throw new Error("Outline is approved. Set it back to draft before regenerating.");
  }

  const result = await generateJSON({
    model: MODELS.outline,
    system: systemFor(plan.track),
    prompt: outlinePrompt(plan),
    schema: PlanOutlineResult,
  });

  await db.$transaction([
    db.planModule.deleteMany({ where: { planId } }),
    ...result.modules.map((m, i) =>
      db.planModule.create({
        data: {
          planId,
          order: i + 1,
          title: m.title,
          summary: m.summary,
          outcomes: m.outcomes,
          estSessions: m.estSessions,
        },
      }),
    ),
  ]);

  return db.planModule.findMany({ where: { planId }, orderBy: { order: "asc" } });
}
