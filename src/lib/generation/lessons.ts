import { db } from "../db";
import { MODELS } from "../ai/client";
import { generateJSON } from "../ai/generate";
import { LessonsResult } from "../ai/schemas";
import { SYSTEM_PLANNER, lessonsPrompt } from "../ai/prompts";
import { parseCalendar } from "../types";

/**
 * Generate the daily lessons for one week. Replaces existing lessons for that
 * week. Feeds the model the titles of lessons already planned elsewhere in the
 * unit so it doesn't repeat itself.
 */
export async function generateLessons(weekId: string, note?: string) {
  const week = await db.week.findUniqueOrThrow({
    where: { id: weekId },
    include: {
      unit: {
        include: {
          curriculum: true,
          weeks: { include: { lessons: true }, orderBy: { order: "asc" } },
        },
      },
    },
  });

  const { unit } = week;
  const { curriculum } = unit;
  const cal = parseCalendar(curriculum.calendar);

  const otherLessonTitles = unit.weeks
    .filter((w) => w.id !== weekId)
    .flatMap((w) => w.lessons.map((l) => l.title));

  const result = await generateJSON({
    model: MODELS.lessons,
    system: SYSTEM_PLANNER,
    prompt: lessonsPrompt(curriculum, unit, week, cal.daysPerWeek, otherLessonTitles, note),
    schema: LessonsResult,
  });

  await db.$transaction([
    db.lesson.deleteMany({ where: { weekId } }),
    ...result.lessons.map((l, i) =>
      db.lesson.create({
        data: {
          weekId,
          order: i + 1,
          title: l.title,
          objective: l.objective,
          materials: l.materials,
          hook: l.hook,
          instruction: l.instruction,
          practice: l.practice,
          assessment: l.assessment,
          differentiation: l.differentiation,
          homework: l.homework ?? null,
          timeEstimateMin: l.timeEstimateMin,
        },
      }),
    ),
    db.week.update({ where: { id: weekId }, data: { lessonsGenerated: true } }),
  ]);

  return db.lesson.findMany({ where: { weekId }, orderBy: { order: "asc" } });
}
