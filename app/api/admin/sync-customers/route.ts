import { FirebirdToSQLiteSync } from "@/app/jobs/databases/databse-jobs";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await FirebirdToSQLiteSync();
  return NextResponse.json({ ok: true });
}
