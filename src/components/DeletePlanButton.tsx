"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { readJson } from "@/lib/http";

type Props = {
  id: string;
  title: string;
  /** Where to go after deleting from a detail page. Omit to just refresh the list. */
  redirectTo?: string;
  className?: string;
  /** API collection path. Defaults to the old curriculum pipeline. */
  basePath?: string;
  /** What gets removed, for the confirm prompt. */
  childrenLabel?: string;
};

export function DeletePlanButton({
  id,
  title,
  redirectTo,
  className,
  basePath = "/api/curricula",
  childrenLabel = "its outline, units, weeks, and lessons",
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    if (!window.confirm(`Delete "${title}"? This removes ${childrenLabel}. This cannot be undone.`)) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${basePath}/${id}`, { method: "DELETE" });
      const data = await readJson<{ ok?: boolean; error?: string }>(res);
      if (!res.ok || data.error) throw new Error(data.error ?? `Delete failed (${res.status})`);
      if (redirectTo) router.push(redirectTo);
      else router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={onDelete}
        disabled={busy}
        className={className ?? "btn-danger !px-2.5 !py-1 text-xs"}
      >
        {busy ? "Deleting…" : "Delete"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </span>
  );
}
