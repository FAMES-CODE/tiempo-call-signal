import prisma from "@/app/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();
  if (!data.username || !data.password) {
    return new Response("Username and password are required", { status: 400 });
  }
  if (data.password.length < 8) {
    return new Response("Password must be at least 8 characters long", {
      status: 400,
    });
  }
  if (data.password === data.confirmPassword) {
    const existingUser = await prisma.user.findUnique({
      where: { username: data.username },
    });
    if (existingUser) {
      return new Response(JSON.stringify({ message: "User already exists" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        username: data.username,
        password: hashedPassword,
      },
      omit: { password: true },
    });
    return NextResponse.json(user);
  } else {
    return new Response("Passwords do not match", { status: 400 });
  }
}
