import Link from "next/link";
import { redirect } from "next/navigation";
import { isTrack, TRACK_LABELS, TRACK_TAGLINES, TRACK_THEME } from "@/lib/plan/tracks";
import { TrackIcon, Blobs } from "@/components/graphics";
import { NewPlanForm } from "./NewPlanForm";

export default async function NewPlanPage({
  searchParams,
}: {
  searchParams: Promise<{ track?: string }>;
}) {
  const { track } = await searchParams;
  if (!isTrack(track)) redirect("/");

  const theme = TRACK_THEME[track];

  return (
    <main className="space-y-6">
      <section className="card relative isolate overflow-hidden p-6">
        <Blobs />
        <Link href="/" className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-300">
          ← Start over
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <span className={`grid h-11 w-11 place-items-center rounded-xl border ${theme.chip}`}>
            <TrackIcon track={track} className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">{TRACK_LABELS[track]}</h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{TRACK_TAGLINES[track]}</p>
          </div>
        </div>
      </section>
      <NewPlanForm track={track} />
    </main>
  );
}
