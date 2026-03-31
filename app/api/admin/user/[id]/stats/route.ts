import prisma from "@/app/db";
import { NextResponse } from "next/server";

function parseYear(searchParams: URLSearchParams): number {
  const raw = searchParams.get("year");
  const parsed = raw ? Number(raw) : NaN;
  const current = new Date().getFullYear();
  return Number.isNaN(parsed) || parsed < 2000 || parsed > current + 1 ? current : parsed;
}

type Params = {
  params: Promise<{ id: string }>;
};

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

function dayKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const userId = Number(id);
    if (!Number.isFinite(userId)) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const year = parseYear(searchParams);
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year + 1, 0, 1);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, role: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get available years for this user's created call sheets
    const yearsRaw = await prisma.callSheet.findMany({
      where: { createdById: userId },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });
    const yearSet = new Set<number>();
    for (const row of yearsRaw) {
      yearSet.add(row.createdAt.getFullYear());
    }
    const availableYears = Array.from(yearSet).sort((a, b) => a - b);

    // Load all sheets created by this user for the selected year
    const sheets = await prisma.callSheet.findMany({
      where: { createdById: userId, createdAt: { gte: startOfYear, lt: endOfYear } },
      select: {
        id: true,
        status: true,
        createdAt: true,
        resolvedAt: true,
        resolvedById: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const total = sheets.length;
    const pending = sheets.filter((s) => s.status === "pending").length;
    const resolved = sheets.filter((s) => s.status === "resolved").length;

    const resolvedByThisUser = await prisma.callSheet.count({
      where: {
        status: "resolved",
        resolvedById: userId,
        resolvedAt: { gte: startOfYear, lt: endOfYear },
      },
    });

    // Per month buckets
    const perMonthBucket: Record<number, number> = {};
    for (const sheet of sheets) {
      const m = sheet.createdAt.getMonth() + 1;
      perMonthBucket[m] = (perMonthBucket[m] ?? 0) + 1;
    }
    const perMonth = Object.entries(perMonthBucket)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([monthNum, count]) => ({
        month: MONTH_LABELS[Number(monthNum) - 1] ?? String(monthNum),
        count,
      }));

    // Per day buckets (YYYY-MM-DD)
    const perDayBucket: Record<string, number> = {};
    for (const sheet of sheets) {
      const key = dayKey(sheet.createdAt);
      perDayBucket[key] = (perDayBucket[key] ?? 0) + 1;
    }
    const perDay = Object.entries(perDayBucket)
      .sort(([a], [b]) => (a < b ? 1 : -1)) // newest first
      .map(([day, count]) => ({ day, count }));

    return NextResponse.json({
      user,
      year,
      availableYears: availableYears.length ? availableYears : [year],
      overview: {
        total,
        pending,
        resolved,
        resolvedByThisUser,
      },
      perMonth,
      perDay,
    });
  } catch (error) {
    console.error("Error in /api/admin/user/[id]/stats:", error);
    return NextResponse.json(
      { error: "Failed to load user statistics" },
      { status: 500 },
    );
  }
}

