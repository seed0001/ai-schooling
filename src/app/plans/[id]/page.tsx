import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { parsePlanShape, parseSegments } from "@/lib/types";
import { TRACK_LABELS, TRACK_THEME } from "@/lib/plan/tracks";
import { TrackIcon, Blobs, EmptyArt } from "@/components/graphics";
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

  const theme = TRACK_THEME[plan.track];
  const shape = parsePlanShape(plan.shape);
  const totalSessions = plan.modules.reduce((n, m) => n + m.estSessions, 0);

  return (
    <main className="space-y-8">
      <section className="card relative isolate overflow-hidden p-6">
        <Blobs />
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <Link href="/" className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-300">
              ← All plans
            </Link>
            <div className="flex items-center gap-3">
              <span className={`grid h-11 w-11 place-items-center rounded-xl border ${theme.chip}`}>
                <TrackIcon track={plan.track} className="h-6 w-6" />
              </span>
              <h1 className="font-display text-2xl font-bold tracking-tight">{plan.title}</h1>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className={`badge ${theme.chip}`}>{TRACK_LABELS[plan.track]}</span>
              <span className="badge border-neutral-200 bg-white/60 text-neutral-600 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300">
                {plan.topic}
              </span>
              {plan.audience && (
                <span className="badge border-neutral-200 bg-white/60 text-neutral-600 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300">
                  {plan.audience}
                </span>
              )}
              {shape.pacing && (
                <span className="badge border-neutral-200 bg-white/60 text-neutral-600 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300">
                  {shape.pacing}
                </span>
              )}
              <span className="badge border-neutral-200 bg-white/60 text-neutral-600 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300">
                ~{shape.sessionLengthMin} min/session
              </span>
            </div>
          </div>
          <DeletePlanButton
            id={plan.id}
            title={plan.title}
            redirectTo="/"
            basePath="/api/plans"
            childrenLabel="its outline, modules, and sessions"
          />
        </div>
        <p className="mt-4 max-w-2xl text-sm">
          <span className="font-semibold">Goal: </span>
          {plan.goal}
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-display text-xl font-semibold">Outline</h2>
          {plan.modules.length > 0 && (
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
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
          <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
            <EmptyArt />
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              No outline yet. Generate one to get the module sequence, then drill into each module.
            </p>
          </div>
        ) : (
          <ol className="space-y-4">
            {plan.modules.map((module) => (
              <li key={module.id} className="card overflow-hidden p-5">
                <div className={`-mx-5 -mt-5 mb-4 h-1 bg-gradient-to-r ${theme.glow} to-transparent`} />
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">
                      <span className={theme.text}>Module {module.order}</span> · {module.title}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">~{module.estSessions} sessions</p>
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
                  <div className="mt-3 text-sm">
                    <span className="font-medium">By the end:</span>
                    <ul className="mt-1 space-y-1">
                      {module.outcomes.map((o, i) => (
                        <li key={i} className="flex gap-2 text-neutral-600 dark:text-neutral-400">
                          <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${theme.dot}`} />
                          {o}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {module.sessions.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {module.sessions.map((session) => {
                      const segments = parseSegments(session.segments);
                      return (
                        <details
                          key={session.id}
                          className="surface group p-3 text-sm [&_summary::-webkit-details-marker]:hidden"
                        >
                          <summary className="flex cursor-pointer items-center gap-2 font-medium">
                            <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md text-xs text-white ${theme.dot}`}>
                              {session.order}
                            </span>
                            {session.title}
                            <span className="ml-auto text-xs font-normal text-neutral-400">
                              {session.estMinutes} min
                            </span>
                          </summary>
                          <dl className="mt-3 space-y-2 border-t border-neutral-200/70 pt-3 text-xs dark:border-white/10">
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
    <div className="grid grid-cols-[8rem_1fr] gap-3">
      <dt className="font-semibold text-neutral-500 dark:text-neutral-400">{k}</dt>
      <dd className="whitespace-pre-wrap">{v}</dd>
    </div>
  );
}
