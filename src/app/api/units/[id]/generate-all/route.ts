import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { dispatchGeneration } from "@/lib/generation/dispatch";

/** Generate weeks (if missing) and every daily lesson for the whole unit. */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const unit = await db.unit.findFirst({
    where: { id, curriculum: { userId: user.id } },
    select: { curriculumId: true },
  });
  if (!unit) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const { job, mode } = await dispatchGeneration({
      kind: "unit-all-lessons",
      curriculumId: unit.curriculumId,
      unitId: id,
    });
    return NextResponse.json({ jobId: job.id, status: job.status, mode });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
