import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcrypt";
import prisma from "@/app/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ChangePasswordSchema } from "@/lib/schemas/authSchema";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const rateLimited = enforceRateLimit(req, { tier: "heavyWrite" });
  if (rateLimited) return rateLimited;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = ChangePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { currentPassword, newPassword } = parsed.data;
  const userId = Number(session.user.id);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const ok = await bcrypt.compare(currentPassword, user.password);
  if (!ok) {
    return NextResponse.json(
      { error: "Current password is incorrect" },
      { status: 400 },
    );
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashed,
      mustChangePassword: false,
    },
  });

  return NextResponse.json({ success: true });
}
