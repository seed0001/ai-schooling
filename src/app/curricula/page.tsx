import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { DeletePlanButton } from "@/components/DeletePlanButton";

export const dynamic = "force-dynamic";

export default async function CurriculaPage() {
  const user = await getCurrentUser();
  const curricula = await db.curriculum.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { units: true } } },
  });

  return (
    <main className="space-y-4">
      <Link href="/" className="text-xs text-neutral-500 underline">
        ← Start
      </Link>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Year-long curricula</h1>
        <Link
          href="/curriculum/new"
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900"
        >
          New curriculum
        </Link>
      </div>

      {curricula.length === 0 ? (
        <p className="text-neutral-500">
          No curricula yet.{" "}
          <Link href="/curriculum/new" className="underline">
            Start one
          </Link>
          .
        </p>
      ) : (
        <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
          {curricula.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-900">
              <Link href={`/curriculum/${c.id}`} className="min-w-0 flex-1">
                <div className="truncate font-medium">{c.title}</div>
                <div className="text-sm text-neutral-500">
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
