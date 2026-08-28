import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const Body = z.object({
  title: z.string().min(3).optional(),
  summary: z.string().min(10).optional(),
  outcomes: z.array(z.string()).optional(),
  estSessions: z.number().int().min(1).max(20).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const owned = await db.planModule.findFirst({
    where: { id, plan: { userId: user.id } },
    select: { id: true },
  });
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const module = await db.planModule.update({ where: { id }, data: parsed.data });
  return NextResponse.json(module);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const owned = await db.planModule.findFirst({
    where: { id, plan: { userId: user.id } },
    select: { id: true },
  });
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await db.planModule.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
