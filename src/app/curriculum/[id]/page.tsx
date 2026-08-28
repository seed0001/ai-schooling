import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { parseCalendar, parsePreferences } from "@/lib/types";
import Link from "next/link";
import { GenerateAction } from "@/components/GenerateAction";
import { ApproveOutlineToggle } from "@/components/ApproveOutlineToggle";
import { DeletePlanButton } from "@/components/DeletePlanButton";
import { EmptyArt } from "@/components/graphics";

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
      <section className="card space-y-3 p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link href="/curricula" className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-300">
              ← All curricula
            </Link>
            <h1 className="font-display text-2xl font-bold tracking-tight">{curriculum.title}</h1>
          </div>
          <DeletePlanButton id={curriculum.id} title={curriculum.title} redirectTo="/curricula" />
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            curriculum.subject,
            curriculum.gradeLevel,
            prefs.approach,
            `~${prefs.minutesPerDay} min/lesson`,
            `${cal.daysPerWeek} days/week`,
            `${cal.weeksOfInstruction} weeks`,
          ].map((chip) => (
            <span
              key={chip}
              className="badge border-neutral-200 bg-white/60 text-neutral-600 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300"
            >
              {chip}
            </span>
          ))}
        </div>
        <p className="max-w-2xl text-sm">{curriculum.learnerProfile}</p>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-display text-xl font-semibold">Year outline</h2>
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
          <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
            <EmptyArt />
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              No outline yet. Generate one to get the full-year unit sequence, then drill into each unit.
            </p>
          </div>
        ) : (
          <ol className="space-y-4">
            {curriculum.units.map((unit) => (
              <li key={unit.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">
                      <span className="text-brand-600 dark:text-brand-300">Unit {unit.order}</span> · {unit.title}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">~{unit.estWeeks} weeks</p>
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
                  <ol className="mt-4 space-y-3 border-l-2 border-brand-200 pl-4 dark:border-brand-500/30">
                    {unit.weeks.map((week) => (
                      <li key={week.id}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="text-sm font-semibold">
                            <span className="text-brand-600 dark:text-brand-300">Week {week.order}</span> · {week.focus}
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
                                className="surface p-3 text-sm [&_summary::-webkit-details-marker]:hidden"
                              >
                                <summary className="flex cursor-pointer items-center gap-2 font-medium">
                                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-brand-500 text-xs text-white">
                                    {lesson.order}
                                  </span>
                                  {lesson.title}
                                  <span className="ml-auto text-xs font-normal text-neutral-400">
                                    {lesson.timeEstimateMin} min
                                  </span>
                                </summary>
                                <dl className="mt-3 space-y-2 border-t border-neutral-200/70 pt-3 text-xs dark:border-white/10">
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
    <div className="grid grid-cols-[7rem_1fr] gap-3">
      <dt className="font-semibold text-neutral-500 dark:text-neutral-400">{k}</dt>
      <dd className="whitespace-pre-wrap">{v}</dd>
    </div>
  );
}
