import { NextResponse } from "next/server";
import { getCustomersFromFirebird } from "@/lib/firebird-db/customers-actions";
import { requireSession } from "@/lib/auth/api-auth";

export async function GET() {
  const auth = await requireSession();
  if (auth.error) return auth.error;

  try {
    const customers = await getCustomersFromFirebird();
    return NextResponse.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}