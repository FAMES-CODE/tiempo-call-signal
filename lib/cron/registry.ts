import { customersSyncJob } from "./jobs/customers-sync.job";
import type { CronJobDefinition } from "./types";

export const cronJobs: CronJobDefinition[] = [customersSyncJob];
