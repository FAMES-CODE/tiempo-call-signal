"use server";

import prisma from "@/app/db";
import { FormSheetT } from "@/lib/schemas/formsheetSchema";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "../api/auth/[...nextauth]/route";

export type CreateFormSheetResult =
  | { success: true }
  | { success: false; error: string };

export default async function createFormSheet(data: FormSheetT): Promise<CreateFormSheetResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { success: false, error: "You must be signed in to create a call sheet." };
  }

  try {
    await prisma.callSheet.create({
      data: {
        status: data.status ?? "pending",
        problemType: data.problemType,
        problemDescription: data.problemDescription,
        callSim: data.callSim,
        callNumber: data.callNumber,
        observation: data.observation,
        user: { connect: { id: Number(session.user.id) } },
        customer: { connect: { id: data.customerId } },
      },
    });
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/calls");
    return { success: true };
  } catch (e) {
    console.error("createFormSheet:", e);
    return { success: false, error: "Could not save the call sheet. Please try again." };
  }
}
