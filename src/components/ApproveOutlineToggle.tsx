"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ApproveOutlineToggle({
  id,
  approved,
  endpoint,
}: {
  id: string;
  approved: boolean;
  /** POST target. Defaults to the old curriculum pipeline. */
  endpoint?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    await fetch(endpoint ?? `/api/curricula/${id}/approve-outline`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ approved: !approved }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-900"
    >
      {approved ? "Unlock outline (back to draft)" : "Approve outline"}
    </button>
  );
}
