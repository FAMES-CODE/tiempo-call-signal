import { NextResponse } from "next/server";
import { createBon1 } from "@/lib/firebird-db/bon-actions";
import { requireSession } from "@/lib/auth/api-auth";

export async function POST(req: Request) {
  const auth = await requireSession();
  if (auth.error) return auth.error;

  try {
    const body = (await req.json().catch(() => ({}))) as {
      numBon?: string;
    };

    const numBon = (body.numBon ?? "BON1").trim();
    if (!numBon) {
      return NextResponse.json({ error: "numBon is required" }, { status: 400 });
    }

    const created = await createBon1(numBon);
    return NextResponse.json(created, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error && error.code === "BON_ALREADY_EXISTS") {
      return NextResponse.json({ error: String(error.message) }, { status: 409 });
    }
    console.error("Error creating BON1:", error);
    return NextResponse.json({ error: "Failed to create BON1" }, { status: 500 });
  }
}

