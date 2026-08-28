import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { DeletePlanButton } from "@/components/DeletePlanButton";
import { TRACK_LABELS } from "@/lib/plan/tracks";

export const dynamic = "force-dynamic";

const TRACKS = [
  {
    track: "TEACHING",
    title: "Teaching a group",
    blurb: "A class, cohort, workshop, or session series you'll lead.",
  },
  {
    track: "COACHING",
    title: "Coaching one learner",
    blurb: "Tutor, mentor, parent, or trainer working one-on-one.",
  },
  {
    track: "SELF_DIRECTED",
    title: "Learning it myself",
    blurb: "Plan your own learning. You're the learner — no teacher needed.",
  },
  {
    track: "COURSE",
    title: "Building a course",
    blurb: "Design training for other people to deliver, or for an organization.",
  },
] as const;

export default async function StartPage() {
  const user = await getCurrentUser();
  const plans = await db.learningPlan.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { modules: true } } },
  });

  return (
    <main className="space-y-10">
      <section className="space-y-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">What are you planning?</h1>
          <p className="text-sm text-neutral-500">
            Pick the closest fit. It only sets the starting tone — every field stays yours to change.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {TRACKS.map((t) => (
            <Link
              key={t.track}
              href={`/plans/new?track=${t.track}`}
              className="rounded-lg border border-neutral-200 p-4 transition hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:border-neutral-600 dark:hover:bg-neutral-900"
            >
              <div className="font-semibold">{t.title}</div>
              <p className="mt-1 text-sm text-neutral-500">{t.blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      {plans.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Your plans</h2>
          <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
            {plans.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-900"
              >
                <Link href={`/plans/${p.id}`} className="min-w-0 flex-1">
                  <div className="truncate font-medium">{p.title}</div>
                  <div className="text-sm text-neutral-500">
                    {TRACK_LABELS[p.track]} · {p.topic}
                    {p.audience ? ` · ${p.audience}` : ""} · {p._count.modules} modules ·{" "}
                    {p.outlineStatus === "APPROVED" ? "outline approved" : "draft"}
                  </div>
                </Link>
                <DeletePlanButton
                  id={p.id}
                  title={p.title}
                  basePath="/api/plans"
                  childrenLabel="its outline, modules, and sessions"
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="border-t border-neutral-200 pt-4 text-sm text-neutral-500 dark:border-neutral-800">
        Looking for the year-long, grade-based curriculum planner?{" "}
        <Link href="/curricula" className="underline">
          Open it here →
        </Link>
      </section>
    </main>
  );
}
