import prisma from "@/app/db";

type DashboardStats = {
  totalCalls: number;
  totalResolved: number;
  totalPending: number;
};

const cacheByUser = new Map<number, { data: DashboardStats; lastFetch: number }>();
const CACHE_TTL_MS = 10000;

export async function getDashboardStats(userId: number): Promise<DashboardStats> {
  const now = Date.now();
  const cached = cacheByUser.get(userId);

  if (cached && now - cached.lastFetch < CACHE_TTL_MS) {
    return cached.data;
  }

  const userCasesWhere = { createdById: userId };

  const [totalCalls, totalResolved, totalPending] = await Promise.all([
    prisma.callSheet.count({ where: userCasesWhere }),
    prisma.callSheet.count({
      where: { ...userCasesWhere, status: "resolved" },
    }),
    prisma.callSheet.count({
      where: { ...userCasesWhere, status: "pending" },
    }),
  ]);

  const data = { totalCalls, totalResolved, totalPending };

  cacheByUser.set(userId, { data, lastFetch: now });

  return data;
}
