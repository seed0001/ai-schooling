import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { parseCalendar, parsePreferences } from "@/lib/types";
import Link from "next/link";
import { GenerateAction } from "@/components/GenerateAction";
import { ApproveOutlineToggle } from "@/components/ApproveOutlineToggle";
import { DeletePlanButton } from "@/components/DeletePlanButton";

export const dynamic = "force-dynamic";

export default async function CurriculumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const curriculum = await db.curriculum.findFirst({
    where: { id, userId: user.id },
    include: {
      units: {
        orderBy: { order: "asc" },
        include: {
          weeks: {
            orderBy: { order: "asc" },
            include: { lessons: { orderBy: { order: "asc" } } },
          },
        },
      },
    },
  });
  if (!curriculum) notFound();

  const prefs = parsePreferences(curriculum.preferences);
  const cal = parseCalendar(curriculum.calendar);
  const totalWeeks = curriculum.units.reduce((n, u) => n + u.estWeeks, 0);

  return (
    <main className="space-y-8">
      <section className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link href="/curricula" className="text-xs text-neutral-500 underline">
              ← All curricula
            </Link>
            <h1 className="text-2xl font-semibold">{curriculum.title}</h1>
          </div>
          <DeletePlanButton id={curriculum.id} title={curriculum.title} redirectTo="/curricula" />
        </div>
        <p className="text-sm text-neutral-500">
          {curriculum.subject} · {curriculum.gradeLevel} · {prefs.approach} · ~{prefs.minutesPerDay} min/lesson ·{" "}
          {cal.daysPerWeek} days/week · {cal.weeksOfInstruction} weeks
        </p>
        <p className="max-w-2xl text-sm">{curriculum.learnerProfile}</p>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-semibold">Year outline</h2>
          {curriculum.units.length > 0 && (
            <span className="text-sm text-neutral-500">
              {curriculum.units.length} units · ~{totalWeeks} weeks planned
            </span>
          )}
          {curriculum.outlineStatus !== "APPROVED" && (
            <GenerateAction
              endpoint={`/api/curricula/${curriculum.id}/outline`}
              label={curriculum.units.length ? "Regenerate outline" : "Generate outline"}
              variant="primary"
            />
          )}
          {curriculum.units.length > 0 && (
            <ApproveOutlineToggle id={curriculum.id} approved={curriculum.outlineStatus === "APPROVED"} />
          )}
        </div>

        {curriculum.units.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No outline yet. Generate one to get the full-year unit sequence, then drill into each unit.
          </p>
        ) : (
          <ol className="space-y-4">
            {curriculum.units.map((unit) => (
              <li
                key={unit.id}
                className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">
                      Unit {unit.order}: {unit.title}
                    </h3>
                    <p className="text-xs text-neutral-500">~{unit.estWeeks} weeks</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <GenerateAction
                      endpoint={`/api/units/${unit.id}/weeks`}
                      label={unit.weeksGenerated ? "Regenerate weeks" : "Break into weeks"}
                      withNote
                    />
                    <GenerateAction
                      endpoint={`/api/units/${unit.id}/generate-all`}
                      label="Generate whole unit"
                      variant="primary"
                    />
                  </div>
                </div>

                <p className="mt-2 text-sm">{unit.summary}</p>
                <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <span className="font-medium">Big ideas:</span>
                    <ul className="list-disc pl-5 text-neutral-600 dark:text-neutral-400">
                      {unit.bigIdeas.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="font-medium">Essential questions:</span>
                    <ul className="list-disc pl-5 text-neutral-600 dark:text-neutral-400">
                      {unit.essentialQuestions.map((q, i) => (
                        <li key={i}>{q}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {unit.weeks.length > 0 && (
                  <ol className="mt-4 space-y-3 border-l-2 border-neutral-200 pl-4 dark:border-neutral-800">
                    {unit.weeks.map((week) => (
                      <li key={week.id}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="text-sm font-semibold">
                            Week {week.order}: {week.focus}
                          </h4>
                          <GenerateAction
                            endpoint={`/api/weeks/${week.id}/lessons`}
                            label={week.lessonsGenerated ? "Regenerate lessons" : "Generate lessons"}
                            withNote
                          />
                        </div>
                        <ul className="mt-1 list-disc pl-5 text-xs text-neutral-600 dark:text-neutral-400">
                          {week.objectives.map((o, i) => (
                            <li key={i}>{o}</li>
                          ))}
                        </ul>

                        {week.lessons.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {week.lessons.map((lesson) => (
                              <details
                                key={lesson.id}
                                className="rounded-md border border-neutral-200 p-2 text-sm dark:border-neutral-800"
                              >
                                <summary className="cursor-pointer font-medium">
                                  Day {lesson.order}: {lesson.title}{" "}
                                  <span className="text-xs font-normal text-neutral-500">
                                    ({lesson.timeEstimateMin} min)
                                  </span>
                                </summary>
                                <dl className="mt-2 space-y-1 text-xs">
                                  <Row k="Objective" v={lesson.objective} />
                                  <Row k="Materials" v={lesson.materials.join(", ") || "—"} />
                                  <Row k="Hook" v={lesson.hook} />
                                  <Row k="Instruction" v={lesson.instruction} />
                                  <Row k="Practice" v={lesson.practice} />
                                  <Row k="Assessment" v={lesson.assessment} />
                                  <Row k="Differentiation" v={lesson.differentiation} />
                                  {lesson.homework && <Row k="Homework" v={lesson.homework} />}
                                </dl>
                              </details>
                            ))}
                          </div>
                        )}
                      </li>
                    ))}
                  </ol>
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
    <div className="grid grid-cols-[7rem_1fr] gap-2">
      <dt className="font-medium text-neutral-500">{k}</dt>
      <dd className="whitespace-pre-wrap">{v}</dd>
    </div>
  );
}
