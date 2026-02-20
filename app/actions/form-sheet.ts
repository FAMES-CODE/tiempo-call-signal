"use server";

import prisma from "@/app/db";
import { FormSheetT } from "@/lib/schemas/formsheetSchema";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function createFormSheet(data: FormSheetT) {
  const session = await getServerSession(authOptions);

  try {
    await prisma.callSheet.create({
      data: {
        date: new Date(),
        status: data.status,
        problemType: data.problemType,
        problemDescription: data.problemDescription,
        callSim: data.callSim,
        callNumber: data.callNumber,
        observation: data.observation,
        user: { connect: { id: Number(session?.user.id) } },
        customer: { connect: { id: data.customerId } },
      },
    });
  } catch (e) {
    console.log(e);
  }
}
