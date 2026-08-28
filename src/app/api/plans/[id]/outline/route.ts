import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { dispatchPlanGeneration } from "@/lib/plan/dispatch";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const plan = await db.learningPlan.findFirst({ where: { id, userId: user.id }, select: { id: true } });
  if (!plan) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const { job, mode } = await dispatchPlanGeneration({ kind: "plan-outline", planId: id });
    return NextResponse.json({ jobId: job.id, status: job.status, mode });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
