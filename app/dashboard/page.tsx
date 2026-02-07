"use client";

import SummaryCard from "@/components/dashboard/index/left-section/summary-card";
import StatisticsCard from "@/components/dashboard/index/right-section/statistics-card";


function Page() {
  return (
    <div className="grid grid-cols-2  gap-8">
      <SummaryCard />
      <StatisticsCard />
    </div>
  );
}

export default Page;
