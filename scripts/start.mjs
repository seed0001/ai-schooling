/**
 * Container entrypoint for the `web` service.
 * 1. Apply pending DB migrations (blocking).
 * 2. Run the Next.js server and the pg-boss generation worker side by side.
 *    If either exits, tear the container down so Railway restarts it clean.
 *
 * Splitting the worker into its own Railway service later is a drop-in change:
 * just run `npx tsx src/lib/queue/worker.ts` as that service's start command.
 */
import { spawn, spawnSync } from "node:child_process";

const PORT = process.env.PORT || "3000";

const migrate = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  env: process.env,
});
if (migrate.status !== 0) {
  console.error("[start] prisma migrate deploy failed");
  process.exit(migrate.status ?? 1);
}

const children = [];
let shuttingDown = false;

function shutdown(code) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const { child } of children) child.kill("SIGTERM");
  setTimeout(() => process.exit(code), 3000).unref();
}

function launch(name, argv) {
  const child = spawn(argv[0], argv.slice(1), { stdio: "inherit", env: process.env });
  children.push({ name, child });
  child.on("exit", (exitCode, signal) => {
    if (shuttingDown) return;
    console.error(`[start] ${name} exited (code=${exitCode} signal=${signal}); shutting down`);
    shutdown(exitCode ?? 1);
  });
  child.on("error", (err) => {
    console.error(`[start] ${name} failed to spawn:`, err);
    shutdown(1);
  });
}

process.on("SIGTERM", () => shutdown(0));
process.on("SIGINT", () => shutdown(0));

launch("web", ["npx", "next", "start", "-p", PORT, "-H", "0.0.0.0"]);
launch("worker", ["npx", "tsx", "src/lib/queue/worker.ts"]);
