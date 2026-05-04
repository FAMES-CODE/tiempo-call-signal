"use server";
import prisma from "../../../app/db";
import { Prisma } from "../../../prisma/generated/client";

const toUpperKeys = (obj: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k.toUpperCase(), v]),
  );

export async function FirebirdToSQLiteSync() {
  console.log("Syncing customers from Firebird to SQLite...");
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/firebird/getcustomers`,
      {
        method: "GET",
      },
    );

    if (response.ok) {
      const data = await response.json();
      await prisma.$transaction(
        data.map((customer: Record<string, unknown> & { recordid: number }) => {
          const mapped = toUpperKeys(customer) as Prisma.CustomerCreateInput;
          return prisma.customer.upsert({
            where: { RECORDID: customer.recordid },
            update: mapped,
            create: mapped,
          });
        }),
      );
      console.log("Customers synced successfully");
    } else {
      console.error("Failed to sync customers");
    }
  } catch (error) {
    console.error("Error syncing customers:", error);
  }
}
