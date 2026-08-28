import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { PlanContextSchema, PlanShapeSchema } from "@/lib/types";

const Body = z.object({
  track: z.enum(["TEACHING", "COACHING", "SELF_DIRECTED", "COURSE"]),
  title: z.string().min(2),
  topic: z.string().min(2),
  audience: z.string().optional(),
  goal: z.string().min(5),
  context: PlanContextSchema.partial().optional(),
  shape: PlanShapeSchema.partial().optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const b = parsed.data;

  const plan = await db.learningPlan.create({
    data: {
      userId: user.id,
      track: b.track,
      title: b.title,
      topic: b.topic,
      audience: b.audience?.trim() || null,
      goal: b.goal,
      context: PlanContextSchema.parse(b.context ?? {}),
      shape: PlanShapeSchema.parse(b.shape ?? {}),
    },
  });

  return NextResponse.json({ id: plan.id });
}
