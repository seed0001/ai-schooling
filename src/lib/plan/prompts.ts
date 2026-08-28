import type { LearningPlan, PlanModule, PlanTrack } from "@prisma/client";
import { parsePlanContext, parsePlanShape } from "../types";

/**
 * Prompts for the audience-agnostic pipeline. No grade level, no school year,
 * no assumption that there is a teacher at all. The plan's `track` decides the
 * voice and the segment headings of each session.
 */

const ENGLISH_PIN =
  "Write every part of your output in English (United States), including all JSON string values, unless the plan explicitly asks for another language.";

type TrackProfile = {
  /** One line describing who is running the plan and who it is for. */
  role: string;
  /** How each session should be written. */
  voice: string;
  /** The segment headings a session should use, in order. */
  segments: string[];
};

const TRACKS: Record<PlanTrack, TrackProfile> = {
  TEACHING: {
    role:
      "You are helping an instructor plan a class, cohort, or workshop they will lead for a group of learners.",
    voice:
      "Write each session for the instructor: what they do and say, in order, with realistic timing. Assume adult learners unless the audience says otherwise.",
    segments: [
      "Opening",
      "Teach",
      "Practice",
      "Check for understanding",
      "Support & extension",
      "Follow-up",
    ],
  },
  COACHING: {
    role:
      "You are helping someone (a tutor, mentor, parent, or trainer) plan one-on-one sessions with a single learner.",
    voice:
      "Write each session for the person guiding the learner, working side by side. Name where this particular learner is likely to struggle.",
    segments: [
      "Warm-up",
      "Work through together",
      "Independent try",
      "Where they'll struggle",
      "Between sessions",
    ],
  },
  SELF_DIRECTED: {
    role:
      "You are helping a person plan their own learning. There is no teacher. The reader of every session IS the learner.",
    voice:
      "Address the learner directly as \"you\". No lectures, no classroom, no homework assigned by someone else. Give them something concrete to do and a way to know it worked.",
    segments: [
      "What you'll do",
      "Resources",
      "Check yourself",
      "If you get stuck",
      "Go deeper",
    ],
  },
  COURSE: {
    role:
      "You are helping an instructional designer build a course that other people will deliver, or that will run inside an organization.",
    voice:
      "Write each session so a facilitator who did not design it can run it: objectives, materials, a clear delivery script, and how completion is judged.",
    segments: [
      "Session objective",
      "Materials & setup",
      "Delivery",
      "Learner activity",
      "Assessment of completion",
      "Facilitator notes",
    ],
  },
};

export function systemFor(track: PlanTrack): string {
  const p = TRACKS[track];
  return `${p.role}

${ENGLISH_PIN}

Principles:
- Meet the learner where they are. Honor the stated goal, starting point, and approach.
- Build a coherent arc: each module depends on what came before and sets up what comes next.
- Be concrete and usable, never generic filler.
- Respect the stated time budget and pacing. Do not assume a school year, a semester, or any fixed calendar.
- Describe skills and understanding in plain language. No standards codes unless the user gave them.

Always reply with a single JSON object and nothing else.`;
}

function context(plan: LearningPlan): string {
  const ctx = parsePlanContext(plan.context);
  const shape = parsePlanShape(plan.shape);
  const lines = [
    `Topic: ${plan.topic}`,
    plan.audience ? `Who is learning: ${plan.audience}` : null,
    `Goal / what success looks like: ${plan.goal}`,
    ctx.startingPoint ? `Starting point: ${ctx.startingPoint}` : null,
    ctx.timeBudget ? `Time available: ${ctx.timeBudget}` : null,
    ctx.format ? `Format: ${ctx.format}` : null,
    ctx.approach ? `Approach: ${ctx.approach}` : null,
    ctx.resources ? `Resources on hand: ${ctx.resources}` : null,
    ctx.constraints ? `Constraints: ${ctx.constraints}` : null,
    ctx.notes ? `Other notes: ${ctx.notes}` : null,
    shape.pacing ? `Pacing: ${shape.pacing}` : null,
    `Rough length of one session: ~${shape.sessionLengthMin} minutes`,
  ];
  return lines.filter(Boolean).join("\n");
}

export function outlinePrompt(plan: LearningPlan): string {
  const shape = parsePlanShape(plan.shape);
  const countHint = shape.moduleCountHint
    ? `Aim for about ${shape.moduleCountHint} modules.`
    : "Choose a module count that fits the goal and the time available.";
  return `${context(plan)}

TASK: Produce the plan as an ordered list of modules that together reach the goal.
${countHint}

Return JSON of this shape:
{
  "modules": [
    {
      "title": "string",
      "summary": "2-4 sentences: what this module covers and why it sits here in the sequence",
      "outcomes": ["what the learner can do or understand after this module, 1-4 items"],
      "estSessions": integer 1-20
    }
  ]
}`;
}

export function sessionsPrompt(
  plan: LearningPlan,
  module: PlanModule,
  siblingTitles: string[],
  note?: string,
): string {
  const p = TRACKS[plan.track];
  const shape = parsePlanShape(plan.shape);
  const count = shape.sessionsPerModuleHint ?? module.estSessions;
  const headings = p.segments.map((h) => `"${h}"`).join(", ");
  return `${context(plan)}

CURRENT MODULE (#${module.order}): ${module.title}
Summary: ${module.summary}
Outcomes: ${module.outcomes.join("; ")}
Planned length: ${count} session(s)

Other modules in this plan, in order: ${siblingTitles.join(" -> ")}
${note ? `\nUser adjustment for this regeneration: ${note}\n` : ""}
${p.voice}

TASK: Break this module into ${count} session(s), each about ${shape.sessionLengthMin} minutes.
Each session's "segments" should use these headings, in this order: ${headings}.
Omit a heading only if it genuinely does not apply to that session.

Return JSON:
{
  "sessions": [
    {
      "title": "string",
      "objective": "one sentence, learner-facing",
      "estMinutes": integer,
      "segments": [ { "heading": "string", "body": "string" } ]
    }
  ]
}

Return exactly ${count} session object(s), in order.`;
}
