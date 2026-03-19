import prisma from "@/app/db";

let cachedStats: any = null;
let lastFetch = 0;

export async function getDashboardStats() {
  const now = Date.now();

  if (cachedStats && now - lastFetch < 10000) {
    return cachedStats;
  }

  const calls = await prisma.callSheet.groupBy({
    by: ["createdById"],
    _count: { id: true },
  });

  const resolved = await prisma.callSheet.groupBy({
    by: ["resolvedById"],
    where: { status: "resolved" },
    _count: { id: true },
  });

  const data = { calls, resolved };

  cachedStats = data;
  lastFetch = now;

  return data;
}
