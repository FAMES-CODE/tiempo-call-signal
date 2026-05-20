import { NextResponse } from "next/server";
import { syncCustomers } from "@/lib/firebird-db/customers-actions";
import { requireAdmin } from "@/lib/auth/api-auth";

export async function POST() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

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


