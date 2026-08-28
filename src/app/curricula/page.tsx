import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { DeletePlanButton } from "@/components/DeletePlanButton";
import { EmptyArt } from "@/components/graphics";

export const dynamic = "force-dynamic";

export default async function CurriculaPage() {
  const user = await getCurrentUser();
  const curricula = await db.curriculum.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { units: true } } },
  });

  return (
    <main className="space-y-5">
      <Link href="/" className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-300">
        ← Start
      </Link>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Year-long curricula</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            The original grade-based, school-year planner.
          </p>
        </div>
        <Link href="/curriculum/new" className="btn-ghost">
          + New curriculum
        </Link>
      </div>

      {curricula.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
          <EmptyArt />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No curricula yet.{" "}
            <Link href="/curriculum/new" className="font-medium text-brand-600 hover:underline dark:text-brand-300">
              Start one
            </Link>
            .
          </p>
        </div>
      ) : (
        <ul className="card divide-y divide-neutral-200/70 overflow-hidden dark:divide-white/10">
          {curricula.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-brand-50/60 dark:hover:bg-white/5"
            >
              <Link href={`/curriculum/${c.id}`} className="min-w-0 flex-1">
                <div className="truncate font-medium">{c.title}</div>
                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                  {c.subject} · {c.gradeLevel} · {c._count.units} units ·{" "}
                  {c.outlineStatus === "APPROVED" ? "outline approved" : "draft"}
                </div>
              </Link>
              <DeletePlanButton id={c.id} title={c.title} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
