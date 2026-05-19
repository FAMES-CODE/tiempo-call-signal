// server.ts
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

async function main() {
  const { createServer } = await import("http");
  const { parse } = await import("url");
  const { default: next } = await import("next");
  const { checkAdmin } = await import("./app/jobs/system/sys-jobs");
  const { startCronScheduler } = await import("./lib/cron/scheduler");

  const dev = process.env.NODE_ENV !== "production";
  const app = next({ dev });
  const handle = app.getRequestHandler();

  app.prepare().then(async () => {
    await checkAdmin();
    startCronScheduler();

    createServer((req, res) => {
      const parsedUrl = parse(req.url!, true);
      handle(req, res, parsedUrl);
    }).listen(3000, () => {
      console.log(
        `> Ready on http://localhost:3000 (${dev ? "dev" : "production"})`,
      );
    });
  });
}

main();
