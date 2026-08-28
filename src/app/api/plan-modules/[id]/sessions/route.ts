import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { dispatchPlanGeneration } from "@/lib/plan/dispatch";

const Body = z.object({ note: z.string().max(500).optional() });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const module = await db.planModule.findFirst({
    where: { id, plan: { userId: user.id } },
    select: { planId: true },
  });
  if (!module) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = Body.safeParse(await req.json().catch(() => ({})));
  const note = body.success ? body.data.note : undefined;

  try {
    const { job, mode } = await dispatchPlanGeneration({
      kind: "plan-module-sessions",
      planId: module.planId,
      moduleId: id,
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
