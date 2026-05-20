import prisma from "@/app/db";
import { requireAdmin } from "@/lib/auth/api-auth";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
type Params = {
  params: Promise<{ id: string }>;
};



export async function POST(request: Request, { params }: Params) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const userId = Number(id);
    if (!Number.isFinite(userId)) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      newPassword?: string;
    };

    // Generate a temporary password if not provided
    const temporaryPassword =
      body.newPassword && body.newPassword.trim().length >= 4
        ? body.newPassword.trim()
        : `Temp-${Math.random().toString(36).slice(2, 8)}`;

    const hash = await bcrypt.hash(temporaryPassword, 10);

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        password: hash,
        mustChangePassword: true,
      },
    });

    return NextResponse.json({
      id: user.id,
      username: user.username,
      temporaryPassword,
    });
  } catch (error) {
    console.error("Error resetting password via admin endpoint:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 },
    );
  }
}


