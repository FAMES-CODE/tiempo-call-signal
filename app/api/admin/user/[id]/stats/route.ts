import prisma from "@/app/db";
import { NextResponse } from "next/server";

type Params = {
  params: Promise<{ id: string }>;
};

function dayKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function yearMonthKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const userId = Number(id);
    if (!Number.isFinite(userId)) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, role: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const sheets = await prisma.callSheet.findMany({
      where: { createdById: userId },
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
      },
    });

    const perMonthBucket: Record<string, number> = {};
    for (const sheet of sheets) {
      const ym = yearMonthKey(sheet.createdAt);
      perMonthBucket[ym] = (perMonthBucket[ym] ?? 0) + 1;
    }
    const perMonth = Object.entries(perMonthBucket)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, count]) => ({ key, count }));

    const perDayBucket: Record<string, number> = {};
    for (const sheet of sheets) {
      const key = dayKey(sheet.createdAt);
      perDayBucket[key] = (perDayBucket[key] ?? 0) + 1;
    }
    const perDay = Object.entries(perDayBucket)
      .sort(([a], [b]) => (a < b ? 1 : -1))
      .map(([day, count]) => ({ day, count }));

    return NextResponse.json({
      user,
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
