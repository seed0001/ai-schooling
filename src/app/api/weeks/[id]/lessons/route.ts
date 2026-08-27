import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { dispatchGeneration } from "@/lib/generation/dispatch";

const Body = z.object({ note: z.string().max(500).optional() });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const week = await db.week.findFirst({
    where: { id, unit: { curriculum: { userId: user.id } } },
    select: { unit: { select: { curriculumId: true } } },
  });
  if (!week) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = Body.safeParse(await req.json().catch(() => ({})));
  const note = body.success ? body.data.note : undefined;

  try {
    const { job, mode } = await dispatchGeneration({
      kind: "week-lessons",
      curriculumId: week.unit.curriculumId,
      weekId: id,
      note,
    });
    return NextResponse.json({ jobId: job.id, status: job.status, mode });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
