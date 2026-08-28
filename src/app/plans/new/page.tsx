import Link from "next/link";
import { redirect } from "next/navigation";
import { isTrack, TRACK_LABELS, TRACK_TAGLINES } from "@/lib/plan/tracks";
import { NewPlanForm } from "./NewPlanForm";

export default async function NewPlanPage({
  searchParams,
}: {
  searchParams: Promise<{ track?: string }>;
}) {
  const { track } = await searchParams;
  if (!isTrack(track)) redirect("/");

  return (
    <main className="space-y-6">
      <div className="space-y-1">
        <Link href="/" className="text-xs text-neutral-500 underline">
          ← Start over
        </Link>
        <h1 className="text-2xl font-semibold">{TRACK_LABELS[track]}</h1>
        <p className="text-sm text-neutral-500">{TRACK_TAGLINES[track]}</p>
      </div>
      <NewPlanForm track={track} />
    </main>
  );
}
