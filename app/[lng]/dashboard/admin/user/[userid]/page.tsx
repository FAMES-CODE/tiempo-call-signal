import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import AdminUserPageView from "@/components/dashboard/admin/admin-user-page-view";

export default async function Page({
  params,
}: {
  params: Promise<{ userid: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const { userid } = await params;
  return <AdminUserPageView userId={userid} />;
}

