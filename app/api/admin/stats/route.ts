import prisma from "@/app/db";
import { NextResponse } from "next/server";

function getYearFromSearchParams(searchParams: URLSearchParams): number {
  const raw = searchParams.get("year");
  const parsed = raw ? Number(raw) : NaN;
  const current = new Date().getFullYear();
  return Number.isNaN(parsed) || parsed < 2000 || parsed > current + 1
    ? current
    : parsed;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = getYearFromSearchParams(searchParams);

    // Basic user stats
    const [totalUsers, adminUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "admin" } }),
    ]);

    // Global sheet stats
    const [totalSheets, pendingSheets, resolvedSheets] = await Promise.all([
      prisma.callSheet.count(),
      prisma.callSheet.count({ where: { status: "pending" } }),
      prisma.callSheet.count({ where: { status: "resolved" } }),
    ]);

    // Year-specific stats
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year + 1, 0, 1);

    const [selectedYearSheets, selectedYearResolved] = await Promise.all([
      prisma.callSheet.count({
        where: { createdAt: { gte: startOfYear, lt: endOfYear } },
      }),
      prisma.callSheet.count({
        where: {
          status: "resolved",
          createdAt: { gte: startOfYear, lt: endOfYear },
        },
      }),
    ]);

    // Available years from existing data
    const yearsRaw = await prisma.callSheet.findMany({
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });
    const yearSet = new Set<number>();
    for (const row of yearsRaw) {
      yearSet.add(row.createdAt.getFullYear());
    }
    const availableYears = Array.from(yearSet).sort((a, b) => a - b);

    const MONTH_LABELS = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Load all sheets for the selected year once and aggregate in memory
    const sheetsForYear = await prisma.callSheet.findMany({
      where: { createdAt: { gte: startOfYear, lt: endOfYear } },
      select: {
        id: true,
        createdAt: true,
        createdById: true,
        status: true,
        resolvedAt: true,
        resolvedById: true,
      },
    });

    // Sheets per month for selected year
    const monthBuckets: Record<number, number> = {};
    for (const sheet of sheetsForYear) {
      const m = sheet.createdAt.getMonth() + 1;
      monthBuckets[m] = (monthBuckets[m] ?? 0) + 1;
    }
    const sheetsPerMonth = Object.entries(monthBuckets)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([monthNum, count]) => {
        const idx = Number(monthNum) - 1;
        return {
          month: MONTH_LABELS[idx] ?? String(monthNum),
          count,
        };
      });

    // Users list
    const users = await prisma.user.findMany({
      select: { id: true, username: true, role: true },
      orderBy: { username: "asc" },
    });

    // Sheets per user (all time)
    const sheetsPerUserRaw = await prisma.callSheet.groupBy({
      by: ["createdById"],
      _count: { id: true },
    });
    const sheetsPerUser = sheetsPerUserRaw.map((row) => ({
      userId: row.createdById,
      count: row._count.id,
    }));

    // Sheets per user per month for selected year
    const userMonthBuckets: Record<string, number> = {};
    for (const sheet of sheetsForYear) {
      const m = sheet.createdAt.getMonth() + 1;
      const key = `${sheet.createdById}:${m}`;
      userMonthBuckets[key] = (userMonthBuckets[key] ?? 0) + 1;
    }
    const sheetsPerUserByMonth = Object.entries(userMonthBuckets).map(
      ([key, count]) => {
        const [userIdStr, monthStr] = key.split(":");
        const monthNum = Number(monthStr);
        return {
          userId: Number(userIdStr),
          month: MONTH_LABELS[monthNum - 1] ?? monthStr,
          count,
        };
      },
    );

    // Resolved by user (all time)
    const resolvedByUserRaw = await prisma.callSheet.groupBy({
      by: ["resolvedById"],
      where: { status: "resolved", resolvedById: { not: null } },
      _count: { id: true },
    });
    const resolvedByUser = resolvedByUserRaw.map((row) => ({
      userId: row.resolvedById as number,
      count: row._count.id,
    }));

    // Resolved by user per month (selected year by resolvedAt)
    const resolvedForYear = sheetsForYear.filter(
      (s) => s.status === "resolved" && s.resolvedAt && s.resolvedById,
    );
    const resolvedMonthBuckets: Record<string, number> = {};
    for (const sheet of resolvedForYear) {
      const m = sheet.resolvedAt!.getMonth() + 1;
      const key = `${sheet.resolvedById}:${m}`;
      resolvedMonthBuckets[key] = (resolvedMonthBuckets[key] ?? 0) + 1;
    }
    const resolvedByUserByMonth = Object.entries(resolvedMonthBuckets).map(
      ([key, count]) => {
        const [userIdStr, monthStr] = key.split(":");
        const monthNum = Number(monthStr);
        return {
          userId: Number(userIdStr),
          month: MONTH_LABELS[monthNum - 1] ?? monthStr,
          count,
        };
      },
    );

    const response = {
      overview: {
        totalUsers,
        totalAdmins: adminUsers,
        totalSheets,
        pendingSheets,
        resolvedSheets,
        selectedYearSheets,
        selectedYearResolved,
      },
      year,
      availableYears: availableYears.length ? availableYears : [year],
      users,
      sheetsPerMonth,
      sheetsPerUser,
      sheetsPerUserByMonth,
      resolvedByUser,
      resolvedByUserByMonth,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in /api/admin/stats:", error);
    return NextResponse.json(
      { error: "Failed to load admin statistics" },
      { status: 500 },
    );
  }
}

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

