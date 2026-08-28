import { db } from "../db";
import { MODELS } from "../ai/client";
import { generateJSON } from "../ai/generate";
import { SessionsResult } from "./schemas";
import { systemFor, sessionsPrompt } from "./prompts";

/**
 * Generate the sessions for one module. Replaces existing sessions for that
 * module. `note` lets the caller steer a regeneration.
 */
export async function generateModuleSessions(moduleId: string, note?: string) {
  const module = await db.planModule.findUniqueOrThrow({
    where: { id: moduleId },
    include: { plan: { include: { modules: { orderBy: { order: "asc" } } } } },
  });
  const { plan } = module;
  const siblingTitles = plan.modules.map((m) => m.title);

  const result = await generateJSON({
    model: MODELS.lessons,
    system: systemFor(plan.track),
    prompt: sessionsPrompt(plan, module, siblingTitles, note),
    schema: SessionsResult,
  });

  await db.$transaction([
    db.planSession.deleteMany({ where: { moduleId } }),
    ...result.sessions.map((s, i) =>
      db.planSession.create({
        data: {
          moduleId,
          order: i + 1,
          title: s.title,
          objective: s.objective,
          estMinutes: s.estMinutes,
          segments: s.segments,
        },
      }),
    ),
    db.planModule.update({ where: { id: moduleId }, data: { sessionsGenerated: true } }),
  ]);

  return db.planSession.findMany({ where: { moduleId }, orderBy: { order: "asc" } });
}
