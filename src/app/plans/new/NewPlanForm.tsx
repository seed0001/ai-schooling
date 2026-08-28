"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PlanTrack } from "@prisma/client";
import { readJson } from "@/lib/http";

const field = "input";
const label = "label";
const hint = "text-neutral-400 font-normal";

type Copy = {
  titlePlaceholder: string;
  topicLabel: string;
  topicPlaceholder: string;
  goalLabel: string;
  goalPlaceholder: string;
  showAudience: boolean;
  audienceLabel: string;
  audiencePlaceholder: string;
  startingPointLabel: string;
  approachLabel: string;
  approachPlaceholder: string;
  formatPlaceholder: string;
  pacingPlaceholder: string;
};

const COPY: Record<PlanTrack, Copy> = {
  TEACHING: {
    titlePlaceholder: "Intro to Data Analysis — Fall cohort",
    topicLabel: "Topic",
    topicPlaceholder: "Spreadsheet data analysis for analysts",
    goalLabel: "What should learners be able to do by the end?",
    goalPlaceholder: "Clean a messy dataset, build a pivot summary, and present one insight.",
    showAudience: true,
    audienceLabel: "Who's learning?",
    audiencePlaceholder: "12 new hires, mixed backgrounds, comfortable with computers",
    startingPointLabel: "Where is the group starting from?",
    approachLabel: "Teaching approach",
    approachPlaceholder: "hands-on labs, short lecture, work in pairs",
    formatPlaceholder: "in person, 2-hour evening sessions",
    pacingPlaceholder: "8 weekly sessions",
  },
  COACHING: {
    titlePlaceholder: "Algebra catch-up with Sam",
    topicLabel: "Topic",
    topicPlaceholder: "Algebra 1 — linear equations and graphing",
    goalLabel: "What should the learner be able to do by the end?",
    goalPlaceholder: "Solve two-step equations confidently and graph a line from an equation.",
    showAudience: true,
    audienceLabel: "Who's the learner?",
    audiencePlaceholder: "14 years old, strong arithmetic, anxious about word problems",
    startingPointLabel: "Where is the learner starting from?",
    approachLabel: "How you'll work together",
    approachPlaceholder: "worked examples, then they try one while I watch",
    formatPlaceholder: "45-minute sessions, twice a week, at the kitchen table",
    pacingPlaceholder: "about 10 sessions over 5 weeks",
  },
  SELF_DIRECTED: {
    titlePlaceholder: "Learn to read music",
    topicLabel: "What do you want to learn?",
    topicPlaceholder: "Reading sheet music for piano",
    goalLabel: "What do you want to be able to do?",
    goalPlaceholder: "Sight-read a simple two-hand piece without stopping.",
    showAudience: false,
    audienceLabel: "",
    audiencePlaceholder: "",
    startingPointLabel: "Where are you starting from?",
    approachLabel: "How you learn best",
    approachPlaceholder: "short daily practice, learn by doing, not much reading",
    formatPlaceholder: "self-paced, ~30 minutes on weekday mornings",
    pacingPlaceholder: "over about 6 weeks",
  },
  COURSE: {
    titlePlaceholder: "Warehouse Safety Onboarding",
    topicLabel: "Course topic",
    topicPlaceholder: "Forklift and floor safety for new warehouse staff",
    goalLabel: "What should a learner be able to do after completing it?",
    goalPlaceholder: "Pass the safety checklist and demonstrate correct pallet handling.",
    showAudience: true,
    audienceLabel: "Who will take this course?",
    audiencePlaceholder: "new warehouse hires, no prior warehouse experience",
    startingPointLabel: "What can you assume learners already know?",
    approachLabel: "Delivery approach",
    approachPlaceholder: "facilitator-led, video + hands-on, small groups",
    formatPlaceholder: "half-day in person, delivered by a floor supervisor",
    pacingPlaceholder: "4 modules, one morning",
  },
};

export function NewPlanForm({ track }: { track: PlanTrack }) {
  const router = useRouter();
  const c = COPY[track];
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const f = new FormData(e.currentTarget);
    const num = (k: string) => {
      const n = Number(f.get(k));
      return Number.isFinite(n) && n > 0 ? n : undefined;
    };
    const payload = {
      track,
      title: f.get("title"),
      topic: f.get("topic"),
      audience: c.showAudience ? f.get("audience") || undefined : undefined,
      goal: f.get("goal"),
      context: {
        startingPoint: f.get("startingPoint") || undefined,
        timeBudget: f.get("timeBudget") || undefined,
        format: f.get("format") || undefined,
        approach: f.get("approach") || undefined,
        resources: f.get("resources") || undefined,
        constraints: f.get("constraints") || undefined,
        notes: f.get("notes") || undefined,
      },
      shape: {
        pacing: f.get("pacing") || undefined,
        sessionLengthMin: num("sessionLengthMin"),
        moduleCountHint: num("moduleCountHint"),
        sessionsPerModuleHint: num("sessionsPerModuleHint"),
      },
    };

    const res = await fetch("/api/plans", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await readJson<{ id?: string; error?: string }>(res);
    if (!res.ok || !data.id) {
      setError(typeof data.error === "string" ? data.error : "Check the form and try again.");
      setSubmitting(false);
      return;
    }
    router.push(`/plans/${data.id}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="card space-y-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="title">Plan name</label>
            <input id="title" name="title" required className={field} placeholder={c.titlePlaceholder} />
          </div>
          <div>
            <label className={label} htmlFor="topic">{c.topicLabel}</label>
            <input id="topic" name="topic" required className={field} placeholder={c.topicPlaceholder} />
          </div>
          {c.showAudience && (
            <div className="sm:col-span-2">
              <label className={label} htmlFor="audience">
                {c.audienceLabel} <span className={hint}>(optional)</span>
              </label>
              <input id="audience" name="audience" className={field} placeholder={c.audiencePlaceholder} />
            </div>
          )}
        </div>

        <div>
          <label className={label} htmlFor="goal">{c.goalLabel}</label>
          <textarea id="goal" name="goal" rows={2} required className={field} placeholder={c.goalPlaceholder} />
        </div>
      </div>

      <fieldset className="card grid gap-4 p-5 sm:grid-cols-2">
        <legend className="px-1 text-sm font-semibold">Context <span className={hint}>(all optional)</span></legend>
        <div className="sm:col-span-2">
          <label className={label} htmlFor="startingPoint">{c.startingPointLabel}</label>
          <input id="startingPoint" name="startingPoint" className={field} />
        </div>
        <div>
          <label className={label} htmlFor="format">Format</label>
          <input id="format" name="format" className={field} placeholder={c.formatPlaceholder} />
        </div>
        <div>
          <label className={label} htmlFor="approach">{c.approachLabel}</label>
          <input id="approach" name="approach" className={field} placeholder={c.approachPlaceholder} />
        </div>
        <div>
          <label className={label} htmlFor="timeBudget">Time available overall</label>
          <input id="timeBudget" name="timeBudget" className={field} placeholder="a few hours a week for two months" />
        </div>
        <div>
          <label className={label} htmlFor="resources">Resources on hand</label>
          <input id="resources" name="resources" className={field} placeholder="a textbook, a laptop, a practice keyboard" />
        </div>
        <div>
          <label className={label} htmlFor="constraints">Constraints</label>
          <input id="constraints" name="constraints" className={field} placeholder="no budget, evenings only" />
        </div>
        <div>
          <label className={label} htmlFor="notes">Other notes</label>
          <input id="notes" name="notes" className={field} />
        </div>
      </fieldset>

      <fieldset className="card grid gap-4 p-5 sm:grid-cols-4">
        <legend className="px-1 text-sm font-semibold">Shape <span className={hint}>(optional)</span></legend>
        <div className="sm:col-span-2">
          <label className={label} htmlFor="pacing">Pacing</label>
          <input id="pacing" name="pacing" className={field} placeholder={c.pacingPlaceholder} />
        </div>
        <div>
          <label className={label} htmlFor="sessionLengthMin">Minutes / session</label>
          <input id="sessionLengthMin" name="sessionLengthMin" type="number" defaultValue={45} className={field} />
        </div>
        <div>
          <label className={label} htmlFor="moduleCountHint"># modules</label>
          <input id="moduleCountHint" name="moduleCountHint" type="number" className={field} placeholder="auto" />
        </div>
        <div>
          <label className={label} htmlFor="sessionsPerModuleHint">Sessions / module</label>
          <input id="sessionsPerModuleHint" name="sessionsPerModuleHint" type="number" className={field} placeholder="auto" />
        </div>
      </fieldset>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={submitting} className="btn-primary !px-5 !py-2.5">
        {submitting ? "Creating…" : "Create plan →"}
      </button>
    </form>
  );
}
