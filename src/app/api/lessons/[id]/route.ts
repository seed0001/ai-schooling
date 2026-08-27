import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const Body = z.object({
  title: z.string().min(3).optional(),
  objective: z.string().min(5).optional(),
  materials: z.array(z.string()).optional(),
  hook: z.string().optional(),
  instruction: z.string().optional(),
  practice: z.string().optional(),
  assessment: z.string().optional(),
  differentiation: z.string().optional(),
  homework: z.string().nullable().optional(),
  timeEstimateMin: z.number().int().min(10).max(180).optional(),
  status: z.enum(["DRAFT", "APPROVED"]).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const owned = await db.lesson.findFirst({
    where: { id, week: { unit: { curriculum: { userId: user.id } } } },
    select: { id: true },
  });
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const lesson = await db.lesson.update({ where: { id }, data: parsed.data });
  return NextResponse.json(lesson);
}
