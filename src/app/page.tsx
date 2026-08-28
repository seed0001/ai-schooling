import Link from "next/link";
import type { PlanTrack } from "@prisma/client";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { DeletePlanButton } from "@/components/DeletePlanButton";
import { Blobs, TrackIcon, EmptyArt } from "@/components/graphics";
import { TRACK_LABELS, TRACK_THEME } from "@/lib/plan/tracks";

export const dynamic = "force-dynamic";

const TRACKS: { track: PlanTrack; title: string; blurb: string }[] = [
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
];

export default async function StartPage() {
  const user = await getCurrentUser();
  const plans = await db.learningPlan.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { modules: true } } },
  });

  return (
    <main className="space-y-12">
      <section className="relative isolate">
        <Blobs />
        <div className="space-y-2 py-4">
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Plan any kind of{" "}
            <span className="bg-brand-sheen bg-clip-text text-transparent">teaching or learning</span>.
          </h1>
          <p className="max-w-xl text-sm text-neutral-500 dark:text-neutral-400">
            Pick the closest fit below. It only sets the starting tone — every field stays yours
            to change, and there's no grade level boxing you in.
          </p>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {TRACKS.map((t, i) => {
            const theme = TRACK_THEME[t.track];
            return (
              <Link
                key={t.track}
                href={`/plans/new?track=${t.track}`}
                style={{ animationDelay: `${i * 60}ms` }}
                className={`card group animate-fade-up relative overflow-hidden p-5 ring-1 ring-transparent transition hover:-translate-y-0.5 hover:shadow-md ${theme.ring}`}
              >
                <div
                  className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${theme.glow} to-transparent blur-xl`}
                />
                <div className={`inline-flex rounded-xl border p-2.5 ${theme.chip}`}>
                  <TrackIcon track={t.track} className="h-6 w-6" />
                </div>
                <div className="mt-3 font-semibold">{t.title}</div>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{t.blurb}</p>
                <span
                  className={`mt-3 inline-flex items-center gap-1 text-sm font-medium ${theme.text} opacity-0 transition group-hover:opacity-100`}
                >
                  Start here →
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {plans.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold">Your plans</h2>
          <ul className="card divide-y divide-neutral-200/70 overflow-hidden dark:divide-white/10">
            {plans.map((p) => {
              const theme = TRACK_THEME[p.track];
              return (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-brand-50/60 dark:hover:bg-white/5"
                >
                  <Link href={`/plans/${p.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border ${theme.chip}`}>
                      <TrackIcon track={p.track} className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{p.title}</span>
                      <span className="block truncate text-sm text-neutral-500 dark:text-neutral-400">
                        {TRACK_LABELS[p.track]} · {p.topic}
                        {p.audience ? ` · ${p.audience}` : ""} · {p._count.modules} modules ·{" "}
                        {p.outlineStatus === "APPROVED" ? "outline approved" : "draft"}
                      </span>
                    </span>
                  </Link>
                  <DeletePlanButton
                    id={p.id}
                    title={p.title}
                    basePath="/api/plans"
                    childrenLabel="its outline, modules, and sessions"
                  />
                </li>
              );
            })}
          </ul>
        </section>
      ) : (
        <section className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
          <EmptyArt />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No plans yet. Pick a starting point above to make your first one.
          </p>
        </section>
      )}

      <section className="surface flex items-center justify-between gap-3 px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400">
        <span>Need the year-long, grade-based curriculum planner?</span>
        <Link href="/curricula" className="font-medium text-brand-600 hover:underline dark:text-brand-300">
          Open it →
        </Link>
      </section>
    </main>
  );
}
