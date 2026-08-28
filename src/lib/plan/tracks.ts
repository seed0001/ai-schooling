import type { PlanTrack } from "@prisma/client";

/** Shared, UI-safe (no server deps) descriptions of each planning track. */

export const TRACK_VALUES = ["TEACHING", "COACHING", "SELF_DIRECTED", "COURSE"] as const;

export const TRACK_LABELS: Record<PlanTrack, string> = {
  TEACHING: "Teaching a group",
  COACHING: "Coaching one learner",
  SELF_DIRECTED: "Learning it myself",
  COURSE: "Building a course",
};

export const TRACK_TAGLINES: Record<PlanTrack, string> = {
  TEACHING: "A class, cohort, workshop, or session series you lead.",
  COACHING: "One-on-one: tutor, mentor, parent, or trainer.",
  SELF_DIRECTED: "Your own learning — you are the learner, no teacher.",
  COURSE: "Training for others to deliver, or for an organization.",
};

export function isTrack(v: string | null | undefined): v is PlanTrack {
  return !!v && (TRACK_VALUES as readonly string[]).includes(v);
}

/**
 * Per-track UI theming. `text`/`ring`/`chipBg` are Tailwind classes; kept here
 * so the splash cards, plan header, and list rows all pull the same hue.
 */
export const TRACK_THEME: Record<
  PlanTrack,
  { text: string; ring: string; chip: string; glow: string; dot: string }
> = {
  TEACHING: {
    text: "text-teaching",
    ring: "hover:border-teaching/60 hover:ring-teaching/20",
    chip: "border-teaching/30 bg-teaching/10 text-teaching",
    glow: "from-teaching/20",
    dot: "bg-teaching",
  },
  COACHING: {
    text: "text-coaching",
    ring: "hover:border-coaching/60 hover:ring-coaching/20",
    chip: "border-coaching/30 bg-coaching/10 text-coaching",
    glow: "from-coaching/20",
    dot: "bg-coaching",
  },
  SELF_DIRECTED: {
    text: "text-selfdirected",
    ring: "hover:border-selfdirected/60 hover:ring-selfdirected/20",
    chip: "border-selfdirected/30 bg-selfdirected/10 text-selfdirected",
    glow: "from-selfdirected/20",
    dot: "bg-selfdirected",
  },
  COURSE: {
    text: "text-course",
    ring: "hover:border-course/60 hover:ring-course/20",
    chip: "border-course/30 bg-course/10 text-course",
    glow: "from-course/20",
    dot: "bg-course",
  },
};
