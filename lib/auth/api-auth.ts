import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";

type AuthSuccess = { session: Session; error: null };
type AuthFailure = { session: null; error: NextResponse };

export async function requireSession(): Promise<AuthSuccess | AuthFailure> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      session: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { session, error: null };
}

export async function requireAdmin(): Promise<AuthSuccess | AuthFailure> {
  const auth = await requireSession();
  if (auth.error) return auth;

  if (auth.session.user.role !== "admin") {
    return {
      session: null,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return auth;
}
