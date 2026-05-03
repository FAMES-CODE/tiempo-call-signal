import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import AdminPageView from "@/components/dashboard/admin/admin-page-view";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return <AdminPageView />;
}
