import prisma from "@/app/db";

export async function GET(request: Request) {
  const sheets = await prisma.callSheet.findMany({
    include: {
      customer: true,
      user: {
        select: {username: true},
      },
    },
  });
  return new Response(JSON.stringify(sheets));
}
