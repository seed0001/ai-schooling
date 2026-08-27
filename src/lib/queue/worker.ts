/**
 * Standalone worker process: `npm run worker`.
 * On Railway, run this as a second service off the same repo + database.
 */
import { getBoss, QUEUE, type GenerationPayload } from "./boss";
import { runGenerationJob } from "./runJob";

async function main() {
  const boss = await getBoss();
  await boss.work<GenerationPayload>(QUEUE, { batchSize: 1 }, async ([job]) => {
    console.log(`[worker] ${job.data.kind} job=${job.data.jobId}`);
    await runGenerationJob(job.data);
    console.log(`[worker] done ${job.data.jobId}`);
  });
  console.log(`[worker] listening on "${QUEUE}"`);
}

main().catch((err) => {
  console.error("[worker] fatal", err);
  process.exit(1);
});
