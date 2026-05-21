import prisma from "@/app/db";
import { requireSession } from "@/lib/auth/api-auth";
import { getCallSheetListWhere } from "@/lib/call-sheet/access";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireSession();
  if (auth.error) return auth.error;

  const sheets = await prisma.callSheet.findMany({
    where: getCallSheetListWhere(auth.session),
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
