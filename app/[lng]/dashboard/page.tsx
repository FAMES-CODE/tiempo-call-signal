"use client";

import DashboardHome from "@/components/dashboard/dashboard-home";
import DashboardSkeleton from "@/components/dashboard/dashboard-skeleton";
import { useSession } from "next-auth/react";

function Page() {
  const session = useSession();
  if (session.status === "loading") {
    return <DashboardSkeleton />;
  }
  return <DashboardHome />;
}

export default Page;
