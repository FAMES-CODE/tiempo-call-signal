import prisma from "@/app/db";

type DashboardStats = {
  totalCalls: number;
  totalResolved: number;
};

const cacheByUser = new Map<number, { data: DashboardStats; lastFetch: number }>();
const CACHE_TTL_MS = 10000;

export async function getDashboardStats(userId: number): Promise<DashboardStats> {
  const now = Date.now();
  const cached = cacheByUser.get(userId);

  if (cached && now - cached.lastFetch < CACHE_TTL_MS) {
    return cached.data;
  }

  const totalCalls = await prisma.callSheet.count({
    where: { createdById: userId },
  });

  const totalResolved = await prisma.callSheet.count({
    where: { resolvedById: userId, status: "resolved" },
  });

  const data = { totalCalls, totalResolved };

  cacheByUser.set(userId, { data, lastFetch: now });

  return data;
}
