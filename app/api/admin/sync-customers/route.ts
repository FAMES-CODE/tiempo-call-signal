import { NextResponse } from "next/server";
import { syncCustomers } from "@/lib/firebird-db/customers-actions";

export async function POST() {
  try {
    await syncCustomers();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error syncing customers from admin endpoint:", error);
    return NextResponse.json(
      { error: "Failed to sync customers" },
      { status: 500 },
    );
  }
}


