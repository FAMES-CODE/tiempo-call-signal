import { getDashboardStats } from "@/app/services/dashboard.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const stats = await getDashboardStats(Number(session.user.id));

  return Response.json(stats);
}
