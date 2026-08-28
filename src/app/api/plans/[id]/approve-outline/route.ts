import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const Body = z.object({ approved: z.boolean() });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "bad body" }, { status: 400 });

  const plan = await db.learningPlan.findFirst({ where: { id, userId: user.id }, select: { id: true } });
  if (!plan) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.learningPlan.update({
    where: { id },
    data: { outlineStatus: parsed.data.approved ? "APPROVED" : "DRAFT" },
  });
  return NextResponse.json({ ok: true });
}
