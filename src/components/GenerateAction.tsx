"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { readJson } from "@/lib/http";

type Props = {
  endpoint: string;
  label: string;
  withNote?: boolean;
  variant?: "primary" | "secondary";
  /** Where to poll for job status. Defaults to the old-pipeline jobs route. */
  jobsPath?: string;
};

type DispatchResult = { jobId?: string; status?: string; mode?: string; error?: string };
type JobResult = { status?: string; progress?: number; total?: number; error?: string };

export function GenerateAction({
  endpoint,
  label,
  withNote,
  variant = "secondary",
  jobsPath = "/api/jobs",
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);

  async function run() {
    setBusy(true);
    setError(null);
    setProgress(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(withNote && note ? { note } : {}),
      });
      const data = await readJson<DispatchResult>(res);
      if (!res.ok || data.error) throw new Error(data.error ?? `Generation failed (${res.status})`);

      if (data.status === "FAILED") throw new Error(data.error ?? "Generation failed");
      if (data.status !== "DONE" && data.jobId) {
        await poll(data.jobId);
      }
      setNote("");
      setShowNote(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  async function poll(jobId: string) {
    // ~20 min ceiling; generating every lesson in a unit is many model calls.
    for (let i = 0; i < 600; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      let job: JobResult;
      try {
        const res = await fetch(`${jobsPath}/${jobId}`, { cache: "no-store" });
        job = await readJson<JobResult>(res);
      } catch {
        continue; // transient network / edge blip — keep polling
      }
      if (job.total && job.total > 1) setProgress(`${job.progress ?? 0}/${job.total}`);
      if (job.status === "DONE") return;
      if (job.status === "FAILED") throw new Error(job.error ?? "Generation job failed");
    }
    throw new Error("Timed out waiting for generation (still running server-side — refresh in a bit)");
  }

  const btn = `${variant === "primary" ? "btn-primary" : "btn-ghost"} !px-3 !py-1.5 text-xs`;

  return (
    <div className="inline-flex flex-col gap-1">
      <div className="flex items-center gap-2">
        {withNote && (
          <button
            type="button"
            onClick={() => setShowNote((s) => !s)}
            className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-300"
          >
            {showNote ? "hide note" : "add note"}
          </button>
        )}
        <button type="button" onClick={run} disabled={busy} className={btn}>
          {busy ? (progress ? `Generating ${progress}…` : "Generating…") : label}
        </button>
      </div>
      {withNote && showNote && (
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. less writing, more hands-on"
          className="input w-64 !py-1 text-xs"
        />
      )}
      {error && <p className="max-w-xs text-xs text-red-600">{error}</p>}
    </div>
  );
}
