import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const Body = z.object({
  title: z.string().min(3).optional(),
  summary: z.string().min(10).optional(),
  bigIdeas: z.array(z.string()).optional(),
  essentialQuestions: z.array(z.string()).optional(),
  estWeeks: z.number().int().min(1).max(8).optional(),
  status: z.enum(["DRAFT", "APPROVED"]).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const owned = await db.unit.findFirst({
    where: { id, curriculum: { userId: user.id } },
    select: { id: true },
  });
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const unit = await db.unit.update({ where: { id }, data: parsed.data });
  return NextResponse.json(unit);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const owned = await db.unit.findFirst({
    where: { id, curriculum: { userId: user.id } },
    select: { id: true },
  });
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await db.unit.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
