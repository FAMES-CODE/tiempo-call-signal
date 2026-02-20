"use client";

import SummaryCard from "@/components/dashboard/index/left-section/summary-card";
import StatisticsCard from "@/components/dashboard/index/right-section/statistics-card";
import { useSession } from "next-auth/react";

function Page() {
  const session = useSession();
  if (session.status === "loading") {
    return <div>Loading...</div>;
  }
  return (
    <div className="grid grid-cols-2  gap-8">
      <SummaryCard />
      <StatisticsCard />
    </div>
  );
}

export default Page;
