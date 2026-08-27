import { db } from "../db";
import { MODELS } from "../ai/client";
import { generateJSON } from "../ai/generate";
import { OutlineResult } from "../ai/schemas";
import { SYSTEM_PLANNER, outlinePrompt } from "../ai/prompts";

/**
 * Generate (or regenerate) the year outline for a curriculum. Replaces any
 * existing DRAFT units. Refuses if the outline has already been APPROVED so
 * downstream work isn't silently destroyed.
 */
export async function generateOutline(curriculumId: string) {
  const curriculum = await db.curriculum.findUniqueOrThrow({ where: { id: curriculumId } });
  if (curriculum.outlineStatus === "APPROVED") {
    throw new Error("Outline is approved. Set it back to draft before regenerating.");
  }

  const result = await generateJSON({
    model: MODELS.outline,
    system: SYSTEM_PLANNER,
    prompt: outlinePrompt(curriculum),
    schema: OutlineResult,
  });

  await db.$transaction([
    db.unit.deleteMany({ where: { curriculumId } }),
    ...result.units.map((u, i) =>
      db.unit.create({
        data: {
          curriculumId,
          order: i + 1,
          title: u.title,
          summary: u.summary,
          bigIdeas: u.bigIdeas,
          essentialQuestions: u.essentialQuestions,
          estWeeks: u.estWeeks,
        },
      }),
    ),
  ]);

  return db.unit.findMany({ where: { curriculumId }, orderBy: { order: "asc" } });
}
