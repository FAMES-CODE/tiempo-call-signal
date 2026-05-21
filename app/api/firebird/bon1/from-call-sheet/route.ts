import { NextResponse } from "next/server";
import prisma from "@/app/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getCallSheetIfAccessible } from "@/lib/call-sheet/access";
import {
  createBon1ForCallSheet,
  insertBon2Line,
  type Bon2LineInput,
} from "@/lib/firebird-db/bon-actions";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.username) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      callSheetId?: number;
      observation?: string;
      lines?: Bon2LineInput[];
    };

    const callSheetId = Number(body.callSheetId);
    if (!Number.isFinite(callSheetId) || callSheetId <= 0) {
      return NextResponse.json(
        { error: "Invalid callSheetId" },
        { status: 400 },
      );
    }

    const access = await getCallSheetIfAccessible(session, callSheetId);
    if (!access) {
      return NextResponse.json(
        { error: "Call sheet not found" },
        { status: 404 },
      );
    }

    const sheet = await prisma.callSheet.findUnique({
      where: { id: callSheetId },
      include: { customer: true, user: { select: { username: true } } },
    });

    if (!sheet) {
      return NextResponse.json(
        { error: "Call sheet not found" },
        { status: 404 },
      );
    }

    if (sheet.status !== "resolved") {
      return NextResponse.json(
        { error: "The call sheet must be resolved before synchronization" },
        { status: 409 },
      );
    }

    const codeClient = sheet.customer?.CODE_CLIENT;
    if (!codeClient) {
      return NextResponse.json(
        { error: "The client has no CODE_CLIENT" },
        { status: 400 },
      );
    }

    const created = await createBon1ForCallSheet({
      callSheetId,
      codeClient,
      utilisateur: session.user.username,
      observation: body.observation,
    });

    const lines = Array.isArray(body.lines) ? body.lines : [];
    if (!created.alreadyExisted && lines.length > 0) {
      for (const line of lines) {
        await insertBon2Line(created.num_bon, line);
      }
    }

    await prisma.callSheet.update({
      where: { id: callSheetId },
      data: { isSynced: true },
    });

    return NextResponse.json(
      {
        ...created,
        linesInserted: created.alreadyExisted ? 0 : lines.length,
      },
      { status: created.alreadyExisted ? 200 : 201 },
    );
  } catch (error) {
    console.error("Error creating BON1 from call sheet:", error);
    const message =
      error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { error: "Failed to create BON1 from call sheet", details: message },
      { status: 500 },
    );
  }
}

