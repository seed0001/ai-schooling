import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const Patch = z.object({
  title: z.string().min(2).optional(),
  subject: z.string().min(2).optional(),
  gradeLevel: z.string().min(1).optional(),
  learnerProfile: z.string().min(10).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const owned = await db.curriculum.findFirst({ where: { id, userId: user.id }, select: { id: true } });
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = Patch.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const curriculum = await db.curriculum.update({ where: { id }, data: parsed.data });
  return NextResponse.json(curriculum);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const owned = await db.curriculum.findFirst({ where: { id, userId: user.id }, select: { id: true } });
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Units -> Weeks -> Lessons and GenerationJobs cascade via schema onDelete rules.
  await db.curriculum.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
