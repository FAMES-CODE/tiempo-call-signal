import cron, { type ScheduledTask } from "node-cron";
import { getCronLogDirectory, logCronEvent } from "./logger";
import { cronJobs } from "./registry";
import { runCronJob } from "./runner";

const scheduledTasks: ScheduledTask[] = [];

function isCronGloballyEnabled(): boolean {
  return process.env.CRON_ENABLED !== "false";
}

export function startCronScheduler(): void {
  if (!isCronGloballyEnabled()) {
    console.log("[cron] Planificateur désactivé (CRON_ENABLED=false)");
    return;
  }

  const enabledJobs = cronJobs.filter((job) => job.enabled);

  for (const job of cronJobs) {
    if (!job.enabled) {
      console.log(`[cron] Job désactivé : ${job.id}`);
      continue;
    }

    if (!cron.validate(job.schedule)) {
      console.error(
        `[cron] Expression cron invalide pour "${job.id}" : ${job.schedule}`,
      );
      continue;
    }

    const task = cron.schedule(job.schedule, () => {
      void runCronJob(job);
    });

    scheduledTasks.push(task);

    void logCronEvent({
      jobId: job.id,
      jobName: job.name,
      event: "job_registered",
      schedule: job.schedule,
      message: `Planifié : ${job.schedule}`,
    });

    if (job.runOnStart) {
      void runCronJob(job);
    }
  }

  void logCronEvent({
    jobId: "scheduler",
    jobName: "Planificateur cron",
    event: "scheduler_started",
    message: `${enabledJobs.length} job(s) actif(s)`,
    meta: {
      logDirectory: getCronLogDirectory(),
      jobs: enabledJobs.map((j) => ({ id: j.id, schedule: j.schedule })),
    },
  });
}

export function stopCronScheduler(): void {
  for (const task of scheduledTasks) {
    task.stop();
  }
  scheduledTasks.length = 0;

  void logCronEvent({
    jobId: "scheduler",
    jobName: "Planificateur cron",
    event: "scheduler_stopped",
    message: "Arrêt du planificateur",
  });
}
