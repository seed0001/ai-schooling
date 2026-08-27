import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  const curricula = await db.curriculum.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { units: true } } },
  });

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-semibold">Your plans</h1>

      {curricula.length === 0 ? (
        <p className="text-neutral-500">
          No plans yet.{" "}
          <Link href="/curriculum/new" className="underline">
            Start one
          </Link>
          .
        </p>
      ) : (
        <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
          {curricula.map((c) => (
            <li key={c.id}>
              <Link
                href={`/curriculum/${c.id}`}
                className="block px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-900"
              >
                <div className="font-medium">{c.title}</div>
                <div className="text-sm text-neutral-500">
                  {c.subject} · {c.gradeLevel} · {c._count.units} units ·{" "}
                  {c.outlineStatus === "APPROVED" ? "outline approved" : "draft"}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
