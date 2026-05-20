import prisma from "@/app/db";
import { requireSession } from "@/lib/auth/api-auth";
import { NextResponse } from "next/server";
import type { Prisma } from "@/prisma/generated/client";

const ALLOWED_PATCH_FIELDS = [
  "status",
  "rate",
  "problemType",
  "problemDescription",
  "callSim",
  "callNumber",
  "observation",
  "resolvedAt",
  "resolvedById",
  "isSynced",
] as const;

type AllowedPatchField = (typeof ALLOWED_PATCH_FIELDS)[number];

function pickPatchData(
  body: Record<string, unknown>,
): Prisma.CallSheetUpdateInput {
  const data: Prisma.CallSheetUpdateInput = {};

  for (const key of ALLOWED_PATCH_FIELDS) {
    if (!(key in body)) continue;
    const value = body[key as AllowedPatchField];

    if (key === "resolvedAt") {
      data.resolvedAt =
        value === null || value === undefined
          ? null
          : new Date(value as string | number | Date);
      continue;
    }

    if (key === "resolvedById" || key === "rate") {
      (data as Record<string, unknown>)[key] =
        value === null || value === undefined ? null : Number(value);
      continue;
    }

    if (key === "isSynced") {
      data.isSynced = Boolean(value);
      continue;
    }

    (data as Record<string, unknown>)[key] = value;
  }

  return data;
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireSession();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const sheet = await prisma.callSheet.delete({ where: { id: parsedId } });
    return NextResponse.json(sheet);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireSession();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const data = pickPatchData(body);

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const sheet = await prisma.callSheet.update({
      where: { id: parsedId },
      data,
    });

    return NextResponse.json(sheet);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
