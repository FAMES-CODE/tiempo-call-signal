import { syncCustomers } from "@/lib/firebird-db/customers-actions";
import type { CronJobDefinition } from "../types";

export const customersSyncJob: CronJobDefinition = {
  id: "customers-sync",
  name: "Synchronisation clients Firebird → SQLite",
  schedule: process.env.CRON_CUSTOMERS_SYNC_SCHEDULE?.trim() || "*/2 * * * *",
  enabled: process.env.CRON_CUSTOMERS_SYNC_ENABLED !== "false",
  runOnStart: process.env.CRON_CUSTOMERS_SYNC_ON_START === "true",
  handler: async () => {
    const count = await syncCustomers();
    return {
      message: `${count} client(s) synchronisé(s)`,
      meta: { customersSynced: count },
    };
  },
};
