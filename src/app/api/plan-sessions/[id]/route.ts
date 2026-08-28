import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { SessionSegment } from "@/lib/types";

const Body = z.object({
  title: z.string().min(3).optional(),
  objective: z.string().min(5).optional(),
  estMinutes: z.number().int().min(5).max(600).optional(),
  segments: z.array(SessionSegment).min(1).max(10).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const owned = await db.planSession.findFirst({
    where: { id, module: { plan: { userId: user.id } } },
    select: { id: true },
  });
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const session = await db.planSession.update({ where: { id }, data: parsed.data });
  return NextResponse.json(session);
}
