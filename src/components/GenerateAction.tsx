"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  endpoint: string;
  label: string;
  withNote?: boolean;
  variant?: "primary" | "secondary";
};

export function GenerateAction({ endpoint, label, withNote, variant = "secondary" }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(withNote && note ? { note } : {}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");

      if (data.mode === "queue" && data.jobId) {
        await poll(data.jobId);
      }
      setNote("");
      setShowNote(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function poll(jobId: string) {
    for (let i = 0; i < 240; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const res = await fetch(`/api/jobs/${jobId}`);
      if (!res.ok) continue;
      const job = await res.json();
      if (job.status === "DONE") return;
      if (job.status === "FAILED") throw new Error(job.error ?? "Job failed");
    }
    throw new Error("Timed out waiting for generation");
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
          {busy ? "Generating…" : label}
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
