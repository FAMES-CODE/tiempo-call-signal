import prisma from "@/app/db";
import { NextResponse } from "next/server";


export async function GET() {
    try {
        const customers = await prisma.customer.findMany();
        return NextResponse.json(customers);
    } catch (error) {
        console.error("Error fetching customers:", error);
        return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
    }
}

