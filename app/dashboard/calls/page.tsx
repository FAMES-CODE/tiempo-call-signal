"use client";
import { DataTable } from "@/components/dashboard/data-table";
import React from "react";

function Page() {
  const [calls, setCalls] = React.useState([]);

  const fetchCases = async () => {
    const res = await fetch(
      process.env.NEXT_PUBLIC_API_BASE_URL + "/api/sheets",
    );
    const data = await res.json();
    console.log(data);
    setCalls(data);
  };
  React.useEffect(() => {
    try {
      fetchCases();
    } catch (error) {
      console.log(error);
    }
  }, []);
  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Calls List</h1>
      </div>
      <DataTable
        columns={[
          { accessorKey: "id", header: "ID" },
          { accessorKey: "customer.CLIENT", header: "Customer" },
          { accessorKey: "callNumber", header: "Customer Number" },
          { accessorKey: "callSim", header: "Called on" },
          { accessorKey: "problemType", header: "Problem Type" },
          { accessorKey: "user.username", header: "Created by" },
          { accessorKey: "status", header: "Status" },
        ]}
        data={calls}
      />
    </div>
  );
}

export default Page;
