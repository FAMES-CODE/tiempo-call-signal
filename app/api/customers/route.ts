import prisma from "@/app/db";
import { callSheetNotDeleted } from "@/lib/call-sheet/access";
import { requireSession } from "@/lib/auth/api-auth";
import { NextResponse } from "next/server";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

function parsePositiveInt(value: string | null, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

export async function GET(request: Request) {
  const auth = await requireSession();
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const page = parsePositiveInt(searchParams.get("page"), 1);
    const limit = Math.min(
      MAX_LIMIT,
      parsePositiveInt(searchParams.get("limit"), DEFAULT_LIMIT),
    );
    const search = searchParams.get("search")?.trim() ?? "";

    const where = search
      ? {
          OR: [
            { CLIENT: { contains: search } },
            { CODE_CLIENT: { contains: search } },
            { CONTACT: { contains: search } },
            { TEL: { contains: search } },
          ],
        }
      : {};

    const skip = (page - 1) * limit;

    const [total, customers, summary] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        select: {
          id: true,
          CLIENT: true,
          CODE_CLIENT: true,
          CONTACT: true,
          TEL: true,
          EMAIL: true,
          ADRESSE: true,
          COMMUNE: true,
          WILAYA: true,
          NOTES: true,
          SOLDE: true,
        },
        orderBy: { CLIENT: "asc" },
        skip,
        take: limit,
      }),
      getCustomersSummary(),
    ]);

    const customerIds = customers.map((c) => c.id);
    const statsByCustomerId = await getCallStatsForCustomers(customerIds);

    const items = customers.map((customer) => {
      const stats = statsByCustomerId.get(customer.id) ?? {
        totalCalls: 0,
        resolvedCalls: 0,
        avgRating: null,
      };

      return {
        ...customer,
        _count: { callSheets: stats.totalCalls },
        resolvedCount: stats.resolvedCalls,
        avgRating: stats.avgRating,
      };
    });

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      summary,
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 },
    );
  }
}

async function getCustomersSummary() {
  const [totalCustomers, totalCalls, totalResolved, ratingAgg] =
    await Promise.all([
      prisma.customer.count(),
      prisma.callSheet.count({ where: callSheetNotDeleted }),
      prisma.callSheet.count({
        where: { ...callSheetNotDeleted, status: "resolved" },
      }),
      prisma.callSheet.aggregate({
        where: { ...callSheetNotDeleted, rate: { gt: 0 } },
        _avg: { rate: true },
        _count: { rate: true },
      }),
    ]);

  const globalAvgRating =
    ratingAgg._count.rate > 0 && ratingAgg._avg.rate != null
      ? ratingAgg._avg.rate
      : null;

  return {
    totalCustomers,
    totalCalls,
    totalResolved,
    globalAvgRating,
  };
}

type CustomerCallStats = {
  totalCalls: number;
  resolvedCalls: number;
  avgRating: number | null;
};

async function getCallStatsForCustomers(
  customerIds: number[],
): Promise<Map<number, CustomerCallStats>> {
  const map = new Map<number, CustomerCallStats>();
  if (customerIds.length === 0) return map;

  const [totalCounts, resolvedCounts, ratingGroups] = await Promise.all([
    prisma.callSheet.groupBy({
      by: ["customerId"],
      where: { ...callSheetNotDeleted, customerId: { in: customerIds } },
      _count: { _all: true },
    }),
    prisma.callSheet.groupBy({
      by: ["customerId"],
      where: {
        ...callSheetNotDeleted,
        customerId: { in: customerIds },
        status: "resolved",
      },
      _count: { _all: true },
    }),
    prisma.callSheet.groupBy({
      by: ["customerId"],
      where: {
        ...callSheetNotDeleted,
        customerId: { in: customerIds },
        rate: { gt: 0 },
      },
      _avg: { rate: true },
      _count: { rate: true },
    }),
  ]);

  for (const id of customerIds) {
    map.set(id, {
      totalCalls: 0,
      resolvedCalls: 0,
      avgRating: null,
    });
  }

  for (const row of totalCounts) {
    const entry = map.get(row.customerId)!;
    entry.totalCalls = row._count._all;
  }

  for (const row of resolvedCounts) {
    const entry = map.get(row.customerId)!;
    entry.resolvedCalls = row._count._all;
  }

  for (const row of ratingGroups) {
    const entry = map.get(row.customerId)!;
    if (row._count.rate > 0 && row._avg.rate != null) {
      entry.avgRating = row._avg.rate;
    }
  }

  return map;
}
