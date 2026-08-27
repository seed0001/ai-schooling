import { db } from "../db";
import { MODELS } from "../ai/client";
import { generateJSON } from "../ai/generate";
import { WeeksResult } from "../ai/schemas";
import { SYSTEM_PLANNER, weeksPrompt } from "../ai/prompts";

/**
 * Break one unit into weeks. Replaces existing weeks for the unit (and their
 * lessons, by cascade). `note` lets the caller steer a regeneration.
 */
export async function generateWeeks(unitId: string, note?: string) {
  const unit = await db.unit.findUniqueOrThrow({
    where: { id: unitId },
    include: { curriculum: { include: { units: { orderBy: { order: "asc" } } } } },
  });
  const curriculum = unit.curriculum;
  const siblingTitles = curriculum.units.map((u) => u.title);

  const result = await generateJSON({
    model: MODELS.weeks,
    system: SYSTEM_PLANNER,
    prompt: weeksPrompt(curriculum, unit, siblingTitles, note),
    schema: WeeksResult,
  });

  await db.$transaction([
    db.week.deleteMany({ where: { unitId } }),
    ...result.weeks.map((w, i) =>
      db.week.create({
        data: { unitId, order: i + 1, focus: w.focus, objectives: w.objectives },
      }),
    ),
    db.unit.update({ where: { id: unitId }, data: { weeksGenerated: true } }),
  ]);

  return db.week.findMany({ where: { unitId }, orderBy: { order: "asc" } });
}
