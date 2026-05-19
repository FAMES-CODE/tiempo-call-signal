import { logCronEvent } from "./logger";
import type { CronJobDefinition } from "./types";

const runningJobs = new Set<string>();

function isCronGloballyEnabled(): boolean {
  return process.env.CRON_ENABLED !== "false";
}

export async function runCronJob(job: CronJobDefinition): Promise<void> {
  if (!isCronGloballyEnabled()) {
    return;
  }

  if (!job.enabled) {
    return;
  }

  if (runningJobs.has(job.id)) {
    await logCronEvent({
      jobId: job.id,
      jobName: job.name,
      event: "skipped",
      schedule: job.schedule,
      message: "Exécution ignorée : la tâche précédente est encore en cours",
    });
    return;
  }

  runningJobs.add(job.id);
  const startedAt = Date.now();

  await logCronEvent({
    jobId: job.id,
    jobName: job.name,
    event: "start",
    schedule: job.schedule,
  });

  try {
    const result = await job.handler();
    const durationMs = Date.now() - startedAt;

    await logCronEvent({
      jobId: job.id,
      jobName: job.name,
      event: "success",
      schedule: job.schedule,
      durationMs,
      message: result?.message,
      meta: result?.meta,
    });
  } catch (error) {
    const durationMs = Date.now() - startedAt;

    await logCronEvent({
      jobId: job.id,
      jobName: job.name,
      event: "failure",
      schedule: job.schedule,
      durationMs,
      message: "Échec de l'exécution",
      error,
    });
  } finally {
    runningJobs.delete(job.id);
  }
}
