import type { Curriculum, Unit, Week } from "@prisma/client";
import { parseCalendar, parsePreferences } from "../types";

export const SYSTEM_PLANNER = `You are an experienced curriculum designer who writes plans for both classroom teachers and homeschooling parents.

Principles:
- Meet the learner where they are. Honor the learner profile and teaching approach you are given.
- Build a coherent arc: each unit should depend on what came before and set up what comes next.
- Be concrete and usable, never generic filler. A parent with no teaching background should be able to run your plan.
- Respect the stated time budget and calendar.
- No rigid standards codes unless the user gave them; describe skills and understanding in plain language.

Always reply with a single JSON object and nothing else.`;

function context(c: Curriculum): string {
  const prefs = parsePreferences(c.preferences);
  const cal = parseCalendar(c.calendar);
  const lines = [
    `Subject: ${c.subject}`,
    `Grade / level: ${c.gradeLevel}`,
    `Learner profile: ${c.learnerProfile}`,
    `Teaching approach: ${prefs.approach}`,
    `Time per lesson: ~${prefs.minutesPerDay} minutes`,
    prefs.resourcesOnHand ? `Resources on hand: ${prefs.resourcesOnHand}` : null,
    prefs.notes ? `Other notes: ${prefs.notes}` : null,
    `Calendar: ${cal.weeksOfInstruction} weeks of instruction, ${cal.daysPerWeek} days/week, ${cal.startDate} to ${cal.endDate}`,
    cal.breaks.length ? `Breaks: ${cal.breaks.join("; ")}` : null,
  ];
  if (c.entryMode === "AROUND_SPINE" && c.sourceMaterial) {
    lines.push(`Build the year around this spine / text / reading list:\n${c.sourceMaterial}`);
  }
  if (c.entryMode === "FROM_GOALS" && c.sourceMaterial) {
    lines.push(`Sequence and pace these goals the user wants covered this year:\n${c.sourceMaterial}`);
  }
  return lines.filter(Boolean).join("\n");
}

export function outlinePrompt(c: Curriculum): string {
  const cal = parseCalendar(c.calendar);
  return `${context(c)}

TASK: Produce the full-year scope and sequence as an ordered list of units that together fill roughly ${cal.weeksOfInstruction} weeks.

Return JSON of this shape:
{
  "units": [
    {
      "title": "string",
      "summary": "2-4 sentences: what this unit covers and why it sits here in the sequence",
      "bigIdeas": ["lasting understandings, 2-4 items"],
      "essentialQuestions": ["open questions that drive the unit, 2-4 items"],
      "estWeeks": integer 1-8
    }
  ]
}

The estWeeks values should sum to approximately ${cal.weeksOfInstruction}.`;
}

export function weeksPrompt(c: Curriculum, unit: Unit, siblingTitles: string[], note?: string): string {
  return `${context(c)}

CURRENT UNIT (#${unit.order}): ${unit.title}
Summary: ${unit.summary}
Big ideas: ${unit.bigIdeas.join("; ")}
Essential questions: ${unit.essentialQuestions.join("; ")}
Planned length: ${unit.estWeeks} week(s)

Other units this year, in order: ${siblingTitles.join(" -> ")}
${note ? `\nUser adjustment for this regeneration: ${note}\n` : ""}
TASK: Break this unit into ${unit.estWeeks} week(s) of instruction. For each week give a focus and 2-4 concrete learning objectives phrased as what the learner will be able to do or understand.

Return JSON:
{ "weeks": [ { "focus": "string", "objectives": ["string", ...] } ] }

Return exactly ${unit.estWeeks} week object(s).`;
}

export function lessonsPrompt(
  c: Curriculum,
  unit: Unit,
  week: Week,
  daysPerWeek: number,
  otherLessonTitlesInUnit: string[],
  note?: string,
): string {
  const prefs = parsePreferences(c.preferences);
  return `${context(c)}

UNIT: ${unit.title} - ${unit.summary}
WEEK #${week.order} FOCUS: ${week.focus}
WEEK OBJECTIVES: ${week.objectives.join("; ")}

Lessons already planned elsewhere in this unit (avoid repeating them): ${
    otherLessonTitlesInUnit.length ? otherLessonTitlesInUnit.join("; ") : "none yet"
  }
${note ? `\nUser adjustment for this regeneration: ${note}\n` : ""}
TASK: Write ${daysPerWeek} daily lessons that deliver this week's objectives, each about ${prefs.minutesPerDay} minutes.

Return JSON:
{
  "lessons": [
    {
      "title": "string",
      "objective": "one sentence, learner-facing",
      "materials": ["item", ...],
      "hook": "how the lesson opens / engages",
      "instruction": "the core teaching: what the adult does and says, steps",
      "practice": "what the learner does to practice or apply",
      "assessment": "how the adult checks understanding today",
      "differentiation": "one support and one extension",
      "homework": "optional short follow-up, or null",
      "timeEstimateMin": integer
    }
  ]
}

Return exactly ${daysPerWeek} lesson object(s), in teaching order.`;
}
