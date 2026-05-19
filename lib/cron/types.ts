export type CronLogEvent =
  | "scheduler_started"
  | "scheduler_stopped"
  | "job_registered"
  | "start"
  | "success"
  | "failure"
  | "skipped";

export type CronLogEntry = {
  timestamp: string;
  jobId: string;
  jobName: string;
  event: CronLogEvent;
  schedule?: string;
  durationMs?: number;
  message?: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  meta?: Record<string, unknown>;
};

export type CronJobHandlerResult = {
  message?: string;
  meta?: Record<string, unknown>;
};

export type CronJobDefinition = {
  id: string;
  name: string;
  schedule: string;
  enabled: boolean;
  runOnStart?: boolean;
  handler: () => Promise<CronJobHandlerResult | void>;
};
