import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const Patch = z.object({
  title: z.string().min(2).optional(),
  topic: z.string().min(2).optional(),
  audience: z.string().nullable().optional(),
  goal: z.string().min(5).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const owned = await db.learningPlan.findFirst({ where: { id, userId: user.id }, select: { id: true } });
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = Patch.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { audience, ...rest } = parsed.data;
  const plan = await db.learningPlan.update({
    where: { id },
    data: {
      ...rest,
      ...(audience !== undefined ? { audience: audience?.trim() || null } : {}),
    },
  });
  return NextResponse.json(plan);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const owned = await db.learningPlan.findFirst({ where: { id, userId: user.id }, select: { id: true } });
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Modules -> Sessions and PlanJobs cascade via schema onDelete rules.
  await db.learningPlan.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
