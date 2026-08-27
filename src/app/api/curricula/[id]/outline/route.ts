import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { dispatchGeneration } from "@/lib/generation/dispatch";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const curriculum = await db.curriculum.findFirst({ where: { id, userId: user.id } });
  if (!curriculum) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const { job, mode } = await dispatchGeneration({ kind: "outline", curriculumId: id });
    return NextResponse.json({ jobId: job.id, status: job.status, mode });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
