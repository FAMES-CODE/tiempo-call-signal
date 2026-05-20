import prisma from "@/app/db";
import { requireSession } from "@/lib/auth/api-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireSession();
  if (auth.error) return auth.error;

  const sheets = await prisma.callSheet.findMany({
    include: {
      customer: true,
      user: {
        select: { username: true, id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(sheets);
}
