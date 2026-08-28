import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { parsePlanShape, parseSegments } from "@/lib/types";
import { TRACK_LABELS } from "@/lib/plan/tracks";
import { GenerateAction } from "@/components/GenerateAction";
import { ApproveOutlineToggle } from "@/components/ApproveOutlineToggle";
import { DeletePlanButton } from "@/components/DeletePlanButton";

export const dynamic = "force-dynamic";

export default async function PlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const plan = await db.learningPlan.findFirst({
    where: { id, userId: user.id },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: { sessions: { orderBy: { order: "asc" } } },
      },
    },
  });
  if (!plan) notFound();

  const shape = parsePlanShape(plan.shape);
  const totalSessions = plan.modules.reduce((n, m) => n + m.estSessions, 0);

  return (
    <main className="space-y-8">
      <section className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link href="/" className="text-xs text-neutral-500 underline">
              ← Start
            </Link>
            <h1 className="text-2xl font-semibold">{plan.title}</h1>
          </div>
          <DeletePlanButton
            id={plan.id}
            title={plan.title}
            redirectTo="/"
            basePath="/api/plans"
            childrenLabel="its outline, modules, and sessions"
          />
        </div>
        <p className="text-sm text-neutral-500">
          {TRACK_LABELS[plan.track]} · {plan.topic}
          {plan.audience ? ` · ${plan.audience}` : ""}
          {shape.pacing ? ` · ${shape.pacing}` : ""} · ~{shape.sessionLengthMin} min/session
        </p>
        <p className="max-w-2xl text-sm">
          <span className="font-medium">Goal: </span>
          {plan.goal}
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-semibold">Outline</h2>
          {plan.modules.length > 0 && (
            <span className="text-sm text-neutral-500">
              {plan.modules.length} modules · ~{totalSessions} sessions planned
            </span>
          )}
          {plan.outlineStatus !== "APPROVED" && (
            <GenerateAction
              endpoint={`/api/plans/${plan.id}/outline`}
              jobsPath="/api/plan-jobs"
              label={plan.modules.length ? "Regenerate outline" : "Generate outline"}
              variant="primary"
            />
          )}
          {plan.modules.length > 0 && (
            <ApproveOutlineToggle
              id={plan.id}
              approved={plan.outlineStatus === "APPROVED"}
              endpoint={`/api/plans/${plan.id}/approve-outline`}
            />
          )}
        </div>

        {plan.modules.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No outline yet. Generate one to get the module sequence, then drill into each module.
          </p>
        ) : (
          <ol className="space-y-4">
            {plan.modules.map((module) => (
              <li key={module.id} className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">
                      Module {module.order}: {module.title}
                    </h3>
                    <p className="text-xs text-neutral-500">~{module.estSessions} sessions</p>
                  </div>
                  <GenerateAction
                    endpoint={`/api/plan-modules/${module.id}/sessions`}
                    jobsPath="/api/plan-jobs"
                    label={module.sessionsGenerated ? "Regenerate sessions" : "Generate sessions"}
                    variant="primary"
                    withNote
                  />
                </div>

                <p className="mt-2 text-sm">{module.summary}</p>
                {module.outcomes.length > 0 && (
                  <div className="mt-2 text-sm">
                    <span className="font-medium">By the end:</span>
                    <ul className="list-disc pl-5 text-neutral-600 dark:text-neutral-400">
                      {module.outcomes.map((o, i) => (
                        <li key={i}>{o}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {module.sessions.length > 0 && (
                  <div className="mt-4 space-y-2 border-l-2 border-neutral-200 pl-4 dark:border-neutral-800">
                    {module.sessions.map((session) => {
                      const segments = parseSegments(session.segments);
                      return (
                        <details
                          key={session.id}
                          className="rounded-md border border-neutral-200 p-2 text-sm dark:border-neutral-800"
                        >
                          <summary className="cursor-pointer font-medium">
                            Session {session.order}: {session.title}{" "}
                            <span className="text-xs font-normal text-neutral-500">
                              ({session.estMinutes} min)
                            </span>
                          </summary>
                          <dl className="mt-2 space-y-1 text-xs">
                            <Row k="Objective" v={session.objective} />
                            {segments.map((s, i) => (
                              <Row key={i} k={s.heading} v={s.body} />
                            ))}
                          </dl>
                        </details>
                      );
                    })}
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-2">
      <dt className="font-medium text-neutral-500">{k}</dt>
      <dd className="whitespace-pre-wrap">{v}</dd>
    </div>
  );
}
