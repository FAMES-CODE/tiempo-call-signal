import prisma from "@/app/db";

export async function GET(request: Request) {
  const users = await prisma.user.findMany();
  return new Response(JSON.stringify(users));
}

export async function POST(request: Request) {
    const data = await request.json();
    const user = await prisma.user.create({ data });
    return new Response(JSON.stringify(user));
}
