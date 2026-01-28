import CallForm from "@/components/dashboard/index/actions-section/call-form";
import RecallList from "@/components/dashboard/index/actions-section/recall-list";
import { MonthlyData } from "@/components/dashboard/index/charts/monthly-data";

function Page() {
  return (
    <div className="grid grid-cols-2 p-4 gap-8">
      <div className="flex flex-col justify-between w-full gap-4">
        <CallForm />
        <RecallList />
      </div>

      <div className="flex flex-col w-full">
        <h1 className="text-2xl font-bold text-left">Statistics :</h1>
        <MonthlyData />
      </div>
    </div>
  );
}

export default Page;
