import prisma from "@/app/db";
import { requireAdmin } from "@/lib/auth/api-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const users = await prisma.user.findMany({
    omit: { password: true },
    orderBy: { username: "asc" },
  });

  return NextResponse.json(users);
}
