"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { readJson } from "@/lib/http";

type Props = {
  endpoint: string;
  label: string;
  withNote?: boolean;
  variant?: "primary" | "secondary";
};

type DispatchResult = { jobId?: string; status?: string; mode?: string; error?: string };
type JobResult = { status?: string; progress?: number; total?: number; error?: string };

export function GenerateAction({ endpoint, label, withNote, variant = "secondary" }: Props) {
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
        const res = await fetch(`/api/jobs/${jobId}`, { cache: "no-store" });
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

  const btn =
    variant === "primary"
      ? "rounded-md bg-neutral-900 px-3 py-1.5 text-sm text-white hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
      : "rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-900";

  return (
    <div className="inline-flex flex-col gap-1">
      <div className="flex items-center gap-2">
        {withNote && (
          <button
            type="button"
            onClick={() => setShowNote((s) => !s)}
            className="text-xs text-neutral-500 underline"
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
          className="w-64 rounded-md border border-neutral-300 bg-transparent px-2 py-1 text-xs dark:border-neutral-700"
        />
      )}
      {error && <p className="max-w-xs text-xs text-red-600">{error}</p>}
    </div>
  );
}
