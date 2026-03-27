import prisma from "@/app/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

type StatsRow = {
  createdAt: Date;
  createdById: number;
  status: string;
  resolvedAt: Date | null;
  resolvedById: number | null;
};

function monthKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function yearOptions(currentYear: number) {
  return Array.from({ length: 5 }, (_, i) => currentYear - i);
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const now = new Date();
  const currentYear = now.getFullYear();
  const requestedYear = Number.parseInt(searchParams.get("year") ?? "", 10);
  const year = Number.isFinite(requestedYear) ? requestedYear : currentYear;

  const [users, rows] = await Promise.all([
    prisma.user.findMany({
      orderBy: { username: "asc" },
      select: { id: true, username: true, role: true, createdAt: true },
    }),
    prisma.callSheet.findMany({
      select: {
        createdAt: true,
        createdById: true,
        status: true,
        resolvedAt: true,
        resolvedById: true,
      },
    }),
  ]);

  const rowsInYear = rows.filter((row) => row.createdAt.getFullYear() === year);
  const resolvedInYear = rows.filter(
    (row) => row.resolvedAt && row.resolvedAt.getFullYear() === year,
  );

  const sheetsPerMonthMap = new Map<string, number>();
  const sheetsPerUserMap = new Map<number, number>();
  const sheetsPerUserByMonthMap = new Map<string, number>();
  const resolvedByUserMap = new Map<number, number>();
  const resolvedByUserByMonthMap = new Map<string, number>();

  for (const row of rowsInYear as StatsRow[]) {
    const m = monthKey(row.createdAt);
    sheetsPerMonthMap.set(m, (sheetsPerMonthMap.get(m) ?? 0) + 1);
    sheetsPerUserMap.set(row.createdById, (sheetsPerUserMap.get(row.createdById) ?? 0) + 1);

    const userMonthKey = `${row.createdById}:${m}`;
    sheetsPerUserByMonthMap.set(userMonthKey, (sheetsPerUserByMonthMap.get(userMonthKey) ?? 0) + 1);
  }

  for (const row of resolvedInYear as StatsRow[]) {
    if (!row.resolvedById || !row.resolvedAt) continue;
    const m = monthKey(row.resolvedAt);
    resolvedByUserMap.set(row.resolvedById, (resolvedByUserMap.get(row.resolvedById) ?? 0) + 1);
    const userMonthKey = `${row.resolvedById}:${m}`;
    resolvedByUserByMonthMap.set(
      userMonthKey,
      (resolvedByUserByMonthMap.get(userMonthKey) ?? 0) + 1,
    );
  }

  const totalSheets = rows.length;
  const pendingSheets = rows.filter((r) => r.status === "pending").length;
  const resolvedSheets = rows.filter((r) => r.status === "resolved").length;

  return NextResponse.json({
    overview: {
      totalUsers: users.length,
      totalAdmins: users.filter((u) => u.role === "admin").length,
      totalSheets,
      pendingSheets,
      resolvedSheets,
      selectedYearSheets: rowsInYear.length,
      selectedYearResolved: resolvedInYear.length,
    },
    year,
    availableYears: yearOptions(currentYear),
    users,
    sheetsPerMonth: Array.from(sheetsPerMonthMap.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month)),
    sheetsPerUser: Array.from(sheetsPerUserMap.entries())
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count),
    sheetsPerUserByMonth: Array.from(sheetsPerUserByMonthMap.entries())
      .map(([key, count]) => {
        const [userId, month] = key.split(":");
        return { userId: Number(userId), month, count };
      })
      .sort((a, b) => a.month.localeCompare(b.month)),
    resolvedByUser: Array.from(resolvedByUserMap.entries())
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count),
    resolvedByUserByMonth: Array.from(resolvedByUserByMonthMap.entries())
      .map(([key, count]) => {
        const [userId, month] = key.split(":");
        return { userId: Number(userId), month, count };
      })
      .sort((a, b) => a.month.localeCompare(b.month)),
  });
}
