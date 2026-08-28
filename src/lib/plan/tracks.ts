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
