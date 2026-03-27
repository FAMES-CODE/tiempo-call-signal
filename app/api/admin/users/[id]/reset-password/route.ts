import prisma from "@/app/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

function generateTemporaryPassword() {
  return `Tmp-${Math.random().toString(36).slice(2, 10)}!`;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const parsedId = Number.parseInt(id, 10);
  if (!Number.isFinite(parsedId)) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  const payload = await request.json().catch(() => ({}));
  const nextPasswordRaw =
    typeof payload?.newPassword === "string" && payload.newPassword.trim().length > 0
      ? payload.newPassword.trim()
      : generateTemporaryPassword();

  if (nextPasswordRaw.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({
    where: { id: parsedId },
    select: { id: true, username: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const hashedPassword = await bcrypt.hash(nextPasswordRaw, 10);
  await prisma.user.update({
    where: { id: parsedId },
    data: {
      password: hashedPassword,
      mustChangePassword: true,
    },
  });

  return NextResponse.json({
    ok: true,
    userId: parsedId,
    username: existing.username,
    temporaryPassword: nextPasswordRaw,
    mustChangePassword: true,
  });
}
