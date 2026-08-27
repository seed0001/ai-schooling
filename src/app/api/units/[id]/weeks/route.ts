import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { dispatchGeneration } from "@/lib/generation/dispatch";

const Body = z.object({ note: z.string().max(500).optional() });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const unit = await db.unit.findFirst({
    where: { id, curriculum: { userId: user.id } },
    select: { curriculumId: true },
  });
  if (!unit) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = Body.safeParse(await req.json().catch(() => ({})));
  const note = body.success ? body.data.note : undefined;

  try {
    const { job, mode } = await dispatchGeneration({
      kind: "unit-weeks",
      curriculumId: unit.curriculumId,
      unitId: id,
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
