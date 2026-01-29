import SummaryCard from "@/components/dashboard/index/left-section/summary-card";
import StatisticsCard from "@/components/dashboard/index/right-section/statistics-card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

function Page() {
  return (
    <div className="grid grid-cols-2 p-4 gap-8">
      <SummaryCard />

      <StatisticsCard />
    </div>
  );
}

export default Page;
