import prisma from "@/app/db";
import { requireSession } from "@/lib/auth/api-auth";
import { callSheetNotDeleted } from "@/lib/call-sheet/access";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireSession();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const parsedId = Number(id);
    if (Number.isNaN(parsedId)) {
      return NextResponse.json({ error: "Invalid customer id" }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: parsedId },
      include: {
        _count: {
          select: {
            callSheets: { where: callSheetNotDeleted },
          },
        },
        callSheets: {
          where: callSheetNotDeleted,
          select: {
            id: true,
            status: true,
            problemType: true,
            createdAt: true,
            rate: true,
            user: {
              select: {
                username: true,
              },
            },
            resolvedBy: {
              select: {
                username: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 });
  }
}
