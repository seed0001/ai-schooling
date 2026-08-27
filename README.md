# AI Schooling

AI-assisted year-long lesson planning for teachers and homeschoolers.

You describe the subject, grade, and learner. The app drafts a full-year plan you
can drill into and edit at every level:

```
Intake  ->  Year outline  ->  Unit -> weeks  ->  Daily lessons
```

Each level is a separate AI call. You review and edit before spending tokens on
the next level down, and every AI output is an editable draft. Any level can be
regenerated with a steering note ("less writing", "more hands-on").

## Stack

- **Next.js** (App Router, TypeScript) — web app + API routes
- **Postgres** + **Prisma** — data
- **OpenRouter** — model access, behind `src/lib/ai` (per-level model routing via env)
- **pg-boss** — Postgres-backed job queue for bulk generation (optional; inline by default)

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in `DATABASE_URL` and `OPENROUTER_API_KEY`.
3. `npm run db:push` — create the schema.
4. `npm run demo` — run the whole pipeline once from the CLI (no UI) to confirm it works.
5. `npm run dev` — open http://localhost:3000, create a plan, generate.

## Generation modes

- **Inline** (default): API routes run generation synchronously. Simplest; fine for
  dev and small deployments.
- **Queue**: set `GENERATION_MODE=queue` and run `npm run worker` in a second
  process. Generation is enqueued to pg-boss and the UI polls job status.

## Deploying to Railway

- **Web service**: this repo. Build `npm run build`, start `npm start`.
- **Worker service** (only if using queue mode): same repo, start `npm run worker`.
- **Postgres**: Railway plugin; set `DATABASE_URL` on both services.
- Run `npm run db:push` (or add a proper migration step) on deploy.

## Not done yet

- Auth — `src/lib/auth.ts` is a single dev user. Drop in Auth.js later.
- Billing — deferred (PayPal, probably).
- Export (print / PDF / Markdown).
- Standards alignment (currently freeform / goal-based only).
- Entry mode #4: import & improve an existing plan.
