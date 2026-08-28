import type { PlanTrack } from "@prisma/client";

/** Small inline-SVG graphics. No external assets, theme-aware via currentColor. */

export function Logo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5f5df3" />
          <stop offset="0.5" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
      <rect x="1.5" y="1.5" width="29" height="29" rx="9" fill="url(#logo-g)" />
      <path
        d="M9 19.5 16 8l7 11.5M11.7 16h8.6"
        fill="none"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const TRACK_PATHS: Record<PlanTrack, React.ReactNode> = {
  TEACHING: (
    <>
      <circle cx="8" cy="9" r="3" />
      <circle cx="16" cy="7" r="3.2" />
      <circle cx="24" cy="9" r="3" />
      <path d="M3 25c0-4 2.5-6 5-6s5 2 5 6M11 25c0-5 2.5-7.5 5-7.5S21 20 21 25M19 25c0-4 2.5-6 5-6s5 2 5 6" />
    </>
  ),
  COACHING: (
    <>
      <circle cx="10" cy="8" r="3.4" />
      <circle cx="22" cy="8" r="3.4" />
      <path d="M4 25c0-4.5 2.7-7 6-7s6 2.5 6 7M16 25c0-4.5 2.7-7 6-7s6 2.5 6 7" />
      <path d="M13 15.5 19 15.5" />
    </>
  ),
  SELF_DIRECTED: (
    <>
      <circle cx="16" cy="8" r="3.4" />
      <path d="M8 26c0-5 3.6-8 8-8s8 3 8 8" />
      <path d="M25 4.5 26 8l3.3 1-3.3 1-1 3.4-1-3.4-3.3-1 3.3-1z" />
    </>
  ),
  COURSE: (
    <>
      <path d="M16 4 29 10 16 16 3 10z" />
      <path d="M6 13.5V20c0 2.5 4.5 4.5 10 4.5S26 22.5 26 20v-6.5" />
      <path d="M29 10v7" />
    </>
  ),
};

export function TrackIcon({
  track,
  className = "h-6 w-6",
}: {
  track: PlanTrack;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {TRACK_PATHS[track]}
    </svg>
  );
}

/** Floating gradient blobs for page/section headers. Purely decorative. */
export function Blobs({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}
      aria-hidden
    >
      <div className="animate-float absolute -left-10 -top-16 h-52 w-52 rounded-full bg-brand-400/30 blur-3xl" />
      <div className="animate-float absolute right-0 -top-10 h-44 w-44 rounded-full bg-selfdirected/25 blur-3xl [animation-delay:-3s]" />
      <div className="animate-float absolute left-1/3 top-4 h-40 w-40 rounded-full bg-teaching/20 blur-3xl [animation-delay:-6s]" />
    </div>
  );
}

/** Simple line-art for empty states. */
export function EmptyArt({ className = "h-24 w-24" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden>
      <defs>
        <linearGradient id="empty-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7d87fb" />
          <stop offset="1" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
      <rect x="10" y="14" width="44" height="36" rx="6" stroke="url(#empty-g)" strokeWidth="2.5" />
      <path d="M20 26h24M20 34h18M20 42h12" stroke="url(#empty-g)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="47" cy="47" r="10" fill="#f7f7fb" className="dark:fill-[#0b0b14]" />
      <path
        d="M43 47h8M47 43v8"
        stroke="url(#empty-g)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
