import type { Session } from "next-auth";

import prisma from "@/app/db";

export const callSheetNotDeleted = { isDelete: false } as const;

export function isCallSheetAdmin(session: Session): boolean {
  return session.user.role === "admin";
}

export function getSessionUserId(session: Session): number {
  return Number(session.user.id);
}

export function getCallSheetListWhere(session: Session) {
  if (isCallSheetAdmin(session)) {
    return callSheetNotDeleted;
  }
  return {
    ...callSheetNotDeleted,
    createdById: getSessionUserId(session),
  };
}

export function canModifyCallSheet(
  session: Session,
  sheet: { createdById: number },
): boolean {
  return (
    isCallSheetAdmin(session) ||
    getSessionUserId(session) === sheet.createdById
  );
}

export async function getCallSheetIfAccessible(session: Session, id: number) {
  const sheet = await prisma.callSheet.findFirst({
    where: { id, ...callSheetNotDeleted },
    select: { id: true, createdById: true, status: true },
  });
  if (!sheet || !canModifyCallSheet(session, sheet)) {
    return null;
  }
  return sheet;
}
