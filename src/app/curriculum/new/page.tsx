"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { readJson } from "@/lib/http";

const field = "input";
const label = "label";

export default function NewCurriculumPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const f = new FormData(e.currentTarget);
    const payload = {
      title: f.get("title"),
      subject: f.get("subject"),
      gradeLevel: f.get("gradeLevel"),
      entryMode: f.get("entryMode"),
      sourceMaterial: f.get("sourceMaterial") || undefined,
      learnerProfile: f.get("learnerProfile"),
      preferences: {
        approach: f.get("approach") || undefined,
        minutesPerDay: Number(f.get("minutesPerDay")) || undefined,
        resourcesOnHand: f.get("resourcesOnHand") || undefined,
        notes: f.get("notes") || undefined,
      },
      calendar: {
        startDate: f.get("startDate") || undefined,
        endDate: f.get("endDate") || undefined,
        daysPerWeek: Number(f.get("daysPerWeek")) || undefined,
        weeksOfInstruction: Number(f.get("weeksOfInstruction")) || undefined,
      },
    };

    const res = await fetch("/api/curricula", {
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
    router.push(`/curriculum/${data.id}`);
  }

  return (
    <main className="space-y-6">
      <div>
        <Link href="/curricula" className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-300">
          ← All curricula
        </Link>
        <h1 className="font-display text-2xl font-bold tracking-tight">New curriculum</h1>
      </div>
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="card grid gap-4 p-5 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="title">Plan name</label>
            <input id="title" name="title" required className={field} placeholder="5th Grade Math 2026-27" />
          </div>
          <div>
            <label className={label} htmlFor="subject">Subject</label>
            <input id="subject" name="subject" required className={field} placeholder="Mathematics" />
          </div>
          <div>
            <label className={label} htmlFor="gradeLevel">Grade / level</label>
            <input id="gradeLevel" name="gradeLevel" required className={field} placeholder="5th grade" />
          </div>
          <div>
            <label className={label} htmlFor="entryMode">Starting point</label>
            <select id="entryMode" name="entryMode" className={field} defaultValue="FROM_SCRATCH">
              <option value="FROM_SCRATCH">Build it from scratch</option>
              <option value="AROUND_SPINE">Build around a textbook / reading list</option>
              <option value="FROM_GOALS">Sequence my own goal list</option>
            </select>
          </div>
        </div>

        <div className="card space-y-4 p-5">
          <div>
            <label className={label} htmlFor="sourceMaterial">
              Source material <span className="font-normal text-neutral-400">(textbook name, reading list, or your goal list — if any)</span>
            </label>
            <textarea id="sourceMaterial" name="sourceMaterial" rows={3} className={field} />
          </div>

          <div>
            <label className={label} htmlFor="learnerProfile">
              Learner profile <span className="font-normal text-neutral-400">(the student or class: interests, pace, prior knowledge, needs)</span>
            </label>
            <textarea
              id="learnerProfile"
              name="learnerProfile"
              rows={4}
              required
              className={field}
              placeholder="One 10-year-old. Strong reader, reluctant with multi-step problems. Loves building and Minecraft. Comfortable with multiplication facts, shaky on fractions."
            />
          </div>
        </div>

        <fieldset className="card grid gap-4 p-5 sm:grid-cols-2">
          <legend className="px-1 text-sm font-semibold">Teaching preferences</legend>
          <div>
            <label className={label} htmlFor="approach">Approach</label>
            <input id="approach" name="approach" className={field} placeholder="hands-on, mastery-based" />
          </div>
          <div>
            <label className={label} htmlFor="minutesPerDay">Minutes per lesson</label>
            <input id="minutesPerDay" name="minutesPerDay" type="number" defaultValue={45} className={field} />
          </div>
          <div>
            <label className={label} htmlFor="resourcesOnHand">Resources on hand</label>
            <input id="resourcesOnHand" name="resourcesOnHand" className={field} placeholder="manipulatives, printer, library card" />
          </div>
          <div>
            <label className={label} htmlFor="notes">Other notes</label>
            <input id="notes" name="notes" className={field} />
          </div>
        </fieldset>

        <fieldset className="card grid gap-4 p-5 sm:grid-cols-4">
          <legend className="px-1 text-sm font-semibold">Calendar</legend>
          <div>
            <label className={label} htmlFor="startDate">Start</label>
            <input id="startDate" name="startDate" type="date" defaultValue="2026-09-08" className={field} />
          </div>
          <div>
            <label className={label} htmlFor="endDate">End</label>
            <input id="endDate" name="endDate" type="date" defaultValue="2027-06-11" className={field} />
          </div>
          <div>
            <label className={label} htmlFor="daysPerWeek">Days / week</label>
            <input id="daysPerWeek" name="daysPerWeek" type="number" defaultValue={5} className={field} />
          </div>
          <div>
            <label className={label} htmlFor="weeksOfInstruction">Weeks</label>
            <input id="weeksOfInstruction" name="weeksOfInstruction" type="number" defaultValue={36} className={field} />
          </div>
        </fieldset>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={submitting} className="btn-primary !px-5 !py-2.5">
          {submitting ? "Creating…" : "Create curriculum →"}
        </button>
      </form>
    </main>
  );
}
