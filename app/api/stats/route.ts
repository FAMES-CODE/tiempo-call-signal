import { getDashboardStats } from "@/app/services/dashboard.service";

export async function GET() {
  const stats = await getDashboardStats();

  return Response.json(stats);
}
