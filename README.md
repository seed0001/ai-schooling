# AI Schooling

AI-assisted planning for **any kind of teaching or learning** — a class you teach,
a course you design, a person you tutor, or your own self-directed study.

You describe the situation; the app drafts a structured plan you can drill into
and edit at every level. Each level is a separate AI call, so you review and edit
before spending tokens on the next level down. Every AI output is an editable
draft, and any level can be regenerated with a steering note ("less writing",
"more hands-on").

## Two planners

The app has two pipelines, chosen from the splash page at `/`.

### Learning plans (default)

Audience-agnostic. No grade level, no fixed calendar. You pick a **track** that
sets the tone of what gets generated — it is a hint, not a cage, and every field
stays free text:

| Track | For |
|---|---|
| **Teaching a group** | a class, cohort, workshop, or session series you lead |
| **Coaching one learner** | tutor, mentor, parent, or trainer working 1:1 |
| **Learning it myself** | a self-directed plan — you are the learner, no teacher |
| **Building a course** | training for others to deliver, or for an organization |

```
Intake  ->  Outline (modules)  ->  Sessions per module
```

A session's body is a list of `{heading, body}` segments whose headings follow
the track — e.g. *What you'll do / Check yourself / If you get stuck* for a
self-learner, *Opening / Teach / Check for understanding* for an instructor.

Routes: `/plans/new?track=…`, `/plans/[id]`. Code: `src/lib/plan/`, `src/app/api/plans*`.

### Year-long curricula

The original K-12 / homeschool planner: one subject, one grade, one school year.

```
Intake  ->  Year outline  ->  Unit -> weeks  ->  Daily lessons
```

Routes: `/curricula`, `/curriculum/new`, `/curriculum/[id]`. Code:
`src/lib/generation/`, `src/app/api/curricula*`.

Both pipelines share the AI client (`src/lib/ai`), the job queue
(`src/lib/queue`), and the generation UI components.

## Stack

- **Next.js** (App Router, TypeScript) — web app + API routes
- **Postgres** + **Prisma** — data (migrations in `prisma/migrations/`)
- **OpenRouter** — model access, behind `src/lib/ai` (per-level model routing via env)
- **pg-boss** — Postgres-backed job queue for generation (optional; inline by default)
- **Tailwind CSS** — styling; shared kit in `src/app/globals.css` + `src/components/graphics.tsx`

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in `DATABASE_URL` and `OPENROUTER_API_KEY`.
3. `npx prisma migrate deploy` — apply the schema.
4. `npm run demo` — run the curriculum pipeline once from the CLI (no UI) to confirm wiring.
5. `npm run dev` — open http://localhost:3000, pick a planner, generate.

## Generation modes

- **Inline** (default): API routes run generation synchronously. Simplest; fine
  for dev and small deployments.
- **Queue**: set `GENERATION_MODE=queue` and run a worker. Generation is enqueued
  to pg-boss and the UI polls job status. Both pipelines route through the same
  worker (`src/lib/queue/worker.ts`).

## Deploying to Railway

`main` auto-deploys. Build and run are owned by the **Dockerfile**, not the
Railway build system.

- **Web service**: this repo, built from the Dockerfile. Its entrypoint
  (`scripts/start.mjs`) runs `prisma migrate deploy`, then starts the Next.js
  server and the pg-boss worker side by side in the one container.
- **Postgres**: Railway plugin; `DATABASE_URL` references it.
- Env: `OPENROUTER_API_KEY`, `MODEL_OUTLINE` / `MODEL_WEEKS` / `MODEL_LESSONS`,
  `GENERATION_MODE=queue`, `DEV_USER_EMAIL`.
- To split the worker into its own service later: new service, same repo, start
  command `npx tsx src/lib/queue/worker.ts`. Nothing else changes.

## Not done yet

- Auth — `src/lib/auth.ts` is a single dev user. Drop in Auth.js later.
- Inline editing of generated outlines/sessions (regeneration works; field-level edits don't).
- Non-destructive regeneration / versioning — regenerating a level replaces its children.
- Billing — deferred (PayPal, probably).
- Export (print / PDF / Markdown).
- A headless demo for the learning-plans pipeline (`npm run demo` covers curricula only).
