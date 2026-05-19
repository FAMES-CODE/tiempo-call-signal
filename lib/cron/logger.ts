import { appendFile, mkdir } from "fs/promises";
import path from "path";
import type { CronLogEntry, CronLogEvent } from "./types";

const DEFAULT_LOG_DIR = path.join(process.cwd(), "logs", "cron");

function resolveLogDir(): string {
  return process.env.CRON_LOG_DIR?.trim() || DEFAULT_LOG_DIR;
}

function formatDateForFilename(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function dailyLogPath(date = new Date()): string {
  return path.join(resolveLogDir(), `${formatDateForFilename(date)}.log`);
}

function serializeError(error: unknown): CronLogEntry["error"] {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  return {
    name: "Error",
    message: String(error),
  };
}

function formatConsoleLine(entry: CronLogEntry): string {
  const time = entry.timestamp.replace("T", " ").replace(/\.\d{3}Z$/, " UTC");
  const duration =
    entry.durationMs !== undefined ? ` (${entry.durationMs}ms)` : "";
  const meta =
    entry.meta && Object.keys(entry.meta).length > 0
      ? ` | ${JSON.stringify(entry.meta)}`
      : "";
  const err = entry.error ? ` | ${entry.error.message}` : "";
  const msg = entry.message ? ` — ${entry.message}` : "";

  return `[cron] ${time} | ${entry.jobId} | ${entry.event}${duration}${msg}${meta}${err}`;
}

async function ensureLogDir(): Promise<void> {
  await mkdir(resolveLogDir(), { recursive: true });
}

async function appendLogLine(entry: CronLogEntry): Promise<void> {
  await ensureLogDir();
  const line = `${JSON.stringify(entry)}\n`;
  await appendFile(dailyLogPath(new Date(entry.timestamp)), line, "utf8");
}

export async function writeCronLog(
  partial: Omit<CronLogEntry, "timestamp"> & { timestamp?: string },
): Promise<void> {
  const entry: CronLogEntry = {
    ...partial,
    timestamp: partial.timestamp ?? new Date().toISOString(),
  };

  console.log(formatConsoleLine(entry));

  try {
    await appendLogLine(entry);
  } catch (fileError) {
    console.error("[cron] Impossible d'écrire dans le fichier de log :", fileError);
  }
}

export async function logCronEvent(params: {
  jobId: string;
  jobName: string;
  event: CronLogEvent;
  schedule?: string;
  durationMs?: number;
  message?: string;
  error?: unknown;
  meta?: Record<string, unknown>;
}): Promise<void> {
  await writeCronLog({
    jobId: params.jobId,
    jobName: params.jobName,
    event: params.event,
    schedule: params.schedule,
    durationMs: params.durationMs,
    message: params.message,
    meta: params.meta,
    error: params.error !== undefined ? serializeError(params.error) : undefined,
  });
}

export function getCronLogDirectory(): string {
  return resolveLogDir();
}
