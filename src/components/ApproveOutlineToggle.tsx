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
      className={`${approved ? "btn-ghost" : "btn border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"} !py-1.5 text-xs`}
    >
      {approved ? "✓ Approved — unlock" : "Approve outline"}
    </button>
  );
}
