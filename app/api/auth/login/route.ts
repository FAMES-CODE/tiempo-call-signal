import prisma from "@/app/db";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  const data = await request.json();
  if (!data.username || !data.password) {
    return new Response(
      JSON.stringify({
        message: "Username and password are required",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }
  const user = await prisma.user.findUnique({
    where: { username: data.username },
  });
  if (!user) {
    return new Response(
      JSON.stringify({
        message: "Invalid username or password",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  } else {
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (isPasswordValid) {
      return new Response(
        JSON.stringify({
          message: "Login successful",
          user: {
            id: user.id,
            username: user.username,
            
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    } else {
      return new Response(
        JSON.stringify({
          message: "Invalid username or password",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
  }
}
